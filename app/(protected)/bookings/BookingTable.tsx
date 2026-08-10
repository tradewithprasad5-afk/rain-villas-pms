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
function groupBookings(bookings: Booking[]): CombinedBooking[] {
  const groups = new Map<string, Booking[]>();

  for (const booking of bookings) {
    const customerName =
      booking.customerName?.trim().toLowerCase() || "";

    const key = booking.customerId
      ? `customer:${booking.customerId}`
      : `name:${customerName}`;

    const existing = groups.get(key);

    if (existing) {
      existing.push(booking);
    } else {
      groups.set(key, [booking]);
    }
  }

  return Array.from(groups.values()).map((sourceBookings) => {
    const first = sourceBookings[0];

    const bookingNumbers = Array.from(
      new Set(
        sourceBookings
          .map((booking) => booking.bookingNumber)
          .filter(Boolean)
      )
    );

    const villas = Array.from(
      new Set(
        sourceBookings
          .map((booking) => booking.villa)
          .filter(Boolean)
      )
    );

    const checkIns = sourceBookings
      .map((booking) => booking.checkIn)
      .filter(Boolean)
      .sort(
        (a, b) =>
          new Date(a).getTime() - new Date(b).getTime()
      );

    const checkOuts = sourceBookings
      .map((booking) => booking.checkOut)
      .filter(Boolean)
      .sort(
        (a, b) =>
          new Date(b).getTime() - new Date(a).getTime()
      );

    const totalAmount = sourceBookings.reduce(
      (sum, booking) => sum + Number(booking.totalAmount || 0),
      0
    );

    const advancePaid = sourceBookings.reduce(
      (sum, booking) => sum + Number(booking.advancePaid || 0),
      0
    );

    const balanceAmount = sourceBookings.reduce(
      (sum, booking) => sum + Number(booking.balanceAmount || 0),
      0
    );

    return {
      ...first,

      bookingNumber: bookingNumbers.join(" + ") || first.bookingNumber,
      villa: villas.join(" + ") || first.villa,

      // For a combined customer, show the earliest check-in
      // and latest check-out, matching the compact old UI.
      checkIn: checkIns[0] || first.checkIn,
      checkOut: checkOuts[0] || first.checkOut,

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

  const groupedBookings = groupBookings(bookings);

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
    return booking.sourceBookings.flatMap((sourceBooking) => {
      const items: React.ReactNode[] = [
        <DropdownMenuItem
          key={`${sourceBooking.id}-edit`}
          onClick={() => onEdit(sourceBooking)}
        >
          ✏️ Edit{" "}
          {isCombined(booking)
            ? sourceBooking.bookingNumber
            : "Booking"}
        </DropdownMenuItem>,

        <DropdownMenuItem
          key={`${sourceBooking.id}-consent`}
          onClick={() => onSendConsent(sourceBooking)}
        >
          📲 Send Consent{" "}
          {isCombined(booking)
            ? sourceBooking.bookingNumber
            : ""}
        </DropdownMenuItem>,
      ];

      if (sourceBooking.consentStatus === "Completed") {
        items.push(
          <DropdownMenuItem
            key={`${sourceBooking.id}-view`}
            onClick={() => {
              window.location.href = `/admin/consents/${sourceBooking.bookingNumber}`;
            }}
          >
            👁 View Consent{" "}
            {isCombined(booking)
              ? sourceBooking.bookingNumber
              : ""}
          </DropdownMenuItem>
        );
      } else {
        items.push(
          <DropdownMenuItem
            key={`${sourceBooking.id}-complete`}
            onClick={() => onCompleteConsent(sourceBooking.id)}
          >
            ✓ Mark Consent Complete{" "}
            {isCombined(booking)
              ? sourceBooking.bookingNumber
              : ""}
          </DropdownMenuItem>
        );
      }

      items.push(
        <DropdownMenuItem
          key={`${sourceBooking.id}-delete`}
          onClick={() => onDelete(sourceBooking)}
          className="text-red-600"
        >
          🗑 Delete{" "}
          {isCombined(booking)
            ? sourceBooking.bookingNumber
            : "Booking"}
        </DropdownMenuItem>
      );

      return items;
    });
  };

  return (
    <>
      {/* ================= MOBILE VIEW ================= */}
      {/* Same compact 2-column UI as the old version. */}
      <div className="grid grid-cols-2 gap-2.5 md:hidden">
        {groupedBookings.map((booking) => {
          const customer = customers.find(
            (c) => c.id === booking.customerId
          );

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
                {!consentCompleted &&
                  booking.sourceBookings.length === 1 && (
                    <button
                      onClick={() =>
                        onCompleteConsent(
                          booking.sourceBookings[0].id
                        )
                      }
                      className="rounded-md bg-green-600 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-green-700"
                    >
                      ✓ Complete
                    </button>
                  )}

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
          const customer = customers.find(
            (c) => c.id === booking.customerId
          );

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
                    {customer?.phone || "-"} ·{" "}
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
