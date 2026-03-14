"use client";

import { Sidebar } from "@/components/Sidebar";
import { Provider } from "react-redux";
import store from "@/store/store";
import { useState, useEffect } from "react";
import LoginPage from "@/components/LoginPage";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  if (isLoggedIn === null) {
    return null; // Could add loading spinner here
  }

  return (
    <Provider store={store}>
      {isLoggedIn ? (
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex flex-col flex-1 bg-gray-50">
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </div>
      ) : (
        <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />
      )}
    </Provider>
  );
}
