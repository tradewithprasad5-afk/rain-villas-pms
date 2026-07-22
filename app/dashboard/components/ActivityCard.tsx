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

export default function ActivityCard({
  activities,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 h-full">

      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="text-xl font-bold text-slate-800">
            Today's Activity
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Check-ins & Check-outs
          </p>

        </div>

        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
          {activities.length} Events
        </span>

      </div>

      {activities.length === 0 ? (

        <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-slate-300">

          <p className="text-slate-500">
            No activity scheduled today.
          </p>

        </div>

      ) : (

        <div className="space-y-4">

          {activities.map((activity, index) => (

            <div
              key={index}
              className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:bg-slate-50 transition"
            >

              <div className="flex items-center gap-4">

                <div
                  className={`rounded-xl p-3 ${
                    activity.type === "checkin"
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >

                  {activity.type === "checkin" ? (

                    <CalendarCheck
                      className="text-green-600"
                      size={22}
                    />

                  ) : (

                    <CalendarX
                      className="text-red-600"
                      size={22}
                    />

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

              <div className="text-right">

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