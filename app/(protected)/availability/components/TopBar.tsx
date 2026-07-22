"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../../../lib/firebase";

import {
  Search,
  Bell,
  ChevronDown,
  CalendarDays,
  User,
  Settings,
  LogOut,
} from "lucide-react";

interface TopBarProps {
  month: string;
  year: number;
}

export default function TopBar({
  month,
  year,
}: TopBarProps) {
  const router = useRouter();

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [showProfile, setShowProfile] =
    useState(false);

  const notificationRef =
    useRef<HTMLDivElement>(null);

  const profileRef =
    useRef<HTMLDivElement>(null);

  async function handleLogout() {
    await signOut(auth);
    router.replace("/login");
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target as Node
        )
      ) {
        setShowNotifications(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target as Node
        )
      ) {
        setShowProfile(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200">

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-5 px-6 py-5">

        {/* Left */}

        <div>

          <h1 className="text-3xl font-bold text-slate-800">
            Availability Calendar
          </h1>

          <p className="text-slate-500 mt-1">
            View villa availability and manage bookings
          </p>

        </div>

        {/* Right */}

        <div className="flex flex-wrap items-center gap-4">

          {/* Search */}

          <div className="relative">

            <Search
              className="absolute left-3 top-3 text-slate-400"
              size={18}
            />

            <input
              type="text"
              placeholder="Search bookings..."
              className="pl-10 pr-4 py-2.5 w-72 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          {/* Current Month */}

          <div className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2">

            <CalendarDays
              size={18}
              className="text-blue-600"
            />

            <span className="font-medium">
              {month} {year}
            </span>

          </div>

          {/* Notifications */}

          <div
            className="relative"
            ref={notificationRef}
          >

            <button
              onClick={() =>
                setShowNotifications(
                  !showNotifications
                )
              }
              className="relative w-11 h-11 rounded-xl border border-slate-300 flex items-center justify-center hover:bg-slate-100"
            >

              <Bell size={18} />

              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                3
              </span>

            </button>

            {showNotifications && (

              <div className="absolute right-0 mt-3 w-72 rounded-xl border bg-white shadow-lg">

                <div className="p-4 border-b font-semibold">
                  Notifications
                </div>

                <div className="p-4 text-sm hover:bg-slate-50">
                  🏡 Check-in Today
                </div>

                <div className="p-4 text-sm hover:bg-slate-50">
                  📄 2 Pending Consents
                </div>

                <div className="p-4 text-sm hover:bg-slate-50">
                  💰 Payment Due
                </div>

              </div>

            )}

          </div>

          {/* Profile */}

          <div
            className="relative"
            ref={profileRef}
          >

            <button
              onClick={() =>
                setShowProfile(
                  !showProfile
                )
              }
              className="flex items-center gap-3 rounded-xl border border-slate-300 px-3 py-2 hover:bg-slate-50"
            >

              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
                A
              </div>

              <div className="hidden md:block text-left">

                <p className="font-semibold text-sm">
                  Admin
                </p>

                <p className="text-xs text-slate-500">
                  Rain Villa PMS
                </p>

              </div>

              <ChevronDown size={18} />

            </button>

            {showProfile && (

              <div className="absolute right-0 mt-3 w-56 rounded-xl border bg-white shadow-lg">

                <button
                  className="flex w-full items-center gap-3 px-4 py-3 hover:bg-slate-50"
                >
                  <User size={18} />
                  My Profile
                </button>

                <button
                  onClick={() =>
                    router.push("/settings")
                  }
                  className="flex w-full items-center gap-3 px-4 py-3 hover:bg-slate-50"
                >
                  <Settings size={18} />
                  Settings
                </button>

                <hr />

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50"
                >
                  <LogOut size={18} />
                  Logout
                </button>

              </div>

            )}

          </div>

        </div>

      </div>

    </header>
  );
}