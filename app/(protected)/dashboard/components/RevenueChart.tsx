"use client";

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

export default function RevenueChart({
  revenueData,
  totalRevenue,
}: Props) {
  const chartData = months.map((month, index) => ({
    month,
    revenue: revenueData[index],
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">

      <div className="flex items-center gap-3 sm:gap-4">

        <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
          <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
        </div>

        <div className="min-w-0">

          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
            Revenue Analytics
          </p>

          <h2 className="mt-1 text-xl sm:text-3xl font-bold text-slate-900 truncate">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </h2>

          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-500">
            Total revenue generated
          </p>

        </div>

      </div>

      <div className="mt-5 sm:mt-8 h-[220px] sm:h-[320px]">

        <ResponsiveContainer width="100%" height="100%">

          <LineChart data={chartData} margin={{ left: -20 }}>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={50}
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
                fontSize: "12px",
              }}
            />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={3}
              dot={{
                r: 4,
                strokeWidth: 2,
                fill: "#10b981",
              }}
              activeDot={{
                r: 7,
              }}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}

