import { Booking } from "./paymentTypes";

interface PaymentModalProps {
  showForm: boolean;
  bookings: Booking[];
  filteredBookings: Booking[];

  bookingNumber: string;
  customerName: string;
  amount: string;
  paymentMethod: string;
  paymentType: string;
  notes: string;

  selectedBooking: Booking | null;

  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;

  setSelectedBooking: (booking: Booking | null) => void;
  setBookingNumber: (value: string) => void;
  setCustomerName: (value: string) => void;
  setAmount: (value: string) => void;
  setPaymentMethod: (value: string) => void;
  setPaymentType: (value: string) => void;
  setNotes: (value: string) => void;

  setTotalAmount: (value: number) => void;
  setAdvancePaid: (value: number) => void;
  setBalanceAmount: (value: number) => void;

  setShowForm: (value: boolean) => void;

  savePayment: () => void;
}

export default function PaymentModal({
  showForm,
  bookings,
  filteredBookings,
  bookingNumber,
  customerName,
  amount,
  paymentMethod,
  paymentType,
  notes,
  selectedBooking,
  totalAmount,
  advancePaid,
  balanceAmount,
  setSelectedBooking,
  setBookingNumber,
  setCustomerName,
  setAmount,
  setPaymentMethod,
  setPaymentType,
  setNotes,
  setTotalAmount,
  setAdvancePaid,
  setBalanceAmount,
  setShowForm,
  savePayment,
}: PaymentModalProps) {
  return (
  <>
    {showForm && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-8">

      <h2 className="text-2xl font-bold mb-6">
        Receive Payment
      </h2>

      <div className="grid grid-cols-2 gap-4">

        <div>
          <label className="block mb-2">Booking Number</label>

          <select
  value={bookingNumber}
  onChange={(e) => {
     const selected = bookings.find(
    (b) => b.bookingNumber === e.target.value
  );

  if (!selected) return;

  setSelectedBooking(selected);

  setBookingNumber(selected.bookingNumber);
  setCustomerName(selected.customerName);

  setTotalAmount(selected.totalAmount);
  setAdvancePaid(selected.advancePaid);
  setBalanceAmount(selected.balanceAmount);

  // Default payment amount = Balance Due
  // Default payment amount based on payment type
if (paymentType === "Balance") {
  setAmount(String(selected.balanceAmount));
} else {
  setAmount("");
}
  }}
  className="w-full border rounded-lg p-3"
>
 <option value="">Select Booking</option>

{filteredBookings
  .filter((booking) => booking.balanceAmount > 0)
  .map((booking) => (
  <option
    key={booking.id}
    value={booking.bookingNumber}
  >
    {booking.bookingNumber} - {booking.customerName}
  </option>
))}
    
</select>
        </div>

        <div>
          <label className="block mb-2">Guest Name</label>

          <input
  value={customerName}
  readOnly
  className="w-full border rounded-lg p-3 bg-gray-100"
 />
        </div>
        {selectedBooking && (
  <div className="col-span-2 bg-blue-50 rounded-lg p-4">

    <div className="grid grid-cols-3 gap-4">

      <div>
        <p className="text-gray-500 text-sm">
          Total Amount
        </p>

        <p className="font-bold text-lg">
          ₹{totalAmount}
        </p>
      </div>

      <div>
        <p className="text-gray-500 text-sm">
          Advance Paid
        </p>

        <p className="font-bold text-lg text-green-600">
          ₹{advancePaid}
        </p>
      </div>

      <div>
        <p className="text-gray-500 text-sm">
          Balance Due
        </p>

        <p className="font-bold text-lg text-red-600">
          ₹{balanceAmount}
        </p>
      </div>

    </div>

  </div>
)}
<div>
  <label className="block mb-2">Amount</label>

  <input
    type="number"
    value={amount}
    onChange={(e) => setAmount(e.target.value)}
    className="w-full border rounded-lg p-3"
  />
</div>


<div>
  <label className="block mb-2">Payment Method</label>

  <select
    value={paymentMethod}
    onChange={(e) => setPaymentMethod(e.target.value)}
    className="w-full border rounded-lg p-3"
  >
    <option>Cash</option>
    <option>UPI</option>
    <option>Card</option>
    <option>Bank Transfer</option>
  </select>
</div>

<div>
  <label className="block mb-2">Payment Type</label>

<select
  value={paymentType}
 onChange={(e) => {
  const type = e.target.value;

  setPaymentType(type);

  if (!selectedBooking) return;

  if (type === "Balance") {
    setAmount(String(selectedBooking.balanceAmount));
  } else {
    setAmount("");
  }

  setTotalAmount(selectedBooking.totalAmount);
  setAdvancePaid(selectedBooking.advancePaid);
  setBalanceAmount(selectedBooking.balanceAmount);
}}
  className="w-full border rounded-lg p-3"
>
  <option value="Advance">Advance</option>
  <option value="Balance">Balance</option>
  <option value="Extra Charge">Extra Charge</option>
  <option value="Refund">Refund</option>
</select>
</div>

        

        <div className="col-span-2">
          <label className="block mb-2">Notes</label>

          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded-lg p-3"
          />
        </div>

      </div>

      <div className="flex justify-end gap-4 mt-8">

        <button
          onClick={() => setShowForm(false)}
          className="px-6 py-3 rounded-lg bg-gray-300"
        >
          Cancel
        </button>

        <button
  onClick={savePayment}
  className="px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700"
>
  Save Payment
</button>

      </div>

    </div>
  </div>
    )}
  </>
);
}