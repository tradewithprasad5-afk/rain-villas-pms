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
  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow">
      <table className="min-w-[1100px] w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 text-left">Customer</th>

            <th className="p-4 text-left">Phone</th>

            <th className="p-4 text-left">Villa</th>

            <th className="p-4 text-left">Check In</th>

            <th className="p-4 text-left">Check Out</th>

            <th className="p-4 text-left">Guests</th>

            <th className="p-4 text-left">Amount</th>

            <th className="p-4 text-left">Status</th>

            <th className="p-4 text-center">
              Consent Status
            </th>

            <th className="p-4 text-center">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={10}
                className="text-center py-10 text-gray-500"
              >
                Loading bookings...
              </td>
            </tr>
          ) : bookings.length === 0 ? (
            <tr>
              <td
                colSpan={10}
                className="text-center py-10 text-gray-500"
              >
                No bookings found.
              </td>
            </tr>
          ) : (
            bookings.map((booking) => {
              const customer = customers.find(
                (c) => c.id === booking.customerId
              );

              return (
                <tr
                  key={booking.id}
                  className="border-t hover:bg-gray-50"
                >
                  {/* Customer */}

                  <td className="p-4">
                    {booking.customerName}
                  </td>

                  {/* Phone */}

                  <td className="p-4">
                    {customer?.phone || "-"}
                  </td>

                  {/* Villa */}

                  <td className="p-4">
                    {booking.villa}
                  </td>

                  {/* Check In */}

                  <td className="p-4">
                    {booking.checkIn}
                  </td>

                  {/* Check Out */}

                  <td className="p-4">
                    {booking.checkOut}
                  </td>

                  {/* Guests */}

                  <td className="p-4">
                    {booking.guests}
                  </td>

                  {/* Amount */}

                  <td className="p-4 font-semibold">
                    ₹{booking.totalAmount}
                  </td>

                  {/* Status */}

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium
                      ${
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
                                    {/* Consent */}

                  <td className="p-4">
                    <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
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

                  {/* Actions */}

                  <td className="p-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-100">
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
            })
          )}
        </tbody>
              </table>
    </div>
  );
}