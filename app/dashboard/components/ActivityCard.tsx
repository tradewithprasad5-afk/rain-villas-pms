"use client";

import {
  CalendarCheck,
  CalendarX,
  Clock3,
} from "lucide-react";

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
    <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">

        <div>

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Activity
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            Today's Activity
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Check-ins & Check-outs
          </p>

        </div>

        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          {activities.length}{" "}
          {activities.length === 1 ? "Event" : "Events"}
        </span>

      </div>

      {/* Empty State */}

      {activities.length === 0 ? (

        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">

          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200">

            <Clock3 className="h-8 w-8 text-slate-500" />

          </div>

          <h3 className="text-lg font-semibold text-slate-700">
            No Activity Today
          </h3>

          <p className="mt-2 text-center text-sm text-slate-500">
            There are no scheduled check-ins or
            check-outs for today.
          </p>

        </div>

      ) : (

        <div className="space-y-4">

          {activities.map((activity, index) => {

            const isCheckIn =
              activity.type === "checkin";

            return (

              <div
                key={index}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:border-blue-200 hover:bg-white hover:shadow-md"
              >

                {/* Left */}

                <div className="flex items-center gap-4">

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      isCheckIn
                        ? "bg-green-100"
                        : "bg-red-100"
                    }`}
                  >

                    {isCheckIn ? (
                      <CalendarCheck className="h-6 w-6 text-green-600" />
                    ) : (
                      <CalendarX className="h-6 w-6 text-red-600" />
                    )}

                  </div>

                  <div>

                    <h3 className="font-semibold text-slate-900">
                      {activity.guest}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {activity.villa}
                    </p>

                  </div>

                </div>

                {/* Right */}

                <div className="text-right">

                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      isCheckIn
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {isCheckIn
                      ? "Check-In"
                      : "Check-Out"}
                  </span>

                  <p className="mt-2 text-sm font-medium text-slate-500">
                    {activity.date}
                  </p>

                </div>

              </div>

            );
          })}

        </div>

      )}

    </div>
  );
}