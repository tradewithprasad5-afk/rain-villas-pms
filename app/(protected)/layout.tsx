"use client";

import { useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import MobileSidebar from "../components/MobileSidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-slate-100">
        {/* Desktop Sidebar */}
        <Sidebar collapsed={collapsed} />

        {/* Mobile Sidebar */}
        <MobileSidebar
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          {/* Top Navbar */}
          <Navbar
            collapsed={collapsed}
            toggleSidebar={() => setCollapsed((prev) => !prev)}
            onMenuClick={() => setMobileOpen(true)}
          />

          {/* Page Content */}
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}