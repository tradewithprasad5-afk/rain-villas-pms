"use client";

interface BookingModalProps {
  show: boolean;
  editingId: string | null;

  customerName: string;
  phone: string;
  email: string;
  address: string;

  villa: string;
  guests: number;
  checkIn: string;
  checkOut: string;

  totalAmount: string;
  advancePaid: string;
  balanceAmount: number;
  status: string;

  setCustomerName: (value: string) => void;
  onPhoneChange: (value: string) => void;
  setEmail: (value: string) => void;
  setAddress: (value: string) => void;

  setVilla: (value: string) => void;
  setGuests: (value: number) => void;
  setCheckIn: (value: string) => void;
  setCheckOut: (value: string) => void;

  setTotalAmount: (value: string) => void;
  setAdvancePaid: (value: string) => void;
  setStatus: (value: string) => void;

  onSave: () => void;
  onCancel: () => void;
}

export default function BookingModal({
  show,
  editingId,

  customerName,
  phone,
  email,
  address,

  villa,
  guests,
  checkIn,
  checkOut,

  totalAmount,
  advancePaid,
  balanceAmount,
  status,

  setCustomerName,
  onPhoneChange,
  setEmail,
  setAddress,

  setVilla,
  setGuests,
  setCheckIn,
  setCheckOut,

  setTotalAmount,
  setAdvancePaid,
  setStatus,

  onSave,
  onCancel,
}: BookingModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-8">
        <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6">
          {editingId ? "Edit Booking" : "New Booking"}
        </h2>

        {/* ===============================
            Customer Information
        =============================== */}

        <div className="mb-6 sm:mb-8">
          <h3 className="text-sm sm:text-lg font-semibold border-b pb-2 mb-3 sm:mb-4">
            Customer Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

            {/* Customer Name */}

            <div>
              <label className="block mb-1 text-sm sm:text-base font-medium">
                Customer Name
              </label>

              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border rounded-lg p-2.5 sm:p-3 text-sm sm:text-base"
                placeholder="Customer Name"
              />
            </div>

            {/* Phone */}

            <div>
              <label className="block mb-1 text-sm sm:text-base font-medium">
                Phone Number
              </label>

              <input
                type="text"
                value={phone}
               onChange={(e) => onPhoneChange(e.target.value)}
                className="w-full border rounded-lg p-2.5 sm:p-3 text-sm sm:text-base"
                placeholder="9876543210"
              />
            </div>

            {/* Email */}

            <div>
              <label className="block mb-1 text-sm sm:text-base font-medium">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg p-2.5 sm:p-3 text-sm sm:text-base"
                placeholder="example@email.com"
              />
            </div>

            {/* Address */}

            <div className="col-span-1 sm:col-span-2">
              <label className="block mb-1 text-sm sm:text-base font-medium">
                Address
              </label>

              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border rounded-lg p-2.5 sm:p-3 text-sm sm:text-base"
                placeholder="Customer Address"
              />
            </div>

          </div>
        </div>
                {/* ===============================
            Booking Information
        =============================== */}

        <div className="mb-6 sm:mb-8">
          <h3 className="text-sm sm:text-lg font-semibold border-b pb-2 mb-3 sm:mb-4">
            Booking Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

            {/* Villa */}

            <div>
              <label className="block mb-1 text-sm sm:text-base font-medium">
                Villa
              </label>

              <select
                value={villa}
                onChange={(e) => setVilla(e.target.value)}
                className="w-full border rounded-lg p-2.5 sm:p-3 text-sm sm:text-base"
              >
                <option>Rain Paradise</option>
                <option>Rain Heaven</option>
              </select>
            </div>

            {/* Guests */}

            <div>
              <label className="block mb-1 text-sm sm:text-base font-medium">
                Guests
              </label>

              <input
                type="number"
                min={1}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full border rounded-lg p-2.5 sm:p-3 text-sm sm:text-base"
              />
            </div>

            {/* Check In */}

            <div>
              <label className="block mb-1 text-sm sm:text-base font-medium">
                Check In
              </label>

              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full border rounded-lg p-2.5 sm:p-3 text-sm sm:text-base"
              />
            </div>

            {/* Check Out */}

            <div>
              <label className="block mb-1 text-sm sm:text-base font-medium">
                Check Out
              </label>

              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full border rounded-lg p-2.5 sm:p-3 text-sm sm:text-base"
              />
            </div>

          </div>
        </div>

        {/* ===============================
            Payment Information
        =============================== */}

        <div className="mb-6 sm:mb-8">
          <h3 className="text-sm sm:text-lg font-semibold border-b pb-2 mb-3 sm:mb-4">
            Payment Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

            {/* Total Amount */}

            <div>
              <label className="block mb-1 text-sm sm:text-base font-medium">
                Total Amount
              </label>

              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="w-full border rounded-lg p-2.5 sm:p-3 text-sm sm:text-base"
                placeholder="Total Amount"
              />
            </div>

            {/* Advance */}

            <div>
              <label className="block mb-1 text-sm sm:text-base font-medium">
                Advance Paid
              </label>

              <input
                type="number"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(e.target.value)}
                className="w-full border rounded-lg p-2.5 sm:p-3 text-sm sm:text-base"
                placeholder="Advance Paid"
              />
            </div>

            {/* Balance */}

            <div>
              <label className="block mb-1 text-sm sm:text-base font-medium">
                Balance Amount
              </label>

              <input
                type="number"
                value={balanceAmount}
                readOnly
                className="w-full border rounded-lg p-2.5 sm:p-3 text-sm sm:text-base bg-gray-100"
              />
            </div>

            {/* Status */}

            <div>
              <label className="block mb-1 text-sm sm:text-base font-medium">
                Status
              </label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border rounded-lg p-2.5 sm:p-3 text-sm sm:text-base"
              >
                <option>Confirmed</option>
                <option>Pending</option>
                <option>Cancelled</option>
              </select>
            </div>

          </div>
        </div>

        {/* ===============================
            Buttons
        =============================== */}

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">

          <button
            onClick={onCancel}
            className="px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            className="px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-green-600 text-white hover:bg-green-700"
          >
            {editingId ? "Update Booking" : "Save Booking"}
          </button>

        </div>

      </div>
    </div>
  );
}
