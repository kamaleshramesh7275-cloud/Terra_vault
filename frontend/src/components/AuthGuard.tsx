"use client";
import { useEffect, useState, createContext, useContext } from "react";
import { usePathname, useRouter } from "next/navigation";

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

interface UserContextType {
  username: string;
  role: string;
  logout: () => void;
}

const AuthContext = createContext<UserContextType>({
  username: "guest",
  role: "viewer",
  logout: () => {},
});

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<{ username: string; role: string }>({
    username: "guest",
    role: "viewer",
  });

  const logout = () => {
    localStorage.removeItem("tv_token");
    localStorage.removeItem("tv_user");
    localStorage.removeItem("tv_role");
    router.replace("/login");
  };

  useEffect(() => {
    const isPublic = PUBLIC_ROUTES.some((r) =>
      r === "/" ? pathname === "/" : pathname === r || pathname.startsWith(`${r}/`)
    );

    const token = localStorage.getItem("tv_token");
    const storedRole = localStorage.getItem("tv_role") || "viewer";
    const storedUser = localStorage.getItem("tv_user");
    let activeUser = { username: "guest", role: storedRole };

    if (storedUser) {
      try {
        activeUser = JSON.parse(storedUser);
      } catch {}
    } else if (storedRole && storedRole !== "viewer") {
      activeUser = { username: `${storedRole}_official`, role: storedRole };
    }
    setUser(activeUser);

    if (!isPublic && !token) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else {
      setReady(true);
    }
  }, [pathname, router]);

  if (!ready) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ username: user.username, role: user.role, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
