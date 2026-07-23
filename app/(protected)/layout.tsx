"use client";

import { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { usePathname, useRouter } from "next/navigation";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

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

  const router = useRouter();
  const pathname = usePathname();

  // Prevent body scrolling while mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Android Back Button Handling
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let lastBackPress = 0;

    let listener: { remove: () => void } | undefined;

   App.addListener("backButton", ({ canGoBack }) => {
      // Exit app only on Dashboard
      if (pathname === "/dashboard") {
        const now = Date.now();

        if (now - lastBackPress < 2000) {
          App.exitApp();
        } else {
          lastBackPress = now;
          alert("Press back again to exit");
        }

        return;
      }

      // Navigate back on all other pages
      router.back();
    }).then((l) => {
      listener = l;
    });

    return () => {
      listener?.remove();
    };
  }, [pathname, router]);

  // Swipe gestures
  const handlers = useSwipeable({
    onSwipedRight: ({ initial }) => {
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
            toggleSidebar={() => setCollapsed((prev) => !prev)}
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