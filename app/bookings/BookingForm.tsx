"use client";

import { useEffect, useState } from "react";
import { Booking } from "./bookingTypes";

interface BookingFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (booking: Booking) => Promise<void>;
}

export default function BookingForm({
  open,
  onClose,
  onSave,
}: BookingFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [villa, setVilla] = useState("Rain Paradise");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const [totalAmount, setTotalAmount] = useState(0);
  const [advancePaid, setAdvancePaid] = useState(0);
  const [balanceAmount, setBalanceAmount] = useState(0);

  const [status, setStatus] = useState("Confirmed");

  useEffect(() => {
    setBalanceAmount(totalAmount - advancePaid);
  }, [totalAmount, advancePaid]);

  if (!open) return null;
  return (
  <div className="fixed inset-0 ...
          <div>
          <label className="font-medium">
            Advance Paid
          </label>

          <input
            type="number"
            value={advancePaid}
            onChange={(e) => setAdvancePaid(Number(e.target.value))}
            className="w-full mt-2 border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="font-medium">
            Balance Amount
          </label>

          <input
            type="number"
            value={balanceAmount}
            readOnly
            className="w-full mt-2 border rounded-lg p-3 bg-gray-100"
          />
        </div>

        <div className="col-span-2">
          <label className="font-medium">
            Status
          </label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full mt-2 border rounded-lg p-3"
          >
            <option>Confirmed</option>
            <option>Pending</option>
            <option>Cancelled</option>
          </select>
        </div>

      </div>

      <div className="flex justify-end gap-3 mt-8">

        <button
          onClick={onClose}
          className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            await onSave({
              customerName,
              villa,
              checkIn,
              checkOut,
              guests,
              totalAmount,
              advancePaid,
              balanceAmount,
              status,
            });

            onClose();
          }}
          className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
        >
          Save Booking
        </button>

      </div>

    </div>
  </div>
);
}