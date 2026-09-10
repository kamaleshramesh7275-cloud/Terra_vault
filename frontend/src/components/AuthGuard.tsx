"use client";
import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  auth,
  onAuthStateChanged,
  onIdTokenChanged,
  loginWithGoogle as fbLoginWithGoogle,
  loginWithEmail as fbLoginWithEmail,
  registerWithEmail as fbRegisterWithEmail,
  logoutUser as fbLogoutUser,
  FirebaseUser,
  isFirebaseConfigured
} from "../lib/firebase";
import { api } from "../lib/api";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/citizen",
  "/business",
  "/features",
  "/analytics",
  "/state",
  "/map",
  "/records"
];

export interface TerritorialJurisdiction {
  district: string;
  taluk: string;
  firka: string;
  village_code: string;
}

export interface UserContextType {
  user: {
    uid?: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    emailVerified?: boolean;
    username: string;
  } | null;
  username: string;
  role: string;
  jurisdiction: TerritorialJurisdiction;
  permissions: string[];
  isLoading: boolean;
  isFirebaseLive: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const defaultJurisdiction: TerritorialJurisdiction = {
  district: "Coimbatore",
  taluk: "Kinathukadavu",
  firka: "Kinathukadavu Firka",
  village_code: "630401",
};

const AuthContext = createContext<UserContextType>({
  user: null,
  username: "guest",
  role: "CITIZEN",
  jurisdiction: defaultJurisdiction,
  permissions: [],
  isLoading: true,
  isFirebaseLive: false,
  loginWithGoogle: async () => {},
  loginWithEmail: async () => {},
  registerWithEmail: async () => {},
  logout: async () => {},
});

const ROLE_HOME_MAP: Record<string, string> = {
  citizen: "/citizen",
  vao: "/portal/vao",
  ri: "/portal/ri",
  tahsildar: "/portal/tahsildar",
  rdo: "/portal/rdo",
  collector: "/portal/collector",
  district_collector: "/portal/collector",
  admin: "/portal/collector",
  business: "/business",
};

const ROLE_RESTRICTED_PREFIXES: Record<string, string[]> = {
  citizen: ["/portal", "/admin", "/review", "/upload"],
  vao: ["/portal/tahsildar", "/portal/rdo", "/portal/collector", "/admin"],
  ri: ["/portal/tahsildar", "/portal/rdo", "/portal/collector", "/admin"],
  tahsildar: ["/portal/rdo", "/portal/collector", "/admin"],
  rdo: ["/portal/collector", "/admin"],
  business: ["/portal", "/admin", "/review", "/upload"],
};

export function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserContextType["user"]>(null);
  const [role, setRole] = useState("CITIZEN");
  const [jurisdiction, setJurisdiction] = useState<TerritorialJurisdiction>(defaultJurisdiction);
  const [permissions, setPermissions] = useState<string[]>([]);
  const isFirebaseLive = isFirebaseConfigured();

  const syncBackendUser = async (firebaseUser: FirebaseUser | null, fallbackRole?: string) => {
    try {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        localStorage.setItem("tv_token", token);

        // Sync profile with backend
        try {
          const syncRes = await api.syncProfile({
            firebase_uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            display_name: firebaseUser.displayName || undefined,
            avatar_url: firebaseUser.photoURL || undefined,
            email_verified: firebaseUser.emailVerified,
            requested_role: fallbackRole
          });
          if (syncRes?.role) {
            setRole(syncRes.role.toUpperCase());
            localStorage.setItem("tv_role", syncRes.role.toLowerCase());
          }
          if (syncRes?.jurisdiction) {
            setJurisdiction(syncRes.jurisdiction);
          }
          if (syncRes?.permissions) {
            setPermissions(syncRes.permissions);
          }
        } catch {
          // Backend offline or local mode
          const savedRole = fallbackRole || localStorage.getItem("tv_role") || "CITIZEN";
          setRole(savedRole.toUpperCase());
        }

        const uObj = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
          photoURL: firebaseUser.photoURL || undefined,
          emailVerified: firebaseUser.emailVerified,
          username: firebaseUser.email?.split("@")[0] || firebaseUser.uid.substring(0, 8)
        };
        setCurrentUser(uObj);
        localStorage.setItem("tv_user", JSON.stringify(uObj));
      } else {
        // Handle stored local session or persona testing
        const storedToken = localStorage.getItem("tv_token");
        const storedRole = localStorage.getItem("tv_role") || "citizen";
        const storedUser = localStorage.getItem("tv_user");

        if (storedUser) {
          try {
            setCurrentUser(JSON.parse(storedUser));
          } catch {}
        } else if (storedToken) {
          setCurrentUser({
            username: `${storedRole}_official`,
            email: `${storedRole}@terravault.tn.gov.in`,
            displayName: `${storedRole.toUpperCase()} Officer`
          });
        }
        setRole(storedRole.toUpperCase());
      }
    } catch (e) {
      console.error("Auth state synchronization error:", e);
    } finally {
      setIsLoading(false);
      setReady(true);
    }
  };

  useEffect(() => {
    let unsubscribe = () => {};

    if (isFirebaseLive) {
      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        await syncBackendUser(fbUser);
      });
    } else {
      // Offline / Local sandbox mode
      syncBackendUser(null);
    }

    return () => unsubscribe();
  }, [isFirebaseLive]);

  useEffect(() => {
    if (!ready) return;

    const isPublic = PUBLIC_ROUTES.some((r) =>
      r === "/" ? pathname === "/" : pathname === r || pathname.startsWith(`${r}/`)
    );

    const token = localStorage.getItem("tv_token");
    const activeRole = role.toLowerCase();

    if (!isPublic && !token && !currentUser) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    // Role-based route guard
    const restricted = ROLE_RESTRICTED_PREFIXES[activeRole] || [];
    const isRestricted = restricted.some((pfx) => pathname === pfx || pathname.startsWith(`${pfx}/`));
    if (isRestricted) {
      const home = ROLE_HOME_MAP[activeRole] || "/citizen";
      router.replace(home);
      return;
    }
  }, [pathname, ready, role, currentUser, router]);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { user: fbUser, token } = await fbLoginWithGoogle();
      localStorage.setItem("tv_token", token);
      await syncBackendUser(fbUser);
    } catch (err) {
      console.error("Google Auth failed", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const { user: fbUser, token } = await fbLoginWithEmail(email, pass);
      localStorage.setItem("tv_token", token);
      await syncBackendUser(fbUser);
    } catch (err) {
      console.error("Email Login failed", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name?: string) => {
    setIsLoading(true);
    try {
      const { user: fbUser, token } = await fbRegisterWithEmail(email, pass, name);
      localStorage.setItem("tv_token", token);
      await syncBackendUser(fbUser);
    } catch (err) {
      console.error("Registration failed", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (isFirebaseLive) {
        await fbLogoutUser();
      }
    } catch (e) {
      console.error("Firebase logout error:", e);
    } finally {
      localStorage.removeItem("tv_token");
      localStorage.removeItem("tv_user");
      localStorage.removeItem("tv_role");
      setCurrentUser(null);
      setRole("CITIZEN");
      setIsLoading(false);
      router.replace("/login");
    }
  };

  if (!ready && !PUBLIC_ROUTES.includes(pathname)) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        username: currentUser?.username || "guest",
        role,
        jurisdiction,
        permissions,
        isLoading,
        isFirebaseLive,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
