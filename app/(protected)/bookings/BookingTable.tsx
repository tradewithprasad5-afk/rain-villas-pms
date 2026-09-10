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
    parts.length > 1
      ? parts[parts.length - 1]?.[0] || ""
      : "";

  return (first + second).toUpperCase();
}

const AVATAR_COLORS = [
  {
    bg: "bg-blue-100",
    text: "text-blue-700",
  },
  {
    bg: "bg-purple-100",
    text: "text-purple-700",
  },
  {
    bg: "bg-teal-100",
    text: "text-teal-700",
  },
  {
    bg: "bg-amber-100",
    text: "text-amber-700",
  },
  {
    bg: "bg-pink-100",
    text: "text-pink-700",
  },
];

function avatarColor(name: string) {
  let hash = 0;

  for (let i = 0; i < name.length; i++) {
    hash =
      name.charCodeAt(i) +
      ((hash << 5) - hash);
  }

  return AVATAR_COLORS[
    Math.abs(hash) % AVATAR_COLORS.length
  ];
}

function normalizePhone(value?: string) {
  const digits = (value || "").replace(/\D/g, "");

  return digits.length > 10
    ? digits.slice(-10)
    : digits;
}

function normalizeDate(value?: string) {
  if (!value) return "";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value.trim();
  }

  return parsed.toISOString().slice(0, 10);
}

function getBookingPhone(
  booking: Booking,
  customers: Customer[]
) {
  const customer = customers.find(
    (item) =>
      item.id === booking.customerId
  );

  return normalizePhone(
    booking.phone ||
      customer?.phone ||
      ""
  );
}

function getGuestIdentity(
  booking: Booking,
  customers: Customer[]
) {
  const phone = getBookingPhone(
    booking,
    customers
  );

  const customerId =
    booking.customerId?.trim() || "";

  const name = (
    booking.customerName || ""
  )
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

  return {
    phone,
    customerId,
    name,
  };
}

function sameGuest(
  a: Booking,
  b: Booking,
  customers: Customer[]
) {
  const left = getGuestIdentity(
    a,
    customers
  );

  const right = getGuestIdentity(
    b,
    customers
  );

  if (
    left.phone &&
    right.phone &&
    left.phone === right.phone
  ) {
    return true;
  }

  if (
    left.customerId &&
    right.customerId &&
    left.customerId === right.customerId
  ) {
    return true;
  }

  if (
    left.name &&
    right.name &&
    left.name === right.name
  ) {
    return true;
  }

  return false;
}

function groupBookings(
  bookings: Booking[],
  customers: Customer[]
): CombinedBooking[] {
  const dateBuckets =
    new Map<string, Booking[]>();

  for (const booking of bookings) {
    const dateKey =
      `${normalizeDate(
        booking.checkIn
      )}|${normalizeDate(
        booking.checkOut
      )}`;

    const bucket =
      dateBuckets.get(dateKey);

    if (bucket) {
      bucket.push(booking);
    } else {
      dateBuckets.set(
        dateKey,
        [booking]
      );
    }
  }

  const result: Booking[][] = [];

  for (const bucket of dateBuckets.values()) {
    const groups: Booking[][] = [];

    for (const booking of bucket) {
      const matchingGroups =
        groups.filter((group) =>
          group.some((existing) =>
            sameGuest(
              booking,
              existing,
              customers
            )
          )
        );

      if (
        matchingGroups.length === 0
      ) {
        groups.push([booking]);
        continue;
      }

      const merged = [booking];

      for (const group of matchingGroups) {
        merged.push(...group);
      }

      for (const group of matchingGroups) {
        const index =
          groups.indexOf(group);

        if (index !== -1) {
          groups.splice(index, 1);
        }
      }

      groups.push(merged);
    }

    result.push(...groups);
  }

  return result.map(
    (sourceBookings) => {
      const first =
        sourceBookings[0];

      const bookingNumbers =
        Array.from(
          new Set(
            sourceBookings
              .map(
                (booking) =>
                  booking.bookingNumber
              )
              .filter(Boolean)
          )
        );

      /*
       * Display-only villa name.
       *
       * "Both Villas" is a form/edit value, not a physical villa.
       * For the booking card, always show the real villa names.
       *
       * Examples:
       *   Rain Paradise + Rain Heaven
       *   Both Villas -> Rain Paradise + Rain Heaven
       *   Rain Heaven + Both Villas -> Rain Paradise + Rain Heaven
       *
       * The original Firestore/source bookings are NOT changed here.
       */
      const displayVillas = new Set<string>();

      sourceBookings.forEach((booking) => {
        if (booking.villa === "Both Villas") {
          displayVillas.add("Rain Paradise");
          displayVillas.add("Rain Heaven");
        } else if (booking.villa) {
          displayVillas.add(booking.villa);
        }
      });

      const villas = [
        "Rain Paradise",
        "Rain Heaven",
      ].filter((villa) =>
        displayVillas.has(villa)
      );

      const displayVillaName =
        villas.length === 2
          ? "Rain Paradise + Rain Heaven"
          : villas.join(" + ") ||
            first.villa;

      const checkIns =
        sourceBookings
          .map(
            (booking) =>
              booking.checkIn
          )
          .filter(Boolean)
          .sort(
            (a, b) =>
              new Date(a).getTime() -
              new Date(b).getTime()
          );

      const checkOuts =
        sourceBookings
          .map(
            (booking) =>
              booking.checkOut
          )
          .filter(Boolean)
          .sort(
            (a, b) =>
              new Date(b).getTime() -
              new Date(a).getTime()
          );

      const totalAmount =
        sourceBookings.reduce(
          (sum, booking) =>
            sum +
            Number(
              booking.totalAmount || 0
            ),
          0
        );

      const advancePaid =
        sourceBookings.reduce(
          (sum, booking) =>
            sum +
            Number(
              booking.advancePaid || 0
            ),
          0
        );

      const balanceAmount =
        sourceBookings.reduce(
          (sum, booking) =>
            sum +
            Number(
              booking.balanceAmount || 0
            ),
          0
        );

      return {
        ...first,

        bookingNumber:
          bookingNumbers.join(" + ") ||
          first.bookingNumber,

        villa:
          displayVillaName,

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
    }
  );
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

  const groupedBookings =
    groupBookings(
      bookings,
      customers
    );

  const formatDateRange = (
    checkIn: string,
    checkOut: string
  ) => {
    const inDate =
      new Date(checkIn);

    const outDate =
      new Date(checkOut);

    return `${inDate.toLocaleDateString(
      "en-GB",
      {
        day: "numeric",
        month: "short",
      }
    )} → ${outDate.toLocaleDateString(
      "en-GB",
      {
        day: "numeric",
        month: "short",
      }
    )}`;
  };

  const getStatusClasses = (
    status: string
  ) => {
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

  const getCombinedStatus = (
    booking: CombinedBooking
  ) => {
    const statuses =
      Array.from(
        new Set(
          booking.sourceBookings
            .map(
              (item) =>
                item.status
            )
            .filter(Boolean)
        )
      );

    if (
      statuses.includes("Confirmed")
    ) {
      return "Confirmed";
    }

    if (
      statuses.includes("Pending")
    ) {
      return "Pending";
    }

    if (
      statuses.includes("Cancelled")
    ) {
      return "Cancelled";
    }

    return statuses[0] || "Pending";
  };

  const isConsentCompleted = (
    booking: CombinedBooking
  ) =>
    booking.sourceBookings.every(
      (item) =>
        item.consentStatus ===
        "Completed"
    );

  const renderActions = (
    booking: CombinedBooking
  ) => {
    const primaryBooking =
      booking.sourceBookings[0];

    if (!primaryBooking) {
      return [];
    }

    const actions: React.ReactNode[] =
      [];

    /*
     * EDIT
     *
     * IMPORTANT:
     * Pass the COMPLETE COMBINED booking
     * to the edit handler.
     *
     * This is the main fix.
     */
    actions.push(
      <DropdownMenuItem
        key="edit"
        onClick={() =>
          onEdit(booking)
        }
      >
        ✏️ Edit Booking
      </DropdownMenuItem>
    );

    /*
     * CONSENT
     *
     * Only ONE consent action for the
     * complete stay.
     */
    const anyConsentCompleted =
      booking.sourceBookings.some(
        (item) =>
          item.consentStatus ===
          "Completed"
      );

    if (anyConsentCompleted) {
      actions.push(
        <DropdownMenuItem
          key="view-consent"
          onClick={() => {
            window.location.href =
              `/admin/consents/${primaryBooking.bookingNumber}`;
          }}
        >
          👁 View Consent
        </DropdownMenuItem>
      );
    } else {
      actions.push(
        <DropdownMenuItem
          key="send-consent"
          onClick={() =>
            onSendConsent(
              primaryBooking
            )
          }
        >
          📲 Send Consent
        </DropdownMenuItem>
      );

      actions.push(
        <DropdownMenuItem
          key="complete-consent"
          onClick={() => {
            booking.sourceBookings.forEach(
              (sourceBooking) => {
                onCompleteConsent(
                  sourceBooking.id
                );
              }
            );
          }}
        >
          ✓ Mark Consent Complete
        </DropdownMenuItem>
      );
    }

    /*
     * DELETE
     *
     * Keep current behavior:
     * delete handler receives the primary
     * source booking.
     */
    actions.push(
      <DropdownMenuItem
        key="delete"
        onClick={() =>
          onDelete(primaryBooking)
        }
        className="text-red-600"
      >
        🗑 Delete Booking
      </DropdownMenuItem>
    );

    return actions;
  };

  return (
    <>
      {/* ================= MOBILE VIEW ================= */}

      <div className="grid grid-cols-2 gap-2.5 md:hidden">
        {groupedBookings.map(
          (booking) => {
            const consentCompleted =
              isConsentCompleted(
                booking
              );

            const status =
              getCombinedStatus(
                booking
              );

            const avatar =
              avatarColor(
                booking.customerName
              );

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
                      {getInitials(
                        booking.customerName
                      )}
                    </div>

                    <h3 className="line-clamp-2 text-sm font-semibold leading-tight">
                      {
                        booking.customerName
                      }
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
                      {renderActions(
                        booking
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="mt-0.5 line-clamp-2 text-[11px] text-gray-500">
                  {booking.villa}
                </p>

                <p className="mt-1 text-[10px] text-gray-400">
                  {
                    booking.bookingNumber
                  }
                </p>

                <p className="mt-2 text-[22px] font-bold leading-none text-gray-900">
                  ₹
                  {Number(
                    booking.totalAmount || 0
                  ).toLocaleString(
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
                    {consentCompleted
                      ? "Completed"
                      : "Pending"}
                  </span>

                  {booking.balanceAmount >
                    0 && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
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
          }
        )}
      </div>

      {/* ================= DESKTOP VIEW ================= */}

      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
        {groupedBookings.map(
          (
            booking,
            index
          ) => {
            const customer =
              customers.find(
                (c) =>
                  c.id ===
                  booking.customerId
              );

            const consentCompleted =
              isConsentCompleted(
                booking
              );

            const status =
              getCombinedStatus(
                booking
              );

            const avatar =
              avatarColor(
                booking.customerName
              );

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
                    {getInitials(
                      booking.customerName
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {
                        booking.customerName
                      }
                    </p>

                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {customer?.phone ||
                        booking.phone ||
                        "-"}{" "}
                      ·{" "}
                      {booking.villa} ·{" "}
                      {formatDateRange(
                        booking.checkIn,
                        booking.checkOut
                      )}
                    </p>

                    <p className="mt-0.5 truncate text-[11px] text-slate-400">
                      {
                        booking.bookingNumber
                      }
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">
                      ₹
                      {Number(
                        booking.totalAmount || 0
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
                      {renderActions(
                        booking
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          }
        )}
      </div>
    </>
  );
}