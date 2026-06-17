"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedAuth = localStorage.getItem("gymAuth");
    if (storedAuth) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (userId, password) => {
    // Simple authentication - in production, validate against a server
    if (userId && password && password.length >= 6) {
      localStorage.setItem("gymAuth", JSON.stringify({ userId, timestamp: Date.now() }));
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("gymAuth");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
