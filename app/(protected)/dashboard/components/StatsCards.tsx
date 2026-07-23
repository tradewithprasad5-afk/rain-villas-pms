"use client";

import {
  CalendarDays,
  IndianRupee,
  Wallet,
  Hotel,
} from "lucide-react";

interface Props {
  totalBookings: number;
  totalRevenue: number;
  advanceReceived: number;
  pendingBalance: number;
  paradiseOccupied: boolean;
  heavenOccupied: boolean;
}

export default function StatsCards({
  totalBookings,
  totalRevenue,
  advanceReceived,
  pendingBalance,
  paradiseOccupied,
  heavenOccupied,
}: Props) {
  const cards = [
    {
      title: "Bookings",
      value: totalBookings.toString(),
      subtitle: "Total reservations",
      icon: CalendarDays,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      subtitle: "Total earnings",
      icon: IndianRupee,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Advance",
      value: `₹${advanceReceived.toLocaleString("en-IN")}`,
      subtitle: "Received payments",
      icon: Wallet,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      title: "Pending",
      value: `₹${pendingBalance.toLocaleString("en-IN")}`,
      subtitle: "Balance due",
      icon: Wallet,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  
  return (
    <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">

      {cards.map((card) => {
  const Icon = card.icon;

  return (
    <div
      key={card.title}
      className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0 flex-1">

  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
    {card.title}
  </p>

  <h2 className="mt-3 text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 leading-tight">
  {card.value}
</h2>

  <p className="mt-3 text-xs sm:text-sm text-slate-400">
    {card.subtitle}
  </p>

</div>

        <div
          className={`flex h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}
        >
          <Icon
            className={`h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 ${card.iconColor}`}
          />
        </div>

      </div>
    </div>
  );
})}
      {/* Occupancy Card */}

<div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

  <div className="flex items-start justify-between gap-4">

    <div className="flex-1 min-w-0">

      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Today's Occupancy
      </p>

      <div className="mt-5 space-y-4">

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

          <span className="text-sm sm:text-base font-medium text-slate-700">
            Rain Paradise
          </span>

          <span
            className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${
              paradiseOccupied
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {paradiseOccupied ? "🟢 Occupied" : "⚪ Available"}
          </span>

        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

          <span className="text-sm sm:text-base font-medium text-slate-700">
            Rain Heaven
          </span>

          <span
            className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${
              heavenOccupied
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {heavenOccupied ? "🟢 Occupied" : "⚪ Available"}
          </span>

        </div>

      </div>

    </div>

    <div className="flex h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
      <Hotel className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-indigo-600" />
    </div>

  </div>

</div>

    </div>
  );
}