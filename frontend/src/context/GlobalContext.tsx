import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, type User } from "@/lib/api";

interface GlobalContextType {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("cf_user");
    const savedToken = localStorage.getItem("cf_token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const result = await api.login({ email, password });
    setUser(result.user as User);
    setToken(result.token);
    localStorage.setItem("cf_user", JSON.stringify(result.user));
    localStorage.setItem("cf_token", result.token);
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    const result = await api.register({ name, email, password, role });
    setUser(result.user as User);
    setToken(result.token);
    localStorage.setItem("cf_user", JSON.stringify(result.user));
    localStorage.setItem("cf_token", result.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("cf_user");
    localStorage.removeItem("cf_token");
  };

  return (
    <GlobalContext.Provider value={{ user, token, isLoggedIn: !!user, loading, login, register, logout }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error("useGlobal must be used within GlobalProvider");
  return ctx;
};
