import React from "react";
import { ReduxProvider } from "../components/providers/ReduxProvider";
import { CartFavoritesSyncProvider } from "../components/providers/CartFavoritesSyncProvider";
import { ThemeProvider } from "../contexts/ThemeContext";
import { SettingsProvider } from "../contexts/SettingsContext";
import { MaintenanceModeChecker } from "../components/MaintenanceModeChecker";
import SessionManager from "../components/SessionManager";
import ToastContainer from "../components/ui/ToastContainer";
import "../styles/globals.css";
import type { Metadata } from "next";

// METADATA
export const metadata: Metadata = {
  title: "LuxeStore - Premium Shopping Experience",
  description: "Your destination for premium products and exceptional shopping experiences. Shop electronics, fashion, wearables, and more.",
  icons: {
    icon: "/favicon.ico",
  },
};

// COMPONENT (Server Component - NO 'use client')
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className="min-h-screen bg-white text-black"
      >
        <ReduxProvider>
          <CartFavoritesSyncProvider>
            <ThemeProvider>
              <SettingsProvider>
                <MaintenanceModeChecker>
                  {children}
                </MaintenanceModeChecker>
                <SessionManager />
                <ToastContainer />
              </SettingsProvider>
            </ThemeProvider>
          </CartFavoritesSyncProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}


