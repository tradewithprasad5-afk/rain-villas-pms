"use client";

import { useState } from "react";
import { checkAvailability } from "./availability";
import { AvailabilityResult } from "./types";


  export default function AgentPage() {

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AvailabilityResult[]>([]);

  const handleCheckAvailability = async () => {
    if (!checkIn || !checkOut) {
      alert("Please select both Check-In and Check-Out dates.");
      return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      alert("Check-Out date must be after Check-In date.");
      return;
    }

    try {
      setLoading(true);

      const data = await checkAvailability(
        new Date(checkIn),
        new Date(checkOut)
      );

      setResults(data);
    } catch (error) {
      console.error(error);
      alert("Unable to check availability.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-center text-3xl font-bold">
          Rain Villa
        </h1>

        <p className="mt-2 text-center text-slate-500">
          Agent Availability Portal
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium">
              Check-In
            </label>

            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Check-Out
            </label>

            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full rounded-lg border p-3"
            />
          </div>
        </div>

        <button
  onClick={handleCheckAvailability}
  disabled={loading}
  className={`mt-6 w-full rounded-lg py-3 text-white transition ${
    results.length > 0
      ? "bg-green-600 hover:bg-green-700"
      : "bg-blue-600 hover:bg-blue-700"
  } disabled:opacity-50`}
>
  {loading
    ? "Checking..."
    : results.length > 0
    ? "✓ Availability Checked"
    : "Check Availability"}
</button>

        {results.length > 0 && (
          <div className="mt-10 space-y-5">
            {results.map((villa) => (
              <div
                key={villa.id}
                className="rounded-xl border p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">
                      {villa.name}
                    </h2>

                    <p className="text-gray-500">
                      {villa.floor}
                    </p>

                    
                  </div>

                  {villa.available ? (
                    <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
  Available
</span>
                  ) : (
                    <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
  Booked
</span>
                  )}
                </div>

                {!villa.available && villa.booking && (
                 <div className="mt-4 inline-block rounded-lg border border-red-200 bg-red-50 px-4 py-3">
  <p className="font-medium">
    Booking No: {villa.booking.bookingNumber}
  </p>

  <p className="text-sm text-gray-600">
    {formatDate(villa.booking.checkIn)} →{" "}
    {formatDate(villa.booking.checkOut)}
  </p>
</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}