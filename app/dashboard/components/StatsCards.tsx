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
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">

      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">

              <div className="min-w-0">

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {card.title}
                </p>

                <h2 className="mt-3 break-words text-2xl font-bold text-slate-900 lg:text-3xl">
                  {card.value}
                </h2>

                <p className="mt-2 text-xs text-slate-400">
                  {card.subtitle}
                </p>

              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg}`}
              >
                <Icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>

            </div>
          </div>
        );
      })}

      {/* Occupancy Card */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

        <div className="flex items-start justify-between">

          <div className="flex-1">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Today's Occupancy
            </p>

            <div className="mt-5 space-y-4">

              <div className="flex items-center justify-between">

                <span className="text-sm font-medium text-slate-700">
                  Rain Paradise
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    paradiseOccupied
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {paradiseOccupied
                    ? "🟢 Occupied"
                    : "⚪ Available"}
                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-sm font-medium text-slate-700">
                  Rain Heaven
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    heavenOccupied
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {heavenOccupied
                    ? "🟢 Occupied"
                    : "⚪ Available"}
                </span>

              </div>

            </div>

          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">

            <Hotel className="h-6 w-6 text-indigo-600" />

          </div>

        </div>

      </div>

    </div>
  );
}