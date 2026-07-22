"use client";

import {
  CalendarCheck,
  Home,
  BedDouble,
  TrendingUp,
} from "lucide-react";

interface DashboardCardsProps {
  totalBookings: number;
  occupiedToday: number;
  availableToday: number;
  occupancyRate: number;
}

export default function DashboardCards({
  totalBookings,
  occupiedToday,
  availableToday,
  occupancyRate,
}: DashboardCardsProps) {
  const cards = [
    {
      title: "Total Bookings",
      value: totalBookings,
      subtitle: "All Bookings",
      icon: CalendarCheck,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
    {
      title: "Occupied Today",
      value: occupiedToday,
      subtitle: "Occupied Villas",
      icon: BedDouble,
      bg: "bg-red-100",
      color: "text-red-600",
    },
    {
      title: "Available Today",
      value: availableToday,
      subtitle: "Available Villas",
      icon: Home,
      bg: "bg-green-100",
      color: "text-green-600",
    },
    {
      title: "Occupancy Rate",
      value: `${occupancyRate}%`,
      subtitle: "Today's Occupancy",
      icon: TrendingUp,
      bg: "bg-purple-100",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  {card.title}
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  {card.value}
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  {card.subtitle}
                </p>
              </div>

              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl ${card.bg}`}
              >
                <Icon
                  size={28}
                  className={card.color}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}