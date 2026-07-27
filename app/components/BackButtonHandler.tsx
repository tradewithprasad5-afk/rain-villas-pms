"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Toast } from "@capacitor/toast";

export default function BackButtonHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const lastBackPress = useRef(0);

  useEffect(() => {
    // Only run in the native Android/iOS app
    if (!Capacitor.isNativePlatform()) return;

    const setupListener = async () => {
      const listener = await App.addListener("backButton", async () => {
        // Change this if your dashboard route is different
        const isHomeRoute =
          pathname === "/" || pathname === "/dashboard";

        if (isHomeRoute) {
          const now = Date.now();

          if (now - lastBackPress.current < 2000) {
            await App.exitApp();
          } else {
            lastBackPress.current = now;

            await Toast.show({
              text: "Press back again to exit",
              duration: "short",
            });
          }

          return;
        }

        router.back();
      });

      return listener;
    };

    let listener: Awaited<ReturnType<typeof setupListener>>;

    setupListener().then((l) => {
      listener = l;
    });

    return () => {
      listener?.remove();
    };
  }, [pathname, router]);

  return null;
}