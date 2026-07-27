"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { App } from "@capacitor/app";

// Takes over the Android hardware back button so it navigates
// using Next.js's router (fresh, current page) instead of the
// WebView's native history stack (which can show stale cached
// pages). On the dashboard/home route, back exits the app instead
// of going to a blank or stale screen.
export default function BackButtonHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const listener = App.addListener("backButton", () => {
      const isHomeRoute =
        pathname === "/" || pathname === "/dashboard";

      if (isHomeRoute) {
        App.exitApp();
      } else {
        router.back();
      }
    });

    return () => {
      listener.then((handle) => handle.remove());
    };
  }, [pathname, router]);

  return null;
}
