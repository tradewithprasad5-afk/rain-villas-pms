"use client";

import {
  IndianRupee,
  Wallet,
  CircleDollarSign,
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

  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">

      {/* Header */}
      <div className="mb-6">

        <h2 className="text-lg font-bold text-slate-800 sm:text-xl">
          Payment Summary
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Collection Overview
        </p>

      </div>

      {/* Summary Cards */}
      <div className="space-y-5">

        {/* Total Revenue */}
        <div className="rounded-xl bg-green-50 p-4">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-green-100 p-3">

              <IndianRupee className="h-5 w-5 text-green-600" />

            </div>

            <div>

              <p className="text-sm text-slate-500">
                Total Revenue
              </p>

              <h3 className="text-lg font-bold text-slate-800">
                ₹{totalRevenue.toLocaleString("en-IN")}
              </h3>

            </div>

          </div>

        </div>

        {/* Advance Received */}
        <div className="rounded-xl bg-blue-50 p-4">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-blue-100 p-3">

              <Wallet className="h-5 w-5 text-blue-600" />

            </div>

            <div>

              <p className="text-sm text-slate-500">
                Advance Received
              </p>

              <h3 className="text-lg font-bold text-slate-800">
                ₹{advanceReceived.toLocaleString("en-IN")}
              </h3>

            </div>

          </div>

        </div>

        {/* Pending Balance */}
        <div className="rounded-xl bg-orange-50 p-4">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-orange-100 p-3">

              <CircleDollarSign className="h-5 w-5 text-orange-600" />

            </div>

            <div>

              <p className="text-sm text-slate-500">
                Pending Balance
              </p>

              <h3 className="text-lg font-bold text-slate-800">
                ₹{pendingBalance.toLocaleString("en-IN")}
              </h3>

            </div>

          </div>

        </div>

      </div>

      {/* Collection Progress */}
      <div className="mt-8">

        <div className="mb-2 flex items-center justify-between">

          <span className="text-sm font-medium text-slate-600">
            Collection Progress
          </span>

          <span className="text-sm font-bold text-green-600">
            {collectionPercentage}%
          </span>

        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">

          <div
            className="h-full rounded-full bg-green-500 transition-all duration-700 ease-out"
            style={{
              width: `${collectionPercentage}%`,
            }}
          />

        </div>

      </div>

    </div>
  );
}