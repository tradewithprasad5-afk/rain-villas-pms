"use client";

import { CalendarDays } from "lucide-react";

export default function DashboardHeader() {
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

    </div>
  );
}