"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Bell } from "lucide-react";

import { Booking } from "@/app/types/booking";

interface DashboardHeaderProps {
  todayBalanceDue: Booking[];
  filter: "month" | "year" | "all";
  onFilterChange: (value: "month" | "year" | "all") => void;
}

export default function DashboardHeader({
  todayBalanceDue,
  filter,
  onFilterChange,
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

  const filterOptions: { value: "month" | "year" | "all"; label: string }[] = [
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
    { value: "all", label: "All time" },
  ];

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">

      {/* Top row */}

      <div className="flex flex-wrap items-start justify-between gap-3">

        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">
            Rain Villa Dashboard
          </h1>

          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Here&apos;s what&apos;s happening at Rain Villa today.
          </p>
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
            className="relative rounded-xl border border-slate-200 p-2.5 transition hover:bg-slate-50"
          >
            <Bell className="h-5 w-5 text-slate-700" />

            {todayBalanceDue.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                {todayBalanceDue.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 z-50 mt-2 w-72 sm:w-80 overflow-hidden rounded-xl border bg-white shadow-xl">
              <div className="border-b bg-gray-50 px-4 py-3 font-semibold text-sm">
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
                    <div className="font-semibold text-sm">
                      {booking.customerName}
                    </div>

                    <div className="mt-1 text-sm text-gray-600">
                      {booking.villa}
                    </div>

                    <div className="mt-1 font-semibold text-red-600 text-sm">
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

      {/* Bottom row */}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">

        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
          <CalendarDays size={15} className="text-slate-400 shrink-0" />
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>

        <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onFilterChange(option.value)}
              className={`rounded-md px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition ${
                filter === option.value
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

      </div>

    </div>
  );
}
