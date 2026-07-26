import { useState } from "react";
import { Booking } from "./paymentTypes";
import OverflowMenu from "./OverflowMenu";

interface PaymentTableProps {
  loading: boolean;
  filteredBookings: Booking[];

  setSelectedBooking: (booking: Booking) => void;
  setBookingNumber: (value: string) => void;
  setCustomerName: (value: string) => void;

  setTotalAmount: (value: number) => void;
  setAdvancePaid: (value: number) => void;
  setBalanceAmount: (value: number) => void;

  setPaymentType: (value: string) => void;
  setAmount: (value: string) => void;
  setShowForm: (value: boolean) => void;
}

export default function PaymentTable({
 
  loading,
  filteredBookings,
  setSelectedBooking,
  setBookingNumber,
  setCustomerName,
  setTotalAmount,
  setAdvancePaid,
  setBalanceAmount,
  setPaymentType,
  setAmount,
  setShowForm,
}: PaymentTableProps) {
  
   const sendReceiptWhatsApp = (booking: Booking) => {
  if (!booking.phone) {
    alert("Guest phone number is not available.");
    return;
  }

  // Remove spaces, dashes, etc.
  const phone = booking.phone.replace(/\D/g, "");

  const receiptUrl = `${window.location.origin}/payments/booking-receipt/${booking.id}`;

  const message = `🏡 Rain Villa

Hello ${booking.customerName},

Thank you for your payment.

Your booking receipt is ready.

Booking Number: ${booking.bookingNumber}

Receipt:
${receiptUrl}

Thank you for choosing Rain Villa!`;

  window.open(
    `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
};
  return (
    <>
      {/* ================= MOBILE VIEW ================= */}
      <div className="space-y-4 md:hidden">
        {loading ? (
          <div className="rounded-xl bg-white p-6 text-center shadow">
            Loading bookings...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-center shadow">
            No bookings found.
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div
  key={booking.id}
  className="relative rounded-xl border bg-white p-3 shadow overflow-visible"
>
              <div className="flex items-start justify-between">
  <div>
    <h2 className="text-lg font-semibold">
      {booking.customerName}
    </h2>

    
  </div>

  <div className="flex items-start gap-2">

    {booking.balanceAmount === 0 ? (
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
        Paid
      </span>
    ) : booking.advancePaid === 0 ? (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
        Pending
      </span>
    ) : (
      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
        Partial
      </span>
    )}

    <OverflowMenu
  items={[
    {
      label: "Receipt",
      icon: "📄",
      onClick: () =>
        window.open(
          `/payments/booking-receipt/${booking.id}`,
          "_blank"
        ),
    },
    {
      label: "WhatsApp",
      icon: "📲",
      onClick: () =>
        sendReceiptWhatsApp(booking),
    },
    ...(booking.balanceAmount > 0
      ? [
          {
            label: "Receive Payment",
            icon: "💰",
            onClick: () => {
              setSelectedBooking(booking);
              setBookingNumber(
                booking.bookingNumber
              );
              setCustomerName(
                booking.customerName
              );
              setTotalAmount(
                booking.totalAmount
              );
              setAdvancePaid(
                booking.advancePaid
              );
              setBalanceAmount(
                booking.balanceAmount
              );
              setPaymentType("Balance");
              setAmount(
                String(
                  booking.balanceAmount
                )
              );
              setShowForm(true);
            },
          },
        ]
      : []),
  ]}
/>

  </div>
</div>

              <div className="mt-2">
  <p className="text-sm text-gray-500">{booking.villa}</p>

  <p className="mt-1 text-xl font-bold text-green-600">
    ₹{booking.totalAmount}
  </p>

  <p className="mt-1 text-sm text-gray-500">
  {booking.checkIn
    ? new Date(booking.checkIn).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      })
    : "-"}
  {" → "}
  {booking.checkOut
    ? new Date(booking.checkOut).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      })
    : "-"}
</p>

  <p
  className={`mt-1 text-sm font-semibold ${
      booking.balanceAmount === 0
        ? "text-green-600"
        : "text-red-600"
    }`}
  >
    Balance ₹{booking.balanceAmount}
  </p>
</div>

              
            </div>
          ))
        )}
      </div>

      {/* ================= DESKTOP VIEW ================= */}

      <div className="hidden md:block overflow-x-auto rounded-xl bg-white shadow">
              <table className="min-w-[1200px] w-full">

        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-4 text-left">Booking</th>
            <th className="px-4 py-4 text-left">Guest</th>
            <th className="px-4 py-4 text-left">Villa</th>
            <th className="px-4 py-4 text-left">Stay</th>
            <th className="px-4 py-4 text-right">Total</th>
            <th className="px-4 py-4 text-right">Paid</th>
            <th className="px-4 py-4 text-right">Balance</th>
            <th className="px-4 py-4 text-center">Status</th>
            <th className="px-4 py-4 text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={9} className="py-12 text-center text-gray-500">
                Loading bookings...
              </td>
            </tr>
          ) : filteredBookings.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-12 text-center text-gray-500">
                No bookings found.
              </td>
            </tr>
          ) : (
            filteredBookings.map((booking) => (
              <tr
                key={booking.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="px-4 py-4 font-medium">
                  {booking.bookingNumber}
                </td>

                <td className="px-4 py-4">
                  <div className="font-medium">
                    {booking.customerName}
                  </div>

                  <div className="text-sm text-gray-500">
                    📞 {booking.phone || "-"}
                  </div>
                </td>

                <td className="px-4 py-4">
                  {booking.villa}
                </td>

                <td className="px-4 py-4 whitespace-nowrap">
                  {booking.checkIn
                    ? new Date(
                        booking.checkIn
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })
                    : "-"}

                  {" → "}

                  {booking.checkOut
                    ? new Date(
                        booking.checkOut
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })
                    : "-"}
                </td>

                <td className="px-4 py-4 text-right font-semibold">
                  ₹{booking.totalAmount}
                </td>

                <td className="px-4 py-4 text-right font-semibold text-green-600">
                  ₹{booking.advancePaid}
                </td>

                <td className="px-4 py-4 text-right font-semibold text-red-600">
                  ₹{booking.balanceAmount}
                </td>

                <td className="px-4 py-4 text-center">
                  {booking.balanceAmount === 0 ? (
                    <span className="rounded-full bg-green-100 px-4 py-2 text-sm text-green-700">
                      🟢 Paid
                    </span>
                  ) : booking.advancePaid === 0 ? (
                    <span className="rounded-full bg-red-100 px-4 py-2 text-sm text-red-700">
                      🔴 Unpaid
                    </span>
                  ) : (
                    <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm text-yellow-700">
                      🟡 Partial
                    </span>
                  )}
                </td>

                <td className="px-4 py-4">
                  <div className="flex justify-center gap-2">

                    <button
                      onClick={() =>
                        window.open(
                          `/payments/booking-receipt/${booking.id}`,
                          "_blank"
                        )
                      }
                      className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                    >
                      📄 Receipt
                    </button>
                    <button
  onClick={() => sendReceiptWhatsApp(booking)}
  className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
>
  📲 WhatsApp
</button>

                    {booking.balanceAmount > 0 && (
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);

                          setBookingNumber(
                            booking.bookingNumber
                          );

                          setCustomerName(
                            booking.customerName
                          );

                          setTotalAmount(
                            booking.totalAmount
                          );

                          setAdvancePaid(
                            booking.advancePaid
                          );

                          setBalanceAmount(
                            booking.balanceAmount
                          );

                          setPaymentType("Balance");

                          setAmount(
                            String(
                              booking.balanceAmount
                            )
                          );

                          setShowForm(true);
                        }}
                        className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
                      >
                        💰 Receive
                      </button>
                    )}

                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>

      </table>

    </div>

    </>
  );
}