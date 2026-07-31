"use client";
import { sendReceiptWhatsApp } from "@/app/lib/sendReceiptWhatsApp";

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
  
  const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 sm:p-6">

      <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">
        {selectedDate
  ? selectedDate.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  : "Select a Date"}
      </h2>

      <div className="space-y-3 sm:space-y-4">

        {/* Paradise */}

        <div className="rounded-xl border p-3">

          <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3">
            Rain Paradise
          </h3>

          {paradiseBooking ? (
            <>
  <p className="text-sm text-red-600 font-medium">
    🔴 Booked
  </p>

  <p className="mt-2 text-sm">
    <strong>Guest:</strong> {paradiseBooking.customerName}
  </p>

  <p className="text-sm text-slate-600">
  📅 {formatDate(paradiseBooking.checkIn)} →{" "}
  {formatDate(paradiseBooking.checkOut)}
</p>

  <div className="mt-2 space-y-1 text-sm">
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

  <div className="mt-3 flex gap-2">
  <button
    onClick={() =>
      router.push(
        `/payments?booking=${paradiseBooking.bookingNumber}`
      )
    }
    className="flex-1 rounded-lg bg-green-600 py-1.5 text-xs sm:text-sm font-medium text-white hover:bg-green-700"
  >
    💰 Payments
  </button>

  <button
    onClick={() => sendReceiptWhatsApp(paradiseBooking)}
    className="flex-1 rounded-lg bg-blue-600 py-1.5 text-xs sm:text-sm font-medium text-white hover:bg-blue-700"
  >
    📲 WhatsApp
  </button>
</div>
</>
          ) : (
            <p className="text-sm text-green-600 font-medium">
              🟢 Available
            </p>
          )}

        </div>

        {/* Heaven */}

        <div className="rounded-xl border p-3">

          <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3">
            Rain Heaven
          </h3>

          {heavenBooking ? (
            <>
  <p className="text-sm text-red-600 font-medium">
    🔴 Booked
  </p>

  <p className="mt-2 text-sm">
    <strong>Guest:</strong> {heavenBooking.customerName}
  </p>

  <p className="text-sm text-slate-600">
  📅 {formatDate(heavenBooking.checkIn)} →{" "}
  {formatDate(heavenBooking.checkOut)}
</p>

  <div className="mt-2 space-y-1 text-sm">
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

  <div className="mt-3 flex gap-2">
  <button
    onClick={() =>
      router.push(
        `/payments?booking=${heavenBooking.bookingNumber}`
      )
    }
    className="flex-1 rounded-lg bg-green-600 py-1.5 text-xs sm:text-sm font-medium text-white hover:bg-green-700"
  >
    💰 Payments
  </button>

  <button
    onClick={() => sendReceiptWhatsApp(heavenBooking)}
    className="flex-1 rounded-lg bg-blue-600 py-1.5 text-xs sm:text-sm font-medium text-white hover:bg-blue-700"
  >
    📲 WhatsApp
  </button>
</div>
</>
          ) : (
            <p className="text-sm text-green-600 font-medium">
              🟢 Available
            </p>
          )}

        </div>

      </div>

    </div>
  );
}
