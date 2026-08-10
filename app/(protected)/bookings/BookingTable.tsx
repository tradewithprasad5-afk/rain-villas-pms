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
 * This only combines bookings for DISPLAY.
 *
 * Firestore bookings remain separate.
 *
 * Example:
 *
 * Pradip Jain
 * RV-0005 - Rain Paradise
 * RV-0015 - Rain Heaven
 *
 * will display as one customer card/row,
 * while Edit/Delete/Consent still work
 * on the original individual booking.
 */
function groupBookings(bookings: Booking[]): CombinedBooking[] {
  const groups = new Map<string, Booking[]>();

  bookings.forEach((booking) => {
    const customerName =
      booking.customerName?.trim().toLowerCase() || "";

    const groupKey = booking.customerId
      ? `customer:${booking.customerId}`
      : `customer-name:${customerName}`;

    const existing = groups.get(groupKey);

    if (existing) {
      existing.push(booking);
    } else {
      groups.set(groupKey, [booking]);
    }
  });

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
          new Date(a).getTime() -
          new Date(b).getTime()
      );

    const checkOuts = sourceBookings
      .map((booking) => booking.checkOut)
      .filter(Boolean)
      .sort(
        (a, b) =>
          new Date(b).getTime() -
          new Date(a).getTime()
      );

    const totalAmount = sourceBookings.reduce(
      (sum, booking) =>
        sum + Number(booking.totalAmount || 0),
      0
    );

    const advancePaid = sourceBookings.reduce(
      (sum, booking) =>
        sum + Number(booking.advancePaid || 0),
      0
    );

    const balanceAmount = sourceBookings.reduce(
      (sum, booking) =>
        sum + Number(booking.balanceAmount || 0),
      0
    );

    return {
      ...first,

      bookingNumber:
        bookingNumbers.join(" + ") ||
        first.bookingNumber,

      villa:
        villas.join(" + ") ||
        first.villa,

      checkIn:
        checkIns[0] ||
        first.checkIn,

      checkOut:
        checkOuts[0] ||
        first.checkOut,

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
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm sm:p-10">
        <p className="text-sm text-slate-500">
          Loading bookings...
        </p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm sm:p-10">
        <p className="text-sm text-slate-500">
          No bookings found.
        </p>
      </div>
    );
  }

  const groupedBookings = groupBookings(bookings);

  const formatDate = (date: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "numeric",
        month: "short",
      }
    );
  };

  const formatDateRange = (
    checkIn: string,
    checkOut: string
  ) => {
    return `${formatDate(checkIn)} → ${formatDate(
      checkOut
    )}`;
  };

  const getStatus = (
    booking: CombinedBooking
  ) => {
    const statuses = Array.from(
      new Set(
        booking.sourceBookings.map(
          (item) => item.status
        )
      )
    );

    if (statuses.length === 1) {
      return statuses[0];
    }

    return "Multiple";
  };

  const getStatusClasses = (
    status: string
  ) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-700";

      case "Pending":
        return "bg-yellow-100 text-yellow-700";

      case "Cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const isConsentCompleted = (
    booking: CombinedBooking
  ) => {
    return booking.sourceBookings.every(
      (sourceBooking) =>
        sourceBooking.consentStatus ===
        "Completed"
    );
  };

  /*
   * Every action still operates on the
   * ORIGINAL booking.
   */
  const getMenuItems = (
    booking: CombinedBooking
  ) => {
    return booking.sourceBookings.flatMap(
      (sourceBooking) => {
        const items: {
          label: string;
          onClick: () => void;
        }[] = [
          {
            label: `✏️ Edit ${
              sourceBooking.bookingNumber ||
              "Booking"
            }`,
            onClick: () =>
              onEdit(sourceBooking),
          },

          {
            label: `📲 Send Consent ${
              sourceBooking.bookingNumber || ""
            }`.trim(),

            onClick: () =>
              onSendConsent(sourceBooking),
          },
        ];

        if (
          sourceBooking.consentStatus ===
          "Completed"
        ) {
          items.push({
            label: `👁 View Consent ${
              sourceBooking.bookingNumber || ""
            }`.trim(),

            onClick: () => {
              window.location.href =
                `/admin/consents/${sourceBooking.bookingNumber}`;
            },
          });
        } else {
          items.push({
            label: `✓ Mark Consent Complete ${
              sourceBooking.bookingNumber || ""
            }`.trim(),

            onClick: () =>
              onCompleteConsent(
                sourceBooking.id
              ),
          });
        }

        items.push({
          label: `🗑 Delete ${
            sourceBooking.bookingNumber ||
            "Booking"
          }`,

          onClick: () =>
            onDelete(sourceBooking),
        });

        return items;
      }
    );
  };

  return (
    <>
      {/* =====================================================
          MOBILE + TABLET CARD VIEW
          Phones: 1 column
          Tablets: 2 columns
          Desktop: hidden
      ===================================================== */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden">
        {groupedBookings.map((booking) => {
          const status = getStatus(booking);
          const consentCompleted =
            isConsentCompleted(booking);

          const avatar = avatarColor(
            booking.customerName
          );

          const customer = customers.find(
            (customer) =>
              customer.id ===
              booking.customerId
          );

          return (
            <div
              key={booking.id}
              className="relative flex min-w-0 flex-col overflow-visible rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:shadow-md sm:p-4"
            >
              {/* HEADER */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${avatar.bg} ${avatar.text}`}
                  >
                    {getInitials(
                      booking.customerName
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-slate-900 sm:text-[15px]">
                      {booking.customerName}
                    </h3>

                    {customer?.phone && (
                      <p className="mt-0.5 truncate text-[11px] text-slate-500">
                        {customer.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* ACTION MENU */}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="shrink-0 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 active:bg-slate-200"
                    aria-label="Booking actions"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    sideOffset={6}
                    className="max-h-[70vh] w-[min(18rem,calc(100vw-2rem))] overflow-y-auto"
                  >
                    {getMenuItems(booking).map(
                      (item, index) => (
                        <DropdownMenuItem
                          key={index}
                          onClick={
                            item.onClick
                          }
                          className="min-h-10 cursor-pointer text-sm"
                        >
                          {item.label}
                        </DropdownMenuItem>
                      )
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* VILLA */}
              <p className="mt-2 line-clamp-2 text-xs font-medium text-slate-500">
                {booking.villa}
              </p>

              {/* BOOKING NUMBER */}
              <p className="mt-2 line-clamp-2 text-[11px] text-slate-400">
                Booking:{" "}
                {booking.bookingNumber || "-"}
              </p>

              {/* AMOUNT */}
              <p className="mt-3 text-[22px] font-bold leading-none text-slate-900 sm:text-2xl">
                ₹
                {Number(
                  booking.totalAmount || 0
                ).toLocaleString("en-IN")}
              </p>

              {/* DATES */}
              <div className="mt-2 flex min-w-0 items-center gap-1.5 text-[11px] text-slate-500">
                <span className="shrink-0">
                  📅
                </span>

                <span className="truncate">
                  {formatDateRange(
                    booking.checkIn,
                    booking.checkOut
                  )}
                </span>
              </div>

              {/* STATUS */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2.5">
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold ${getStatusClasses(
                    status
                  )}`}
                >
                  {status}
                </span>

                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                    consentCompleted
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {consentCompleted
                    ? "Consent done"
                    : "Consent pending"}
                </span>

                {booking.balanceAmount >
                  0 && (
                  <span className="rounded-full bg-red-100 px-2 py-1 text-[10px] font-semibold text-red-700">
                    Balance ₹
                    {Number(
                      booking.balanceAmount
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* =====================================================
          DESKTOP VIEW
          md and above
      ===================================================== */}

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        {groupedBookings.map(
          (booking, index) => {
            const customer =
              customers.find(
                (customer) =>
                  customer.id ===
                  booking.customerId
              );

            const consentCompleted =
              isConsentCompleted(
                booking
              );

            const status =
              getStatus(booking);

            const avatar = avatarColor(
              booking.customerName
            );

            return (
              <div
                key={booking.id}
                className={`flex items-center justify-between gap-4 px-4 py-3.5 transition hover:bg-slate-50 lg:px-5 ${
                  index !== 0
                    ? "border-t border-slate-100"
                    : ""
                }`}
              >
                {/* CUSTOMER */}
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatar.bg} ${avatar.text}`}
                  >
                    {getInitials(
                      booking.customerName
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {booking.customerName}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {customer?.phone ||
                        "-"}{" "}
                      · {booking.villa}
                    </p>

                    <p className="mt-0.5 truncate text-[11px] text-slate-400">
                      {booking.bookingNumber ||
                        "-"}{" "}
                      ·{" "}
                      {formatDateRange(
                        booking.checkIn,
                        booking.checkOut
                      )}
                    </p>
                  </div>
                </div>

                {/* AMOUNT */}
                <div className="w-28 shrink-0 text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    ₹
                    {Number(
                      booking.totalAmount ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </p>

                  <p
                    className={`mt-0.5 text-[11px] ${
                      booking.balanceAmount >
                      0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {booking.balanceAmount >
                    0
                      ? `₹${Number(
                          booking.balanceAmount
                        ).toLocaleString(
                          "en-IN"
                        )} due`
                      : "Fully paid"}
                  </p>
                </div>

                {/* STATUS */}
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${getStatusClasses(
                    status
                  )}`}
                >
                  {status}
                </span>

                {/* CONSENT */}
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    consentCompleted
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {consentCompleted
                    ? "Consent done"
                    : "Consent pending"}
                </span>

                {/* ACTIONS */}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    aria-label="Booking actions"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    sideOffset={6}
                    className="w-64"
                  >
                    {getMenuItems(booking).map(
                      (item, itemIndex) => (
                        <DropdownMenuItem
                          key={itemIndex}
                          onClick={
                            item.onClick
                          }
                          className="min-h-10 cursor-pointer text-sm"
                        >
                          {item.label}
                        </DropdownMenuItem>
                      )
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          }
        )}
      </div>
    </>
  );
}