"use client";

interface BookingModalProps {
  show: boolean;
  editingId: string | null;
  allowBothVillas?: boolean;

  customerName: string;
  phone: string;
  email: string;
  address: string;

  villa: string;
  rainParadiseAmount: string;
  rainHeavenAmount: string;
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
  setRainParadiseAmount: (value: string) => void;
  setRainHeavenAmount: (value: string) => void;
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
  allowBothVillas = false,

  customerName,
  phone,
  email,
  address,

  villa,
  rainParadiseAmount,
  rainHeavenAmount,
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
  setRainParadiseAmount,
  setRainHeavenAmount,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-4 shadow-xl sm:p-8">
        <h2 className="mb-4 text-lg font-bold sm:mb-6 sm:text-2xl">
          {editingId
            ? "Edit Booking"
            : "New Booking"}
        </h2>

        {/* ===============================
            Customer Information
        =============================== */}

        <div className="mb-6 sm:mb-8">
          <h3 className="mb-3 border-b pb-2 text-sm font-semibold sm:mb-4 sm:text-lg">
            Customer Information
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium sm:text-base">
                Customer Name
              </label>

              <input
                type="text"
                value={customerName}
                onChange={(e) =>
                  setCustomerName(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border p-2.5 text-sm sm:p-3 sm:text-base"
                placeholder="Customer Name"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium sm:text-base">
                Phone Number
              </label>

              <input
                type="text"
                value={phone}
                onChange={(e) =>
                  onPhoneChange(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border p-2.5 text-sm sm:p-3 sm:text-base"
                placeholder="9876543210"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium sm:text-base">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border p-2.5 text-sm sm:p-3 sm:text-base"
                placeholder="example@email.com"
              />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label className="mb-1 block text-sm font-medium sm:text-base">
                Address
              </label>

              <textarea
                rows={3}
                value={address}
                onChange={(e) =>
                  setAddress(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border p-2.5 text-sm sm:p-3 sm:text-base"
                placeholder="Customer Address"
              />
            </div>
          </div>
        </div>

        {/* ===============================
            Booking Information
        =============================== */}

        <div className="mb-6 sm:mb-8">
          <h3 className="mb-3 border-b pb-2 text-sm font-semibold sm:mb-4 sm:text-lg">
            Booking Information
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {/* Villa */}

            <div>
              <label className="mb-1 block text-sm font-medium sm:text-base">
                Villa
              </label>

              <select
                value={villa}
                onChange={(e) =>
                  setVilla(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border p-2.5 text-sm sm:p-3 sm:text-base"
              >
                <option>
                  Rain Paradise
                </option>

                <option>
                  Rain Heaven
                </option>

                {/* 
                 * IMPORTANT:
                 * Both Villas is available for
                 * NEW and EDIT bookings.
                 */}
                {(!editingId || allowBothVillas) && (
                  <option>
                    Both Villas
                  </option>
                )}
              </select>
            </div>

            {/* Both Villas Pricing */}

            {villa === "Both Villas" && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium sm:text-base">
                    Rain Paradise Amount
                  </label>

                  <input
                    type="number"
                    min={0}
                    step="1"
                    value={
                      rainParadiseAmount ===
                      ""
                        ? "0"
                        : rainParadiseAmount
                    }
                    onChange={(e) =>
                      setRainParadiseAmount(
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border p-2.5 text-sm sm:p-3 sm:text-base"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium sm:text-base">
                    Rain Heaven Amount
                  </label>

                  <input
                    type="number"
                    min={0}
                    step="1"
                    value={
                      rainHeavenAmount ===
                      ""
                        ? "0"
                        : rainHeavenAmount
                    }
                    onChange={(e) =>
                      setRainHeavenAmount(
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border p-2.5 text-sm sm:p-3 sm:text-base"
                    placeholder="0"
                  />
                </div>
              </>
            )}

            {/* Guests */}

            <div>
              <label className="mb-1 block text-sm font-medium sm:text-base">
                Guests
              </label>

              <input
                type="number"
                min={1}
                value={guests}
                onChange={(e) =>
                  setGuests(
                    Number(
                      e.target.value
                    )
                  )
                }
                className="w-full rounded-lg border p-2.5 text-sm sm:p-3 sm:text-base"
              />
            </div>

            {/* Check In */}

            <div>
              <label className="mb-1 block text-sm font-medium sm:text-base">
                Check In
              </label>

              <input
                type="date"
                value={checkIn}
                onChange={(e) =>
                  setCheckIn(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border p-2.5 text-sm sm:p-3 sm:text-base"
              />
            </div>

            {/* Check Out */}

            <div>
              <label className="mb-1 block text-sm font-medium sm:text-base">
                Check Out
              </label>

              <input
                type="date"
                value={checkOut}
                onChange={(e) =>
                  setCheckOut(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border p-2.5 text-sm sm:p-3 sm:text-base"
              />
            </div>
          </div>
        </div>

        {/* ===============================
            Payment Information
        =============================== */}

        <div className="mb-6 sm:mb-8">
          <h3 className="mb-3 border-b pb-2 text-sm font-semibold sm:mb-4 sm:text-lg">
            Payment Information
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {/* Total Amount */}

            <div>
              <label className="mb-1 block text-sm font-medium sm:text-base">
                Total Amount
              </label>

              <input
                type="number"
                min={0}
                step="1"
                value={
                  totalAmount === ""
                    ? "0"
                    : totalAmount
                }
                onChange={(e) =>
                  setTotalAmount(
                    e.target.value
                  )
                }
                readOnly={
                  villa === "Both Villas"
                }
                className={`w-full rounded-lg border p-2.5 text-sm sm:p-3 sm:text-base ${
                  villa === "Both Villas"
                    ? "bg-gray-100"
                    : ""
                }`}
                placeholder="0"
              />
            </div>

            {/* Advance */}

            <div>
              <label className="mb-1 block text-sm font-medium sm:text-base">
                Advance Paid
              </label>

              <input
                type="number"
                min={0}
                step="1"
                value={
                  advancePaid === ""
                    ? "0"
                    : advancePaid
                }
                onChange={(e) =>
                  setAdvancePaid(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border p-2.5 text-sm sm:p-3 sm:text-base"
                placeholder="0"
              />
            </div>

            {/* Balance */}

            <div>
              <label className="mb-1 block text-sm font-medium sm:text-base">
                Balance Amount
              </label>

              <input
                type="number"
                value={balanceAmount}
                readOnly
                className="w-full rounded-lg border bg-gray-100 p-2.5 text-sm sm:p-3 sm:text-base"
              />
            </div>

            {/* Status */}

            <div>
              <label className="mb-1 block text-sm font-medium sm:text-base">
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border p-2.5 text-sm sm:p-3 sm:text-base"
              >
                <option>
                  Confirmed
                </option>

                <option>
                  Pending
                </option>

                <option>
                  Cancelled
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* ===============================
            Buttons
        =============================== */}

        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row sm:gap-4">
          <button
            onClick={onCancel}
            className="rounded-lg bg-gray-300 px-5 py-2.5 text-sm hover:bg-gray-400 sm:px-6 sm:py-3 sm:text-base"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            className="rounded-lg bg-green-600 px-5 py-2.5 text-sm text-white hover:bg-green-700 sm:px-6 sm:py-3 sm:text-base"
          >
            {editingId
              ? "Update Booking"
              : "Save Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}