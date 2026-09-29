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
import { ShieldAlert, ArrowLeft, RefreshCw, Lock, MapPin, Building2 } from "lucide-react";
import Link from "next/link";

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

export const ROLE_HOME_MAP: Record<string, string> = {
  citizen: "/citizen",
  vao: "/portal/vao",
  ri: "/portal/ri",
  tahsildar: "/portal/tahsildar",
  rdo: "/portal/rdo",
  collector: "/portal/collector",
  district_collector: "/portal/collector",
  admin: "/admin",
  business: "/business",
};

export const ROLE_RESTRICTED_PREFIXES: Record<string, string[]> = {
  citizen: ["/portal", "/admin", "/review", "/upload"],
  vao: ["/portal/ri", "/portal/tahsildar", "/portal/rdo", "/portal/collector", "/admin", "/business"],
  ri: ["/portal/vao", "/portal/tahsildar", "/portal/rdo", "/portal/collector", "/admin", "/business"],
  tahsildar: ["/portal/vao", "/portal/ri", "/portal/rdo", "/portal/collector", "/admin", "/business"],
  rdo: ["/portal/vao", "/portal/ri", "/portal/tahsildar", "/portal/collector", "/admin", "/business", "/upload"],
  collector: ["/portal/vao", "/portal/ri", "/portal/tahsildar", "/portal/rdo", "/business"],
  district_collector: ["/portal/vao", "/portal/ri", "/portal/tahsildar", "/portal/rdo", "/business"],
  business: ["/portal", "/admin", "/review", "/upload"],
  admin: []
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
  const [accessDenied, setAccessDenied] = useState<boolean>(false);
  const isFirebaseLive = isFirebaseConfigured();

  const syncBackendUser = async (firebaseUser: FirebaseUser | null, fallbackRole?: string) => {
    try {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        localStorage.setItem("tv_token", token);

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
            email: `${storedRole}@terravault.gov.in`,
            displayName: `${storedRole.toUpperCase()} Official`
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
      syncBackendUser(null);
    }

    return () => unsubscribe();
  }, [isFirebaseLive]);

  useEffect(() => {
    if (!ready) return;

    const isPublic = PUBLIC_ROUTES.some((r) =>
      r === "/" ? pathname === "/" : pathname === r || pathname.startsWith(`${r}/`)
    );

    const token = typeof window !== "undefined" ? localStorage.getItem("tv_token") : null;
    const activeRole = (localStorage.getItem("tv_role") || role).toLowerCase();

    if (!isPublic && !token && !currentUser) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    // Role-based route guard check
    const restricted = ROLE_RESTRICTED_PREFIXES[activeRole] || [];
    const isRestricted = restricted.some((pfx) => pathname === pfx || pathname.startsWith(`${pfx}/`));

    if (isRestricted) {
      setAccessDenied(true);
    } else {
      setAccessDenied(false);
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
      setAccessDenied(false);
      setIsLoading(false);
      router.replace("/login");
    }
  };

  if (!ready && !PUBLIC_ROUTES.includes(pathname)) {
    return null;
  }

  // Institutional 403 Statutory Access Restriction Screen
  if (accessDenied) {
    const activeRoleKey = role.toUpperCase();
    const assignedHome = ROLE_HOME_MAP[role.toLowerCase()] || "/citizen";

    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-xl border border-slate-300 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-800 to-red-950 p-6 text-white flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-red-700/80 border border-red-500/50 flex items-center justify-center shrink-0 shadow-inner">
              <ShieldAlert className="h-7 w-7 text-red-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-red-900 border border-red-700 text-[11px] font-bold uppercase tracking-wider text-red-200">
                  403 Statutory Restriction
                </span>
                <span className="text-xs text-red-200">DILRMP RBAC Engine</span>
              </div>
              <h1 className="text-lg font-bold text-white mt-1">
                Statutory Authority Limit Exceeded
              </h1>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <p className="text-sm text-slate-700 leading-relaxed">
              Under the statutory revenue governance framework, your current logged-in role (<strong className="text-slate-900 font-bold">{activeRoleKey}</strong>) does not have executive jurisdiction to access this specific module: <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-900 border border-slate-200 font-mono text-xs">{pathname}</code>.
            </p>

            <div className="rounded-lg bg-amber-50/80 border border-amber-200 p-4 space-y-2 text-xs text-amber-900">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <Lock className="h-4 w-4 text-amber-700" />
                <span>Statutory Jurisdiction Boundary Policy:</span>
              </div>
              <p>
                Each revenue cadre (Citizen, VAO, RI, Tahsildar, RDO, Collector) operates within strictly delegated administrative powers under the Revenue Administration Code. Cross-cadre operations are prohibited to preserve chain-of-custody integrity.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
              <Link
                href={assignedHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-sm transition"
              >
                <Building2 className="h-4 w-4" />
                <span>Go to Your Assigned Portal ({activeRoleKey})</span>
              </Link>

              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition"
              >
                <RefreshCw className="h-4 w-4 text-slate-600" />
                <span>Switch Reviewer Role</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
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
