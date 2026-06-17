"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { ProtectedRoute } from "./ProtectedRoute";

export function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <ProtectedRoute>
      {isLoginPage ? (
        children
      ) : (
        <div className="main-layout" suppressHydrationWarning>
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
      )}
    </ProtectedRoute>
  );
}
