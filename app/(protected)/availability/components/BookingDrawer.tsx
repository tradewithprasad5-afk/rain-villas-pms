"use client";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
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
    <strong>Guest:</strong> {paradiseBooking.customerName}
  </p>

  <p className="text-sm">
    📅 {paradiseBooking.checkIn} → {paradiseBooking.checkOut}
  </p>

  <div className="mt-4 space-y-1 text-sm">
    <p>
      💰 <strong>Total:</strong> ₹{paradiseBooking.totalAmount}
    </p>

    <p className="text-green-600">
      ✅ <strong>Paid:</strong> ₹{paradiseBooking.advancePaid}
    </p>

    <p
      className={
        paradiseBooking.balanceAmount === 0
          ? "text-green-600 font-semibold"
          : "text-red-600 font-semibold"
      }
    >
      {paradiseBooking.balanceAmount === 0
        ? "🟢 Fully Paid"
        : `🧾 Balance: ₹${paradiseBooking.balanceAmount}`}
    </p>
  </div>

  <div className="mt-5 flex gap-2">
    <button
      onClick={() =>
        router.push(
  `/payments?booking=${paradiseBooking.bookingNumber}`
)
      }
      className="flex-1 rounded-lg bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700"
    >
      💰 Payments
    </button>

    <button
      onClick={() =>
        window.open(
          `/payments/booking-receipt/${paradiseBooking.id}`,
          "_blank"
        )
      }
      className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
    >
      📄 Receipt
    </button>
  </div>
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
    <strong>Guest:</strong> {heavenBooking.customerName}
  </p>

  <p className="text-sm">
    📅 {heavenBooking.checkIn} → {heavenBooking.checkOut}
  </p>

  <div className="mt-4 space-y-1 text-sm">
    <p>
      💰 <strong>Total:</strong> ₹{heavenBooking.totalAmount}
    </p>

    <p className="text-green-600">
      ✅ <strong>Paid:</strong> ₹{heavenBooking.advancePaid}
    </p>

    <p
      className={
        heavenBooking.balanceAmount === 0
          ? "text-green-600 font-semibold"
          : "text-red-600 font-semibold"
      }
    >
      {heavenBooking.balanceAmount === 0
        ? "🟢 Fully Paid"
        : `🧾 Balance: ₹${heavenBooking.balanceAmount}`}
    </p>
  </div>

  <div className="mt-5 flex gap-2">
    <button
      onClick={() =>
        router.push(
  `/payments?booking=${heavenBooking.bookingNumber}`
)
      }
      className="flex-1 rounded-lg bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700"
    >
      💰 Payments
    </button>

    <button
      onClick={() =>
        window.open(
          `/payments/booking-receipt/${heavenBooking.id}`,
          "_blank"
        )
      }
      className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
    >
      📄 Receipt
    </button>
  </div>
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