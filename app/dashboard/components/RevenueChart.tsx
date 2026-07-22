"use client";

import { useMemo, useState } from "react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface Props {
  revenueData: number[];
  totalRevenue: number;
}

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

type Filter = "month" | "6months" | "year";

export default function RevenueChart({
  revenueData,
  totalRevenue,
}: Props) {
  const [filter, setFilter] = useState<Filter>("year");

  const chartData = useMemo(() => {
    const currentMonth = new Date().getMonth();

    if (filter === "month") {
      return [
        {
          month: months[currentMonth],
          revenue: revenueData[currentMonth],
        },
      ];
    }

    if (filter === "6months") {
      const start = Math.max(currentMonth - 5, 0);

      return months
        .slice(start, currentMonth + 1)
        .map((month, index) => ({
          month,
          revenue: revenueData[start + index],
        }));
    }

    return months.map((month, index) => ({
      month,
      revenue: revenueData[index],
    }));
  }, [filter, revenueData]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>

          <h2 className="text-lg font-semibold text-slate-900">
            Revenue Analytics
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Total Revenue
          </p>

          <h3 className="mt-1 text-2xl md:text-3xl font-bold text-emerald-600">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </h3>

        </div>

        <select
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value as Filter)
          }
          className="rounded-xl border px-4 py-2 text-sm outline-none"
        >
          <option value="month">
            This Month
          </option>

          <option value="6months">
            Last 6 Months
          </option>

          <option value="year">
            This Year
          </option>

        </select>

      </div>

      <div className="mt-6 h-[260px] sm:h-[280px] lg:h-[300px]">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <LineChart data={chartData}>

            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip
  formatter={(value) => [
    `₹${Number(value).toLocaleString("en-IN")}`,
    "Revenue",
  ]}
/>

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}