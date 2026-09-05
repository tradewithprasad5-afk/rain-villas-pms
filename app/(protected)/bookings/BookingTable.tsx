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
  onSendConsent: (booking: Booking, relatedBookings?: Booking[]) => void;
  onCompleteConsent: (id: string, relatedBookings?: Booking[]) => void;
}

interface CombinedBooking extends Booking {
  sourceBookings: Booking[];
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const second =
    parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : "";

  return (first + second).toUpperCase();
}

// Same deterministic avatar colors as the old UI.
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

/*
 * IMPORTANT:
 * This groups bookings ONLY for display.
 *
 * Firestore bookings stay as separate documents.
 * Edit / Delete / Consent actions always receive
 * the original booking object.
 */
function normalizeDate(value: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toISOString().slice(0, 10);
}

function normalizePhone(value?: string) {
  return (value || "").replace(/\D/g, "");
}

function getBookingPhone(booking: Booking, customers: Customer[]) {
  const customer = customers.find((item) => item.id === booking.customerId);
  return normalizePhone(customer?.phone);
}

function getStayGroupKey(booking: Booking, customers: Customer[]) {
  const phone = getBookingPhone(booking, customers);
  const name = booking.customerName.trim().toLowerCase();

  // Phone is the primary identity for grouping. Customer IDs are deliberately
  // NOT used because old bookings can have duplicate customer documents.
  const guestKey = phone ? `phone:${phone}` : `name:${name}`;

  return `${guestKey}|${normalizeDate(booking.checkIn)}|${normalizeDate(
    booking.checkOut
  )}`;
}

/*
 * Groups ONLY bookings that belong to the same guest/stay.
 * Same guest phone + same check-in + same check-out = one display card.
 * Different dates remain separate cards.
 * Firestore documents are never merged.
 */
function groupBookings(bookings: Booking[], customers: Customer[]): CombinedBooking[] {
  const groups = new Map<string, Booking[]>();

  for (const booking of bookings) {
    const key = getStayGroupKey(booking, customers);
    const existing = groups.get(key);
    if (existing) existing.push(booking);
    else groups.set(key, [booking]);
  }

  return Array.from(groups.values()).map((sourceBookings) => {
    const first = sourceBookings[0];
    const bookingNumbers = Array.from(
      new Set(sourceBookings.map((b) => b.bookingNumber).filter(Boolean))
    );
    const villas = Array.from(
      new Set(sourceBookings.map((b) => b.villa).filter(Boolean))
    );

    const totalAmount = sourceBookings.reduce(
      (sum, b) => sum + Number(b.totalAmount || 0),
      0
    );
    const advancePaid = sourceBookings.reduce(
      (sum, b) => sum + Number(b.advancePaid || 0),
      0
    );
    const balanceAmount = sourceBookings.reduce(
      (sum, b) => sum + Number(b.balanceAmount || 0),
      0
    );

    return {
      ...first,
      bookingNumber: bookingNumbers.join(" + ") || first.bookingNumber,
      villa: villas.join(" + ") || first.villa,
      totalAmount,
      advancePaid,
      balanceAmount,
      sourceBookings,
    };
  });
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

  const groupedBookings = groupBookings(bookings, customers);

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

  const getStatusClasses = (status: string) => {
    if (status === "Confirmed") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Pending") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (status === "Cancelled") {
      return "bg-red-100 text-red-700";
    }

    return "bg-slate-100 text-slate-700";
  };

  const getCombinedStatus = (booking: CombinedBooking) => {
    const statuses = Array.from(
      new Set(
        booking.sourceBookings
          .map((item) => item.status)
          .filter(Boolean)
      )
    );

    if (statuses.length === 1) {
      return statuses[0];
    }

    return "Multiple";
  };

  const isCombined = (booking: CombinedBooking) =>
    booking.sourceBookings.length > 1;

  const isConsentCompleted = (booking: CombinedBooking) =>
    booking.sourceBookings.every(
      (item) => item.consentStatus === "Completed"
    );

  const renderActions = (booking: CombinedBooking) => {
    const primaryBooking = booking.sourceBookings[0];
    const consentCompleted = booking.sourceBookings.every(
      (item) => item.consentStatus === "Completed"
    );

    const items: React.ReactNode[] = [];

    booking.sourceBookings.forEach((sourceBooking) => {
      items.push(
        <DropdownMenuItem
          key={`${sourceBooking.id}-edit`}
          onClick={() => onEdit(sourceBooking)}
        >
          ✏️ Edit {isCombined(booking) ? sourceBooking.bookingNumber : "Booking"}
        </DropdownMenuItem>
      );
    });

    items.push(
      <DropdownMenuItem
        key={`${booking.id}-consent-send`}
        disabled={consentCompleted}
        onClick={() => onSendConsent(primaryBooking, booking.sourceBookings)}
      >
        📲 {consentCompleted ? "Consent Completed" : "Send Consent"}
      </DropdownMenuItem>
    );

    if (consentCompleted) {
      items.push(
        <DropdownMenuItem
          key={`${booking.id}-view-consent`}
          onClick={() => {
            window.location.href = `/admin/consents/${primaryBooking.bookingNumber}`;
          }}
        >
          👁 View Consent
        </DropdownMenuItem>
      );
    } else {
      items.push(
        <DropdownMenuItem
          key={`${booking.id}-complete-consent`}
          onClick={() => onCompleteConsent(primaryBooking.id, booking.sourceBookings)}
        >
          ✓ Mark Consent Complete
        </DropdownMenuItem>
      );
    }

    booking.sourceBookings.forEach((sourceBooking) => {
      items.push(
        <DropdownMenuItem
          key={`${sourceBooking.id}-delete`}
          onClick={() => onDelete(sourceBooking)}
          className="text-red-600"
        >
          🗑 Delete {isCombined(booking) ? sourceBooking.bookingNumber : "Booking"}
        </DropdownMenuItem>
      );
    });

    return items;
  };

  return (
    <>
      {/* ================= MOBILE VIEW ================= */}
      {/* Same compact 2-column UI as the old version. */}
      <div className="grid grid-cols-2 gap-2.5 md:hidden">
        {groupedBookings.map((booking) => {
          const consentCompleted =
            isConsentCompleted(booking);

          const status = getCombinedStatus(booking);
          const avatar = avatarColor(booking.customerName);

          return (
            <div
              key={booking.id}
              className="relative flex flex-col overflow-visible rounded-2xl border bg-white p-3 shadow"
            >
              <div className="flex min-w-0 items-start justify-between gap-1">
                <div className="flex min-w-0 items-center gap-2">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${avatar.bg} ${avatar.text}`}
                  >
                    {getInitials(booking.customerName)}
                  </div>

                  <h3 className="line-clamp-2 text-sm font-semibold leading-tight">
                    {booking.customerName}
                  </h3>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger className="-m-0.5 shrink-0 rounded-md p-1 hover:bg-gray-100">
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="max-h-[70vh] w-[min(18rem,calc(100vw-2rem))] overflow-y-auto"
                  >
                    {renderActions(booking)}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="mt-0.5 line-clamp-2 text-[11px] text-gray-500">
                {booking.villa}
              </p>

              <p className="mt-1 text-[10px] text-gray-400">
                {booking.bookingNumber}
              </p>

              <p className="mt-2 text-[22px] font-bold leading-none text-gray-900">
                ₹
                {Number(booking.totalAmount || 0).toLocaleString(
                  "en-IN"
                )}
              </p>

              <div className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-500">
                <span>📅</span>
                <span className="truncate">
                  {formatDateRange(
                    booking.checkIn,
                    booking.checkOut
                  )}
                </span>
              </div>

              <div className="mt-auto mt-2 flex flex-wrap items-center gap-1.5 border-t pt-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getStatusClasses(
                    status
                  )}`}
                >
                  {status}
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

                {/* Keep the old inline Complete button for
                    single bookings. For combined bookings,
                    completion is available per booking in ⋮. */}
                

                {booking.balanceAmount > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                    Balance ₹
                    {Number(
                      booking.balanceAmount
                    ).toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= DESKTOP VIEW ================= */}
      {/* Same row-list style as the old version. */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
        {groupedBookings.map((booking, index) => {
          const consentCompleted =
            isConsentCompleted(booking);

          const status = getCombinedStatus(booking);
          const avatar = avatarColor(booking.customerName);

          return (
            <div
              key={booking.id}
              className={`flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-slate-50 ${
                index !== 0
                  ? "border-t border-slate-100"
                  : ""
              }`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatar.bg} ${avatar.text}`}
                >
                  {getInitials(booking.customerName)}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {booking.customerName}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {customers.find((c) => c.id === booking.customerId)?.phone || "-"} ·{" "}
                    {booking.villa} ·{" "}
                    {formatDateRange(
                      booking.checkIn,
                      booking.checkOut
                    )}
                  </p>

                  <p className="mt-0.5 truncate text-[11px] text-slate-400">
                    {booking.bookingNumber}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">
                    ₹
                    {Number(
                      booking.totalAmount || 0
                    ).toLocaleString("en-IN")}
                  </p>

                  <p
                    className={`mt-0.5 text-[11px] ${
                      booking.balanceAmount > 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {booking.balanceAmount > 0
                      ? `₹${Number(
                          booking.balanceAmount
                        ).toLocaleString(
                          "en-IN"
                        )} due`
                      : "Fully paid"}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${getStatusClasses(
                    status
                  )}`}
                >
                  {status}
                </span>

                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    consentCompleted
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {consentCompleted
                    ? "Consent done"
                    : "Consent pending"}
                </span>

                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded-md p-1.5 hover:bg-slate-100">
                    <MoreVertical className="h-4 w-4 text-slate-500" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="max-h-[70vh] w-64 overflow-y-auto"
                  >
                    {renderActions(booking)}
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
