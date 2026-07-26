"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Bell } from "lucide-react";

import { Booking } from "@/app/types/booking";

interface DashboardHeaderProps {
  todayBalanceDue: Booking[];
}

export default function DashboardHeader({
  todayBalanceDue,
}: DashboardHeaderProps) {
  const router = useRouter();

  const [showNotifications, setShowNotifications] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: PointerEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("pointerdown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleClickOutside
      );
    };
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning ☀️";
    if (hour < 17) return "Good Afternoon 🌤️";
    return "Good Evening 🌙";
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      {/* Left */}

      <div>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          {greeting()}, Admin
        </h1>

        <p className="mt-1 text-sm text-slate-500 md:text-base">
          Welcome back! Here's what's happening at Rain Villa today.
        </p>
      </div>

      {/* Right */}

      <div className="flex items-center gap-4">
        {/* Date */}

        <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
            <CalendarDays
              size={20}
              className="text-blue-600"
            />
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Today
            </p>

            <p className="text-sm font-semibold text-slate-900">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Notification Bell */}

        <div
          ref={notificationRef}
          className="relative"
        >
          <button
            onClick={() =>
              setShowNotifications((prev) => !prev)
            }
            className="relative rounded-xl bg-slate-50 p-3 transition hover:bg-slate-100"
          >
            <Bell className="h-6 w-6 text-slate-700" />

            {todayBalanceDue.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                {todayBalanceDue.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border bg-white shadow-xl">
              <div className="border-b bg-gray-50 px-4 py-3 font-semibold">
                💰 Balance Due Today
              </div>

              {todayBalanceDue.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No balance due today 🎉
                </div>
              ) : (
                todayBalanceDue.map((booking) => (
                  <div
                    key={booking.id}
                    className="border-b p-4 last:border-b-0"
                  >
                    <div className="font-semibold">
                      {booking.customerName}
                    </div>

                    <div className="mt-1 text-sm text-gray-600">
                      {booking.villa}
                    </div>

                    <div className="mt-1 font-semibold text-red-600">
                      Balance ₹{booking.balanceAmount}
                    </div>

                    <button
                      onClick={() => {
                        setShowNotifications(false);

                        router.push(
                          `/payments?booking=${booking.bookingNumber}`
                        );
                      }}
                      className="mt-3 w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                      Collect Payment
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}