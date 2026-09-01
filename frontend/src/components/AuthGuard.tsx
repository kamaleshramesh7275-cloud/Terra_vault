"use client";
import { useEffect, useState, createContext, useContext } from "react";
import { usePathname, useRouter } from "next/navigation";

const PUBLIC_ROUTES = ["/login", "/citizen"];

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
    router.replace("/login");
  };

  useEffect(() => {
    const isPublic = PUBLIC_ROUTES.some(
      (r) => pathname === r || pathname.startsWith(`${r}/`)
    );

    const token = localStorage.getItem("tv_token");
    const storedUser = localStorage.getItem("tv_user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {}
    }

    if (!isPublic && !token) {
      router.replace("/login");
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
