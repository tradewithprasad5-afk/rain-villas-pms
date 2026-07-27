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
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">

      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-2">

              <div className="min-w-0 flex-1">

                <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {card.title}
                </p>

                <h2 className="mt-2 sm:mt-3 text-base sm:text-xl lg:text-2xl font-bold text-slate-900 leading-tight truncate">
                  {card.value}
                </h2>

                <p className="mt-1.5 sm:mt-3 text-[11px] sm:text-sm text-slate-400 truncate">
                  {card.subtitle}
                </p>

              </div>

              <div
                className={`flex h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}
              >
                <Icon
                  className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${card.iconColor}`}
                />
              </div>

            </div>
          </div>
        );
      })}

      {/* Occupancy Card */}

      <div className="col-span-2 lg:col-span-1 flex flex-col rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

        <div className="flex items-start justify-between gap-3">

          <div className="min-w-0 flex-1">

            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
              Today&apos;s Occupancy
            </p>

            <div className="mt-3 sm:mt-5 space-y-2.5 sm:space-y-4">

              <div className="flex items-center justify-between gap-2">

                <span className="text-xs sm:text-base font-medium text-slate-700 truncate">
                  Rain Paradise
                </span>

                <span
                  className={`shrink-0 inline-flex items-center rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold whitespace-nowrap ${
                    paradiseOccupied
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {paradiseOccupied ? "🟢 Occupied" : "⚪ Available"}
                </span>

              </div>

              <div className="flex items-center justify-between gap-2">

                <span className="text-xs sm:text-base font-medium text-slate-700 truncate">
                  Rain Heaven
                </span>

                <span
                  className={`shrink-0 inline-flex items-center rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold whitespace-nowrap ${
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

          <div className="flex h-8 w-8 sm:h-12 sm:w-12 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
            <Hotel className="h-4 w-4 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-indigo-600" />
          </div>

        </div>

      </div>

    </div>
  );
}
