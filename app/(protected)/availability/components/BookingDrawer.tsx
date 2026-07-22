"use client";

interface Props {
  selectedDate?: Date | null;
  paradiseBooking?: any;
  heavenBooking?: any;
}

export default function BookingDrawer({
  selectedDate,
  paradiseBooking,
  heavenBooking,
}: Props) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">

      <h2 className="text-xl font-bold mb-6">
        {selectedDate
          ? selectedDate.toDateString()
          : "Select a Date"}
      </h2>

      <div className="space-y-6">

        {/* Paradise */}

        <div className="rounded-xl border p-4">

          <h3 className="font-semibold mb-3">
            Rain Paradise
          </h3>

          {paradiseBooking ? (
            <>
              <p className="text-red-600 font-medium">
                🔴 Booked
              </p>

              <p className="mt-3 text-sm">
                <strong>Guest:</strong>{" "}
                {paradiseBooking.customerName}
              </p>

              <p className="text-sm">
                {paradiseBooking.checkIn} →
                {paradiseBooking.checkOut}
              </p>
            </>
          ) : (
            <p className="text-green-600 font-medium">
              🟢 Available
            </p>
          )}

        </div>

        {/* Heaven */}

        <div className="rounded-xl border p-4">

          <h3 className="font-semibold mb-3">
            Rain Heaven
          </h3>

          {heavenBooking ? (
            <>
              <p className="text-red-600 font-medium">
                🔴 Booked
              </p>

              <p className="mt-3 text-sm">
                <strong>Guest:</strong>{" "}
                {heavenBooking.customerName}
              </p>

              <p className="text-sm">
                {heavenBooking.checkIn} →
                {heavenBooking.checkOut}
              </p>
            </>
          ) : (
            <p className="text-green-600 font-medium">
              🟢 Available
            </p>
          )}

        </div>

      </div>

    </div>
  );
}