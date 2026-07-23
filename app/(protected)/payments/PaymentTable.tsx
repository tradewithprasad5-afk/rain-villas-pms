import { Booking } from "./paymentTypes";

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
              className="rounded-xl border bg-white p-4 shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    {booking.customerName}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {booking.bookingNumber}
                  </p>
                </div>

                {booking.balanceAmount === 0 ? (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    Paid
                  </span>
                ) : booking.advancePaid === 0 ? (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                    Unpaid
                  </span>
                ) : (
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                    Partial
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-2 text-sm">

                <div className="flex justify-between">
                  <span className="text-gray-500">Villa</span>
                  <span>{booking.villa}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span>{booking.phone || "-"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Stay</span>

                  <span>
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
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Total</span>

                  <span className="font-semibold">
                    ₹{booking.totalAmount}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Paid</span>

                  <span className="font-semibold text-green-600">
                    ₹{booking.advancePaid}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Balance</span>

                  <span className="font-semibold text-red-600">
                    ₹{booking.balanceAmount}
                  </span>
                </div>

              </div>

              <div className="mt-5 flex gap-2">

                <button
                  onClick={() =>
                    window.open(
                      `/payments/booking-receipt/${booking.id}`,
                      "_blank"
                    )
                  }
                  className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  📄 Receipt
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
                        String(booking.balanceAmount)
                      );

                      setShowForm(true);
                    }}
                    className="flex-1 rounded-lg bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700"
                  >
                    💰 Receive
                  </button>
                )}

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