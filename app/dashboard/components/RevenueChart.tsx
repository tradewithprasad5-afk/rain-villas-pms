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
import { TrendingUp } from "lucide-react";

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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
            <TrendingUp className="h-6 w-6 text-emerald-600" />
          </div>

          <div>

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Revenue Analytics
            </p>

            <h2 className="mt-1 text-3xl font-bold text-slate-900">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Total revenue generated
            </p>

          </div>

        </div>

        <select
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value as Filter)
          }
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium outline-none focus:border-blue-500"
        >
          <option value="month">This Month</option>
          <option value="6months">Last 6 Months</option>
          <option value="year">This Year</option>
        </select>

      </div>

      <div className="mt-8 h-[320px]">

        <ResponsiveContainer width="100%" height="100%">

          <LineChart data={chartData}>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={60}
            />

            <Tooltip
              formatter={(value) => [
                `₹${Number(value).toLocaleString("en-IN")}`,
                "Revenue",
              ]}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              }}
            />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={4}
              dot={{
                r: 5,
                strokeWidth: 2,
                fill: "#10b981",
              }}
              activeDot={{
                r: 8,
              }}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}