"use client";

import { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";

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

  // Prevent body scrolling while mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Swipe gestures
  const handlers = useSwipeable({
    onSwipedRight: ({ initial }) => {
      // Only open when swipe starts near the left edge
      if (initial[0] < 30) {
        setMobileOpen(true);
      }
    },

    onSwipedLeft: () => {
      setMobileOpen(false);
    },

    trackTouch: true,
    preventScrollOnSwipe: false,
  });

  return (
    <ProtectedRoute>
      <div
        {...handlers}
        className="flex min-h-screen bg-slate-100"
      >
        {/* Desktop Sidebar */}
        <Sidebar collapsed={collapsed} />

        {/* Mobile Sidebar */}
        <MobileSidebar
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        {/* Backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex flex-1 flex-col">

          <Navbar
            collapsed={collapsed}
            toggleSidebar={() =>
              setCollapsed((prev) => !prev)
            }
            onMenuClick={() => setMobileOpen(true)}
          />

          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>

        </div>
      </div>
    </ProtectedRoute>
  );
}