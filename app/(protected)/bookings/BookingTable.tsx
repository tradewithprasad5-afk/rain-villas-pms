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

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const second = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + second).toUpperCase();
}

// Deterministic color per guest, purely cosmetic, so avatars aren't
// all the same color — hashed from the name so it stays stable
// across renders.
const AVATAR_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-teal-100", text: "text-teal-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-pink-100", text: "text-pink-700" },
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
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
  })} → ${outDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })}`;
};

  return (
    <>
      {/* ================= MOBILE VIEW ================= */}

      <div className="grid grid-cols-2 gap-2.5 md:hidden">
        {bookings.map((booking) => {
          const customer = customers.find(
            (c) => c.id === booking.customerId
          );

          const consentCompleted =
            booking.consentStatus === "Completed";

          const avatar = avatarColor(booking.customerName);

          return (
            <div
              key={booking.id}
              className="relative flex flex-col rounded-2xl border bg-white p-3 shadow overflow-visible"
            >
              <div className="flex items-start justify-between gap-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${avatar.bg} ${avatar.text}`}
                  >
                    {getInitials(booking.customerName)}
                  </div>
                  <h3 className="text-sm font-semibold leading-tight line-clamp-2">
                    {booking.customerName}
                  </h3>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger className="-m-0.5 shrink-0 rounded-md p-1 hover:bg-gray-100">
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

                    {consentCompleted ? (
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

              <p className="mt-0.5 text-[11px] text-gray-500">
                {booking.villa}
              </p>

              <p className="mt-2 text-[22px] font-bold leading-none text-gray-900">
                ₹{booking.totalAmount}
              </p>

              <div className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-500">
                <span>📅</span>
                {formatDateRange(booking.checkIn, booking.checkOut)}
              </div>

              <div className="mt-auto flex flex-wrap items-center gap-1.5 border-t pt-2 mt-2">

                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    booking.status === "Confirmed"
                      ? "bg-green-100 text-green-700"
                      : booking.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {booking.status}
                </span>

                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    consentCompleted
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {consentCompleted ? "Completed" : "Pending"}
                </span>

                {!consentCompleted && (
                  <button
                    onClick={() => onCompleteConsent(booking.id)}
                    className="rounded-md bg-green-600 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-green-700"
                  >
                    ✓ Complete
                  </button>
                )}

                {booking.balanceAmount > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                    Balance ₹{booking.balanceAmount}
                  </span>
                )}

              </div>
            </div>
          );
        })}
      </div>

      {/* ================= DESKTOP VIEW ================= */}
      {/* Row-list style instead of a wide fixed-column table —
          scales better and reads more like a modern SaaS app. */}

      <div className="hidden md:block rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {bookings.map((booking, index) => {
          const customer = customers.find(
            (c) => c.id === booking.customerId
          );

          const consentCompleted =
            booking.consentStatus === "Completed";

          const avatar = avatarColor(booking.customerName);

          return (
            <div
              key={booking.id}
              className={`flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-slate-50 transition ${
                index !== 0 ? "border-t border-slate-100" : ""
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatar.bg} ${avatar.text}`}
                >
                  {getInitials(booking.customerName)}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {booking.customerName}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 truncate">
                    {customer?.phone || "-"} · {booking.villa} ·{" "}
                    {formatDateRange(booking.checkIn, booking.checkOut)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">
                    ₹{booking.totalAmount.toLocaleString("en-IN")}
                  </p>
                  <p
                    className={`mt-0.5 text-[11px] ${
                      booking.balanceAmount > 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {booking.balanceAmount > 0
                      ? `₹${booking.balanceAmount.toLocaleString(
                          "en-IN"
                        )} due`
                      : "Fully paid"}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    booking.status === "Confirmed"
                      ? "bg-green-100 text-green-700"
                      : booking.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {booking.status}
                </span>

                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    consentCompleted
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {consentCompleted ? "Consent done" : "Consent pending"}
                </span>

                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded-md p-1.5 hover:bg-slate-100">
                    <MoreVertical className="h-4 w-4 text-slate-500" />
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

                    {consentCompleted ? (
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

                    {!consentCompleted && (
                      <DropdownMenuItem
                        onClick={() => onCompleteConsent(booking.id)}
                      >
                        ✓ Mark Consent Complete
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
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
