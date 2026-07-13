"use client";

import { Booking } from "./bookingTypes";
import { FaEdit, FaTrash } from "react-icons/fa";

interface BookingTableProps {
  bookings: Booking[];
  onEdit?: (booking: Booking) => void;
  onDelete?: (id: string) => void;
}

export default function BookingTable({
  bookings,
  onEdit,
  onDelete,
}: BookingTableProps) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">

      <table className="w-full">

        <thead className="bg-gray-100">

          <tr>

            <th className="text-left p-4">Customer</th>
            <th className="text-left p-4">Villa</th>
            <th className="text-left p-4">Check In</th>
            <th className="text-left p-4">Check Out</th>
            <th className="text-left p-4">Guests</th>
            <th className="text-left p-4">Amount</th>
            <th className="text-left p-4">Status</th>
            <th className="text-left p-4">Actions</th>

          </tr>

        </thead>

        <tbody>

          {bookings.map((booking) => (

            <tr key={booking.id} className="border-b hover:bg-gray-50">

              <td className="p-4">{booking.customerName}</td>

              <td className="p-4">{booking.villa}</td>

              <td className="p-4">{booking.checkIn}</td>

              <td className="p-4">{booking.checkOut}</td>

              <td className="p-4">{booking.guests}</td>

              <td className="p-4 font-semibold">
                ₹{booking.totalAmount}
              </td>

              <td className="p-4">

                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold
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

              <td className="p-4">

                <div className="flex gap-3">

                  <button
                    onClick={() => onEdit?.(booking)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit />
                  </button>

                  <button
                    onClick={() => booking.id && onDelete?.(booking.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>

                </div>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}