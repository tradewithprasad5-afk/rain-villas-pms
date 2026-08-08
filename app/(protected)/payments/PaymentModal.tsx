import { X, IndianRupee } from "lucide-react";
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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 sm:mb-2 block text-sm font-medium text-slate-600">
      {children}
    </label>
  );
}

const inputClasses =
  "w-full rounded-xl border border-slate-200 p-2.5 sm:p-3 text-sm sm:text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:p-8">
            <div className="mb-4 flex items-center justify-between sm:mb-6">
              <h2 className="text-lg font-bold text-slate-900 sm:text-2xl">
                Receive Payment
              </h2>

              <button
                onClick={() => setShowForm(false)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div>
                <FieldLabel>Booking Number</FieldLabel>

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

                    if (paymentType === "Balance") {
                      setAmount(String(selected.balanceAmount));
                    } else {
                      setAmount("");
                    }
                  }}
                  className={inputClasses}
                >
                  <option value="">Select Booking</option>

                  {filteredBookings
                    .filter((booking) => booking.balanceAmount > 0)
                    .map((booking) => (
                      <option key={booking.id} value={booking.bookingNumber}>
                        {booking.bookingNumber} - {booking.customerName}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <FieldLabel>Guest Name</FieldLabel>

                <input
                  value={customerName}
                  readOnly
                  className={`${inputClasses} bg-slate-50 text-slate-500`}
                />
              </div>

              {selectedBooking && (
                <div className="col-span-1 rounded-xl bg-blue-50 p-3 sm:col-span-2 sm:p-4">
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div>
                      <p className="text-[11px] text-slate-500 sm:text-sm">
                        Total Amount
                      </p>
                      <p className="text-sm font-bold tabular-nums text-slate-900 sm:text-lg">
                        ₹{totalAmount.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-500 sm:text-sm">
                        Advance Paid
                      </p>
                      <p className="text-sm font-bold tabular-nums text-green-600 sm:text-lg">
                        ₹{advancePaid.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-500 sm:text-sm">
                        Balance Due
                      </p>
                      <p className="text-sm font-bold tabular-nums text-red-600 sm:text-lg">
                        ₹{balanceAmount.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <FieldLabel>Amount</FieldLabel>

                <div className="relative">
                  <IndianRupee
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`${inputClasses} pl-9`}
                  />
                </div>
              </div>

              <div>
                <FieldLabel>Payment Method</FieldLabel>

                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className={inputClasses}
                >
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Card</option>
                  <option>Bank Transfer</option>
                </select>
              </div>

              <div>
                <FieldLabel>Payment Type</FieldLabel>

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
                  className={inputClasses}
                >
                  <option value="Advance">Advance</option>
                  <option value="Balance">Balance</option>
                  <option value="Extra Charge">Extra Charge</option>
                  <option value="Refund">Refund</option>
                </select>
              </div>

              <div className="col-span-1 sm:col-span-2">
                <FieldLabel>Notes</FieldLabel>

                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:mt-8 sm:flex-row sm:gap-4">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 sm:px-6 sm:py-3 sm:text-base"
              >
                Cancel
              </button>

              <button
                onClick={savePayment}
                className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 sm:px-6 sm:py-3 sm:text-base"
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
