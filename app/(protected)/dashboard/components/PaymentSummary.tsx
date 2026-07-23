"use client";

import {
  IndianRupee,
  Wallet,
  CircleDollarSign,
  TrendingUp,
} from "lucide-react";

interface Props {
  totalRevenue: number;
  advanceReceived: number;
  pendingBalance: number;
}

export default function PaymentSummary({
  totalRevenue,
  advanceReceived,
  pendingBalance,
}: Props) {
  const collectionPercentage =
    totalRevenue > 0
      ? Math.round((advanceReceived / totalRevenue) * 100)
      : 0;

  const items = [
    {
      title: "Total Revenue",
      value: totalRevenue,
      icon: IndianRupee,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      title: "Advance Received",
      value: advanceReceived,
      icon: Wallet,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Pending Balance",
      value: pendingBalance,
      icon: CircleDollarSign,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      {/* Header */}

      <div className="mb-6 flex items-start justify-between">

        <div>

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Payments
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            Payment Summary
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Collection Overview
          </p>

        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">

          <TrendingUp className="h-6 w-6 text-emerald-600" />

        </div>

      </div>

      {/* Summary */}

      <div className="space-y-4">

        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:border-blue-200 hover:bg-white hover:shadow-md"
            >

              <div className="flex items-center gap-4">

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.iconBg}`}
                >
                  <Icon
                    className={`h-6 w-6 ${item.iconColor}`}
                  />
                </div>

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    {item.title}
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    ₹{item.value.toLocaleString("en-IN")}
                  </h3>

                </div>

              </div>

            </div>
          );
        })}

      </div>

      {/* Progress */}

      <div className="mt-8">

        <div className="mb-3 flex items-center justify-between">

          <span className="text-sm font-medium text-slate-600">
            Collection Progress
          </span>

          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
            {collectionPercentage}%
          </span>

        </div>

        <div className="h-3 overflow-hidden rounded-full bg-slate-200">

          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-700"
            style={{
              width: `${collectionPercentage}%`,
            }}
          />

        </div>

        <div className="mt-3 flex justify-between text-xs text-slate-500">

          <span>
            ₹{advanceReceived.toLocaleString("en-IN")} Collected
          </span>

          <span>
            ₹{pendingBalance.toLocaleString("en-IN")} Pending
          </span>

        </div>

      </div>

    </div>
  );
}