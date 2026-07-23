"use client";

import { CalendarCheck, CalendarX } from "lucide-react";

interface Activity {
  type: "checkin" | "checkout";
  guest: string;
  villa: string;
  date: string;
}

interface Props {
  activities: Activity[];
}

export default function ActivityCard({ activities }: Props) {
  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">

      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h2 className="text-lg font-bold text-slate-800 sm:text-xl">
            Today's Activity
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Check-ins & Check-outs
          </p>
        </div>

        <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
          {activities.length} Events
        </span>

      </div>

      {/* Empty State */}
      {activities.length === 0 ? (

        <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-slate-300">

          <p className="text-center text-slate-500">
            No activity scheduled today.
          </p>

        </div>

      ) : (

        <div className="space-y-4">

          {activities.map((activity, index) => (

            <div
              key={index}
              className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
            >

              {/* Left */}
              <div className="flex items-center gap-3">

                <div
                  className={`rounded-xl p-3 ${
                    activity.type === "checkin"
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >
                  {activity.type === "checkin" ? (
                    <CalendarCheck className="h-5 w-5 text-green-600" />
                  ) : (
                    <CalendarX className="h-5 w-5 text-red-600" />
                  )}
                </div>

                <div>

                  <h3 className="font-semibold text-slate-800">
                    {activity.guest}
                  </h3>

                  <p className="text-sm text-slate-500">
                    {activity.villa}
                  </p>

                </div>

              </div>

              {/* Right */}
              <div className="sm:text-right">

                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    activity.type === "checkin"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {activity.type === "checkin"
                    ? "Check-In"
                    : "Check-Out"}
                </span>

                <p className="mt-2 text-sm text-slate-500">
                  {activity.date}
                </p>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}