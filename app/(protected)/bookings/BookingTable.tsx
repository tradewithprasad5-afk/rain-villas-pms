"use client";

import { Booking, Customer } from "./bookingTypes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

interface BookingTableProps {
  bookings: Booking[];
  customers: Customer[];
  loading: boolean;

  onEdit: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
  onSendConsent: (booking: Booking) => void;
  onCompleteConsent: (id: string) => void;
}

export default function BookingTable({
  bookings,
  customers,
  loading,
  onEdit,
  onDelete,
  onSendConsent,
  onCompleteConsent,
}: BookingTableProps) {
  if (loading) {
    return (
      <div className="rounded-xl bg-white p-10 text-center shadow">
        Loading bookings...
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-xl bg-white p-10 text-center shadow">
        No bookings found.
      </div>
    );
  }
  const formatDateRange = (checkIn: string, checkOut: string) => {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);

  return `${inDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })} → ${outDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
};

  return (
    <>
      {/* ================= MOBILE VIEW ================= */}

      <div className="grid grid-cols-2 gap-2 md:hidden">
        {bookings.map((booking) => {
          const customer = customers.find(
            (c) => c.id === booking.customerId
          );

          return (
            <div
              key={booking.id}
              className="flex flex-col justify-between rounded-xl border bg-white p-2.5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="truncate text-xs font-semibold">
                    {booking.customerName}
                  </h3>

                  
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded-md p-1 hover:bg-gray-100">
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onEdit(booking)}
                    >
                      ✏️ Edit Booking
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => onSendConsent(booking)}
                    >
                      📲 Send Consent
                    </DropdownMenuItem>

                    {booking.consentStatus === "Completed" ? (
                      <DropdownMenuItem
                        onClick={() => {
                          window.location.href = `/admin/consents/${booking.bookingNumber}`;
                        }}
                      >
                        👁 View Consent
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem disabled>
                        👁 View Consent
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDelete(booking)}
                    >
                      🗑 Delete Booking
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-2">
  <p className="truncate text-xs text-gray-600">
  {booking.villa}
</p>

  <p className="mt-1 text-sm font-bold text-green-700">
  ₹{booking.totalAmount}
</p>

  <p className="mt-1 text-xs text-gray-500">
  {formatDateRange(booking.checkIn, booking.checkOut)}
</p>

  <div className="mt-2 border-t pt-2 flex flex-wrap gap-1">
  {booking.consentStatus !== "Completed" && (
    <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-[10px] font-medium text-amber-700">
      Consent Pending
    </span>
  )}

  {booking.balanceAmount > 0 && (
    <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-[10px] font-medium text-red-700">
      Balance ₹{booking.balanceAmount}
    </span>
  )}
</div>
</div>
            </div>
          );
        })}
      </div>

      {/* ================= DESKTOP VIEW ================= */}

      <div className="hidden md:block w-full overflow-x-auto rounded-xl bg-white shadow">
        <table className="min-w-[1200px] w-full">
  <thead className="bg-gray-100">
    <tr>
      <th className="px-2 py-3 text-left text-sm md:px-4 md:py-4">Customer</th>
      <th className="px-2 py-3 text-left text-sm md:px-4 md:py-4">Phone</th>
      <th className="px-2 py-3 text-left text-sm md:px-4 md:py-4">Villa</th>
      <th className="px-2 py-3 text-left text-sm md:px-4 md:py-4">Check In</th>
      <th className="px-2 py-3 text-left text-sm md:px-4 md:py-4">Check Out</th>
      <th className="px-2 py-3 text-left text-sm md:px-4 md:py-4">Guests</th>
      <th className="px-2 py-3 text-left text-sm md:px-4 md:py-4">Amount</th>
      <th className="px-2 py-3 text-left text-sm md:px-4 md:py-4">Status</th>
      <th className="px-2 py-3 text-center text-sm md:px-4 md:py-4">
        Consent Status
      </th>
      <th className="px-2 py-3 text-center text-sm md:px-4 md:py-4">
        Actions
      </th>
    </tr>
  </thead>

  <tbody>
    {bookings.map((booking) => {
      const customer = customers.find(
        (c) => c.id === booking.customerId
      );

      return (
        <tr
          key={booking.id}
          className="border-t hover:bg-gray-50"
        >
          <td className="px-2 py-3 text-sm md:px-4 md:py-4">
            {booking.customerName}
          </td>

          <td className="px-2 py-3 text-sm md:px-4 md:py-4">
            {customer?.phone || "-"}
          </td>

          <td className="px-2 py-3 text-sm md:px-4 md:py-4">
            {booking.villa}
          </td>

          <td className="px-2 py-3 text-sm md:px-4 md:py-4">
            {booking.checkIn}
          </td>

          <td className="px-2 py-3 text-sm md:px-4 md:py-4">
            {booking.checkOut}
          </td>

          <td className="px-2 py-3 text-sm md:px-4 md:py-4">
            {booking.guests}
          </td>

          <td className="px-2 py-3 text-sm font-semibold md:px-4 md:py-4">
            ₹{booking.totalAmount}
          </td>

          <td className="px-2 py-3 text-sm md:px-4 md:py-4">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                booking.status === "Confirmed"
                  ? "bg-green-100 text-green-700"
                  : booking.status === "Pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {booking.status}
            </span>
          </td>

          <td className="px-2 py-3 text-sm md:px-4 md:py-4">
            <div className="flex flex-col items-center gap-2 lg:flex-row lg:justify-center">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  booking.consentStatus === "Completed"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {booking.consentStatus || "Pending"}
              </span>

              {booking.consentStatus !== "Completed" && (
                <button
                  onClick={() => onCompleteConsent(booking.id)}
                  className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-700"
                >
                  ✓ Complete
                </button>
              )}
            </div>
          </td>

          <td className="px-2 py-3 text-center md:px-4 md:py-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-md border px-2 py-2 text-xs hover:bg-gray-100 md:gap-2 md:px-3 md:text-sm">
                <MoreVertical className="h-4 w-4" />
                Actions
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => onEdit(booking)}
                >
                  ✏️ Edit Booking
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onSendConsent(booking)}
                >
                  📲 Send Consent
                </DropdownMenuItem>

                {booking.consentStatus === "Completed" ? (
                  <DropdownMenuItem
                    onClick={() => {
                      window.location.href = `/admin/consents/${booking.bookingNumber}`;
                    }}
                  >
                    👁 View Consent
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem disabled>
                    👁 View Consent
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={() => onDelete(booking)}
                  className="text-red-600"
                >
                  🗑 Delete Booking
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </td>
        </tr>
      );
    })}
  </tbody>
</table>
</div>
</>
);
}