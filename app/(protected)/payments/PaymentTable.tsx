import { Booking } from "./paymentTypes";
import OverflowMenu from "./OverflowMenu";
import {
  Phone,
  CalendarDays,
  MessageCircle,
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

interface PaymentTableProps {
  loading: boolean;
  filteredBookings: Booking[];

  setSelectedBooking: (booking: Booking) => void;
  setBookingNumber: (value: string) => void;
  setCustomerName: (value: string) => void;

  setTotalAmount: (value: number) => void;
  setAdvancePaid: (value: number) => void;
  setBalanceAmount: (value: number) => void;

  setPaymentType: (value: string) => void;
  setAmount: (value: string) => void;
  setShowForm: (value: boolean) => void;
}

/*
 * One payment display entry can represent multiple bookings.
 *
 * IMPORTANT:
 * Firestore bookings are NOT merged.
 * This is only a display-level grouping.
 */
interface CombinedBooking extends Booking {
  sourceBookings: Booking[];
}

/*
 * Group bookings belonging to the same customer.
 *
 * customerId is preferred because names can be duplicated.
 * customerName + phone is used as a fallback for older records.
 */
function normalizeDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toISOString().slice(0, 10);
}

function normalizePhone(value?: string) {
  const digits = (value || "").replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function getStayGroupKey(booking: Booking) {
  // Always group by the actual guest + stay dates.
  // bookingGroupId is only metadata and must not cause a separate row.
  const phone = normalizePhone(booking.phone);
  const guestKey = phone
    ? `phone:${phone}`
    : `customer:${booking.customerId || booking.customerName.trim().toLowerCase()}`;

  return `${guestKey}|${normalizeDate(booking.checkIn)}|${normalizeDate(
    booking.checkOut
  )}`;
}

/*
 * NEW BOOKINGS use bookingGroupId.
 * Both Villas therefore becomes one payment row while its two source
 * booking documents keep separate villa balances for receiving payment.
 * Legacy bookings fall back to phone/customer + exact stay dates.
 */
function groupBookings(bookings: Booking[]): CombinedBooking[] {
  const groups = new Map<string, Booking[]>();

  for (const booking of bookings) {
    const key = getStayGroupKey(booking);
    const existing = groups.get(key);
    if (existing) existing.push(booking);
    else groups.set(key, [booking]);
  }

  return Array.from(groups.values()).map((sourceBookings) => {
    const first = sourceBookings[0];

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

    const villas = Array.from(
      new Set(sourceBookings.map((booking) => booking.villa).filter(Boolean))
    );

    const bookingNumbers = Array.from(
      new Set(
        sourceBookings
          .map((booking) => booking.bookingNumber)
          .filter(Boolean)
      )
    );

    return {
      ...first,
      bookingNumber: bookingNumbers.join(" + "),
      villa: villas.join(" + "),
      totalAmount,
      advancePaid,
      balanceAmount,
      sourceBookings,
    };
  });
}

export default function PaymentTable({
  loading,
  filteredBookings,
  setSelectedBooking,
  setBookingNumber,
  setCustomerName,
  setTotalAmount,
  setAdvancePaid,
  setBalanceAmount,
  setPaymentType,
  setAmount,
  setShowForm,
}: PaymentTableProps) {
  /*
   * Group bookings only for display.
   *
   * The actual Firestore bookings remain untouched.
   */
  const groupedBookings = groupBookings(filteredBookings);

  /*
   * Send receipt for one actual booking.
   */
  const sendReceiptWhatsApp = (booking: Booking) => {
    const mobile = normalizePhone(booking.phone);

    if (!mobile) {
      alert("Customer mobile number not found.");
      return;
    }

    const receiptUrl = `${window.location.origin}/receipt/${booking.id}`;

    const message = `Dear Guest,

Thank you for choosing Rain Villa.

View your booking receipt:

${receiptUrl}

Booking No: ${booking.bookingNumber}

Regards,
Rain Villa
9527249988
www.rainvilla.in`;

    window.open(
      `https://wa.me/91${mobile}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  /*
   * Send all receipts belonging to a combined customer entry.
   *
   * This keeps the payment row combined while still linking each
   * original booking separately.
   */
  const sendCombinedReceiptWhatsApp = (booking: CombinedBooking) => {
    const mobile = normalizePhone(booking.phone);

    if (!mobile) {
      alert("Customer mobile number not found.");
      return;
    }

    const receiptLinks = booking.sourceBookings
      .map(
        (sourceBooking) =>
          `Booking No: ${sourceBooking.bookingNumber}\n${window.location.origin}/receipt/${sourceBooking.id}`
      )
      .join("\n\n");

    const message = `Dear Guest,

Thank you for choosing Rain Villa.

Your bookings are:

${receiptLinks}

Regards,
Rain Villa
9527249988
www.rainvilla.in`;

    window.open(
      `https://wa.me/91${mobile}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  /*
   * Open payment modal for ONE actual booking.
   *
   * This is intentionally not passed the combined booking.
   * This prevents a payment for one villa from accidentally
   * being applied to another villa.
   */
  const openReceivePayment = (booking: Booking) => {
    setSelectedBooking(booking);
    setBookingNumber(booking.bookingNumber);
    setCustomerName(booking.customerName);
    setTotalAmount(booking.totalAmount);
    setAdvancePaid(booking.advancePaid);
    setBalanceAmount(booking.balanceAmount);
    setPaymentType("Balance");
    setAmount(String(booking.balanceAmount));
    setShowForm(true);
  };

  /*
   * Status badge.
   */
  function StatusBadge({
    booking,
  }: {
    booking: CombinedBooking;
  }) {
    const isPaid = booking.balanceAmount === 0;
    const isUnpaid = booking.advancePaid === 0;

    if (isPaid) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700">
          <CheckCircle2 size={14} />
          Paid
        </span>
      );
    }

    if (isUnpaid) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700">
          <XCircle size={14} />
          Unpaid
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1.5 text-sm font-medium text-yellow-700">
        <Clock size={14} />
        Partial
      </span>
    );
  }

  /*
   * Build menu items for a combined customer.
   *
   * Example:
   *
   * Pradip Jain
   *   Receive Rain Paradise
   *   Receive Rain Heaven
   */
  const getReceiveMenuItems = (booking: CombinedBooking) =>
    booking.sourceBookings
      .filter((sourceBooking) => Number(sourceBooking.balanceAmount || 0) > 0)
      .map((sourceBooking) => ({
        label: `Receive ${sourceBooking.villa}`,
        icon: <Wallet size={16} />,
        onClick: () => openReceivePayment(sourceBooking),
      }));


  return (
    <>
      {/* ========================================================= */}
      {/* MOBILE VIEW                                               */}
      {/* ========================================================= */}

      <div className="grid grid-cols-2 gap-2.5 md:hidden">
        {loading ? (
          <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500 shadow-sm">
            Loading bookings...
          </div>
        ) : groupedBookings.length === 0 ? (
          <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500 shadow-sm">
            No bookings found.
          </div>
        ) : (
          groupedBookings.map((booking) => {
            const isPaid = booking.balanceAmount === 0;
            const isUnpaid = booking.advancePaid === 0;

            const statusLabel = isPaid
              ? "Paid"
              : isUnpaid
              ? "Unpaid"
              : "Partial";

            const statusClasses = isPaid
              ? "bg-green-100 text-green-700"
              : isUnpaid
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700";

            return (
              <div
                key={booking.id}
                className="relative flex flex-col overflow-visible rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md"
              >
                {/* Customer + actions */}
                <div className="flex items-start justify-between gap-2">
                  <h2 className="line-clamp-2 min-w-0 text-sm font-semibold leading-tight text-slate-900">
                    {booking.customerName}
                  </h2>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        booking.sourceBookings.length === 1
                          ? sendReceiptWhatsApp(booking.sourceBookings[0])
                          : sendCombinedReceiptWhatsApp(booking)
                      }
                      aria-label={`Send WhatsApp receipt for ${booking.customerName}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white shadow-sm transition active:scale-95 hover:bg-green-700"
                    >
                      <MessageCircle size={16} />
                    </button>

                    {booking.sourceBookings.some(
                      (sourceBooking) => Number(sourceBooking.balanceAmount || 0) > 0
                    ) && (
                      <OverflowMenu
                        items={getReceiveMenuItems(booking)}
                      />
                    )}
                  </div>
                </div>

                {/* Villas */}
                <p className="mt-1 text-[11px] leading-4 text-slate-500">
                  {booking.villa}
                </p>

                {/* Combined total */}
                <p className="mt-2 text-[22px] font-bold leading-none tabular-nums text-slate-900">
                  ₹{booking.totalAmount.toLocaleString("en-IN")}
                </p>

                {/* Dates */}
                <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
                  <CalendarDays size={12} className="shrink-0" />

                  {booking.checkIn
                    ? new Date(
                        booking.checkIn
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })
                    : "-"}

                  {" → "}

                  {booking.checkOut
                    ? new Date(
                        booking.checkOut
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })
                    : "-"}
                </p>

                {/* Status + balance */}
                <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClasses}`}
                  >
                    {statusLabel}
                  </span>

                  <p
                    className={`text-xs font-semibold tabular-nums ${
                      isPaid
                        ? "text-slate-500"
                        : "text-red-600"
                    }`}
                  >
                    ₹{booking.balanceAmount.toLocaleString("en-IN")} due
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================= */}
      {/* DESKTOP VIEW                                              */}
      {/* ========================================================= */}

      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full min-w-[1200px]">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-4 text-left text-sm font-medium text-slate-600">
                Booking
              </th>

              <th className="px-4 py-4 text-left text-sm font-medium text-slate-600">
                Guest
              </th>

              <th className="px-4 py-4 text-left text-sm font-medium text-slate-600">
                Villa
              </th>

              <th className="px-4 py-4 text-left text-sm font-medium text-slate-600">
                Stay
              </th>

              <th className="px-4 py-4 text-right text-sm font-medium text-slate-600">
                Total
              </th>

              <th className="px-4 py-4 text-right text-sm font-medium text-slate-600">
                Paid
              </th>

              <th className="px-4 py-4 text-right text-sm font-medium text-slate-600">
                Balance
              </th>

              <th className="px-4 py-4 text-center text-sm font-medium text-slate-600">
                Status
              </th>

              <th className="px-4 py-4 text-center text-sm font-medium text-slate-600">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={9}
                  className="py-12 text-center text-slate-500"
                >
                  Loading bookings...
                </td>
              </tr>
            ) : groupedBookings.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="py-12 text-center text-slate-500"
                >
                  No bookings found.
                </td>
              </tr>
            ) : (
              groupedBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-t border-slate-100 transition hover:bg-slate-50"
                >
                  {/* Booking numbers */}
                  <td className="px-4 py-4 font-medium text-slate-900">
                    <div className="max-w-[180px] break-words">
                      {booking.bookingNumber}
                    </div>
                  </td>

                  {/* Guest */}
                  <td className="px-4 py-4">
                    <div className="font-medium text-slate-900">
                      {booking.customerName}
                    </div>

                    <div className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                      <Phone size={13} />
                      {booking.phone || "-"}
                    </div>
                  </td>

                  {/* Villas */}
                  <td className="px-4 py-4 text-slate-700">
                    <div className="max-w-[220px] break-words">
                      {booking.villa}
                    </div>
                  </td>

                  {/* Stay */}
                  <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                    {booking.checkIn
                      ? new Date(
                          booking.checkIn
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })
                      : "-"}

                    {" → "}

                    {booking.checkOut
                      ? new Date(
                          booking.checkOut
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })
                      : "-"}
                  </td>

                  {/* Combined Total */}
                  <td className="px-4 py-4 text-right font-semibold tabular-nums text-slate-900">
                    ₹{booking.totalAmount.toLocaleString("en-IN")}
                  </td>

                  {/* Combined Paid */}
                  <td className="px-4 py-4 text-right font-semibold tabular-nums text-green-600">
                    ₹{booking.advancePaid.toLocaleString("en-IN")}
                  </td>

                  {/* Combined Balance */}
                  <td className="px-4 py-4 text-right font-semibold tabular-nums text-red-600">
                    ₹{booking.balanceAmount.toLocaleString("en-IN")}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4 text-center">
                    <StatusBadge booking={booking} />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    {booking.sourceBookings.length === 1 ? (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            sendReceiptWhatsApp(
                              booking.sourceBookings[0]
                            )
                          }
                          className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                        >
                          <MessageCircle size={15} />
                          WhatsApp
                        </button>

                        {booking.sourceBookings[0]
                          .balanceAmount > 0 && (
                          <button
                            onClick={() =>
                              openReceivePayment(
                                booking.sourceBookings[0]
                              )
                            }
                            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                          >
                            <Wallet size={15} />
                            Receive
                          </button>
                        )}
                      </div>
                    ) : (
                      /*
                       * Multiple bookings for the same customer.
                       *
                       * Keep the row visually consistent with normal
                       * payment rows: WhatsApp + Receive.
                       *
                       * WhatsApp sends one message containing all
                       * individual receipt links.
                       *
                       * Receive opens a small menu so the payment is
                       * still applied to the correct original booking.
                       */
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => sendCombinedReceiptWhatsApp(booking)}
                          className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                        >
                          <MessageCircle size={15} />
                          WhatsApp
                        </button>

                        {booking.sourceBookings.some(
                          (sourceBooking) => sourceBooking.balanceAmount > 0
                        ) && (
                          <details className="relative">
                            <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
                              <Wallet size={15} />
                              Receive
                            </summary>

                            <div className="absolute right-0 z-50 mt-2 min-w-[220px] overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                              {booking.sourceBookings
                                .filter(
                                  (sourceBooking) =>
                                    sourceBooking.balanceAmount > 0
                                )
                                .map((sourceBooking) => (
                                  <button
                                    key={sourceBooking.id}
                                    type="button"
                                    onClick={(event) => {
                                      const details =
                                        event.currentTarget.closest("details");
                                      if (details) {
                                        details.removeAttribute("open");
                                      }

                                      openReceivePayment(sourceBooking);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                                  >
                                    <Wallet size={15} />
                                    <span className="min-w-0 flex-1 truncate">
                                      Receive {sourceBooking.villa}
                                    </span>
                                  </button>
                                ))}
                            </div>
                          </details>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}