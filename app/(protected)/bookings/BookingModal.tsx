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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8">
        <h2 className="text-2xl font-bold mb-6">
          {editingId ? "Edit Booking" : "New Booking"}
        </h2>

        {/* ===============================
            Customer Information
        =============================== */}

        <div className="mb-8">
          <h3 className="text-lg font-semibold border-b pb-2 mb-4">
            Customer Information
          </h3>

          <div className="grid grid-cols-2 gap-4">

            {/* Customer Name */}

            <div>
              <label className="block mb-1 font-medium">
                Customer Name
              </label>

              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="Customer Name"
              />
            </div>

            {/* Phone */}

            <div>
              <label className="block mb-1 font-medium">
                Phone Number
              </label>

              <input
                type="text"
                value={phone}
               onChange={(e) => onPhoneChange(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="9876543210"
              />
            </div>

            {/* Email */}

            <div>
              <label className="block mb-1 font-medium">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="example@email.com"
              />
            </div>

            {/* Address */}

            <div className="col-span-2">
              <label className="block mb-1 font-medium">
                Address
              </label>

              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="Customer Address"
              />
            </div>

          </div>
        </div>
                {/* ===============================
            Booking Information
        =============================== */}

        <div className="mb-8">
          <h3 className="text-lg font-semibold border-b pb-2 mb-4">
            Booking Information
          </h3>

          <div className="grid grid-cols-2 gap-4">

            {/* Villa */}

            <div>
              <label className="block mb-1 font-medium">
                Villa
              </label>

              <select
                value={villa}
                onChange={(e) => setVilla(e.target.value)}
                className="w-full border rounded-lg p-3"
              >
                <option>Rain Paradise</option>
                <option>Rain Heaven</option>
              </select>
            </div>

            {/* Guests */}

            <div>
              <label className="block mb-1 font-medium">
                Guests
              </label>

              <input
                type="number"
                min={1}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* Check In */}

            <div>
              <label className="block mb-1 font-medium">
                Check In
              </label>

              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* Check Out */}

            <div>
              <label className="block mb-1 font-medium">
                Check Out
              </label>

              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full border rounded-lg p-3"
              />
            </div>

          </div>
        </div>

        {/* ===============================
            Payment Information
        =============================== */}

        <div className="mb-8">
          <h3 className="text-lg font-semibold border-b pb-2 mb-4">
            Payment Information
          </h3>

          <div className="grid grid-cols-2 gap-4">

            {/* Total Amount */}

            <div>
              <label className="block mb-1 font-medium">
                Total Amount
              </label>

              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="Total Amount"
              />
            </div>

            {/* Advance */}

            <div>
              <label className="block mb-1 font-medium">
                Advance Paid
              </label>

              <input
                type="number"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="Advance Paid"
              />
            </div>

            {/* Balance */}

            <div>
              <label className="block mb-1 font-medium">
                Balance Amount
              </label>

              <input
                type="number"
                value={balanceAmount}
                readOnly
                className="w-full border rounded-lg p-3 bg-gray-100"
              />
            </div>

            {/* Status */}

            <div>
              <label className="block mb-1 font-medium">
                Status
              </label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border rounded-lg p-3"
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

        <div className="flex justify-end gap-4">

          <button
            onClick={onCancel}
            className="px-6 py-3 rounded-lg bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            className="px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700"
          >
            {editingId ? "Update Booking" : "Save Booking"}
          </button>

        </div>

      </div>
    </div>
  );
}