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
      icon: CalendarDays,
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Advance",
      value: `₹${advanceReceived.toLocaleString("en-IN")}`,
      icon: Wallet,
      bg: "bg-emerald-50",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      title: "Pending",
      value: `₹${pendingBalance.toLocaleString("en-IN")}`,
      icon: Wallet,
      bg: "bg-orange-50",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">

      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className={`${card.bg} rounded-2xl border border-slate-200 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  {card.title}
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-800 break-words">
                  {card.value}
                </h2>

              </div>

              <div
                className={`rounded-2xl p-4 ${card.iconBg}`}
              >
                <Icon
                  size={28}
                  className={card.iconColor}
                />
              </div>

            </div>
          </div>
        );
      })}

      <div className="rounded-2xl border border-slate-200 bg-indigo-50 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-sm text-slate-500">
              Today's Occupancy
            </p>

            <div className="mt-4 space-y-3">

              <div className="flex items-center justify-between gap-3">

                <span className="text-sm font-medium">
                  Rain Paradise
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    paradiseOccupied
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {paradiseOccupied
                    ? "Occupied"
                    : "Available"}
                </span>

              </div>

              <div className="flex items-center justify-between gap-3">

                <span className="text-sm font-medium">
                  Rain Heaven
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    heavenOccupied
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {heavenOccupied
                    ? "Occupied"
                    : "Available"}
                </span>

              </div>

            </div>

          </div>

          <div className="rounded-2xl bg-indigo-100 p-4">

            <Hotel
              size={28}
              className="text-indigo-600"
            />

          </div>

        </div>

      </div>

    </div>
  );
}