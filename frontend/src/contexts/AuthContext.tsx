import React, { createContext, useContext, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: "Manager" | "Staff";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: "Manager" | "Staff") => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("core_inventory_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const data = response.data;
      
      const u: User = { 
        id: data.access_token,
        name: data.user_name || "User", 
        email: data.user_email || email, 
        role: data.user_role || "Staff" 
      };
      
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("core_inventory_user", JSON.stringify(u));
      setUser(u);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Login failed");
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string, role: "Manager" | "Staff") => {
    try {
      await api.post("/auth/signup", { name, email, password, role });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Signup failed");
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("core_inventory_user");
    setUser(null);
  }, []);

  const updateProfile = useCallback((data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem("core_inventory_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
