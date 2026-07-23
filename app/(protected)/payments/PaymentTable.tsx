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
<div className="bg-white rounded-xl shadow overflow-hidden">

  <table className="w-full">

    <thead className="bg-gray-100">
  <tr>
    <th className="text-left p-4">Booking</th>
    <th className="text-left p-4">Guest</th>
    <th className="text-left p-4">Villa</th>
    <th className="text-left p-4">Stay</th>
    <th className="text-right p-4">Total</th>
    <th className="text-right p-4">Paid</th>
    <th className="text-right p-4">Balance</th>
    <th className="text-center p-4">Status</th>
    <th className="text-center p-4">Action</th>
  </tr>
</thead>

    <tbody>

      {loading ? (

        <tr>
  <td colSpan={9} className="text-center p-8">
    Loading bookings...
  </td>
</tr>

      ) : filteredBookings.length === 0 ? (

        <tr>
          <td colSpan={9} className="text-center p-8 text-gray-500">
            No bookings found.
          </td>
        </tr>

      ) : (

        filteredBookings.map((booking) => (

          <tr key={booking.id} className="border-t hover:bg-gray-50">

  <td className="p-4 font-medium">
    {booking.bookingNumber}
  </td>

  <td className="p-4">

  <div className="font-medium">
    {booking.customerName}
  </div>

  <div className="text-sm text-gray-500">
    📞 {booking.phone || "-"}
  </div>

</td>

  <td className="p-4 font-medium">
  {booking.villa}
</td>
<td className="p-4 whitespace-nowrap">
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
</td>

  <td className="p-4 text-right font-semibold">
    ₹{booking.totalAmount}
  </td>

  <td className="p-4 text-right text-green-600 font-semibold">
    ₹{booking.advancePaid}
  </td>

  <td className="p-4 text-right text-red-600 font-semibold">
    ₹{booking.balanceAmount}
  </td>

  <td className="p-4 text-center">

  {booking.balanceAmount === 0 ? (
    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm">
      🟢 Paid
    </span>
  ) : booking.advancePaid === 0 ? (
    <span className="bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm">
      🔴 Unpaid
    </span>
  ) : (
    <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm">
      🟡 Partial
    </span>
  )}

</td>

  <td className="p-4 text-center">

  <div className="flex justify-center gap-2">

    <button
      onClick={() =>
        window.open(
          `/payments/booking-receipt/${booking.id}`,
          "_blank"
        )
      }
      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm"
    >
      📄 Receipt
    </button>

    {booking.balanceAmount > 0 && (
      <button
        onClick={() => {
          setSelectedBooking(booking);

          setBookingNumber(booking.bookingNumber);
          setCustomerName(booking.customerName);

          setTotalAmount(booking.totalAmount);
          setAdvancePaid(booking.advancePaid);
          setBalanceAmount(booking.balanceAmount);

          setPaymentType("Balance");
          setAmount(String(booking.balanceAmount));

          setShowForm(true);
        }}
        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm"
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
  );
}