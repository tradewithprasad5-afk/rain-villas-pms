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
  const sendReceiptWhatsApp = (booking: Booking) => {
    const mobile = (booking.phone || "").replace(/\D/g, "");

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

  function StatusBadge({ booking }: { booking: Booking }) {
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

  return (
    <>
      {/* ================= MOBILE VIEW ================= */}
      <div className="grid grid-cols-2 gap-2.5 md:hidden">
        {loading ? (
          <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500 shadow-sm">
            Loading bookings...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500 shadow-sm">
            No bookings found.
          </div>
        ) : (
          filteredBookings.map((booking) => {
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
                <div className="flex items-start justify-between gap-1">
                  <h2 className="line-clamp-2 text-sm font-semibold leading-tight text-slate-900">
                    {booking.customerName}
                  </h2>

                  <div className="-m-0.5 shrink-0">
                    <OverflowMenu
                      items={[
                        {
                          label: "Send via WhatsApp",
                          icon: <MessageCircle size={16} />,
                          onClick: () => sendReceiptWhatsApp(booking),
                        },
                        ...(booking.balanceAmount > 0
                          ? [
                              {
                                label: "Receive Payment",
                                icon: <Wallet size={16} />,
                                onClick: () => openReceivePayment(booking),
                              },
                            ]
                          : []),
                      ]}
                    />
                  </div>
                </div>

                <p className="mt-0.5 text-[11px] text-slate-500">
                  {booking.villa}
                </p>

                <p className="mt-2 text-[22px] font-bold leading-none tabular-nums text-slate-900">
                  ₹{booking.totalAmount.toLocaleString("en-IN")}
                </p>

                <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-500">
                  <CalendarDays size={12} className="shrink-0" />
                  {booking.checkIn
                    ? new Date(booking.checkIn).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })
                    : "-"}
                  {" → "}
                  {booking.checkOut
                    ? new Date(booking.checkOut).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })
                    : "-"}
                </div>

                <div className="mt-2 mt-auto flex items-center justify-between border-t border-slate-100 pt-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClasses}`}
                  >
                    {statusLabel}
                  </span>

                  <p
                    className={`text-xs font-semibold tabular-nums ${
                      isPaid ? "text-slate-500" : "text-red-600"
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

      {/* ================= DESKTOP VIEW ================= */}
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
                <td colSpan={9} className="py-12 text-center text-slate-500">
                  Loading bookings...
                </td>
              </tr>
            ) : filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500">
                  No bookings found.
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-t border-slate-100 transition hover:bg-slate-50"
                >
                  <td className="px-4 py-4 font-medium text-slate-900">
                    {booking.bookingNumber}
                  </td>

                  <td className="px-4 py-4">
                    <div className="font-medium text-slate-900">
                      {booking.customerName}
                    </div>

                    <div className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                      <Phone size={13} />
                      {booking.phone || "-"}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-slate-700">
                    {booking.villa}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                    {booking.checkIn
                      ? new Date(booking.checkIn).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                          }
                        )
                      : "-"}
                    {" → "}
                    {booking.checkOut
                      ? new Date(booking.checkOut).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                          }
                        )
                      : "-"}
                  </td>

                  <td className="px-4 py-4 text-right font-semibold tabular-nums text-slate-900">
                    ₹{booking.totalAmount.toLocaleString("en-IN")}
                  </td>

                  <td className="px-4 py-4 text-right font-semibold tabular-nums text-green-600">
                    ₹{booking.advancePaid.toLocaleString("en-IN")}
                  </td>

                  <td className="px-4 py-4 text-right font-semibold tabular-nums text-red-600">
                    ₹{booking.balanceAmount.toLocaleString("en-IN")}
                  </td>

                  <td className="px-4 py-4 text-center">
                    <StatusBadge booking={booking} />
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => sendReceiptWhatsApp(booking)}
                        className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                      >
                        <MessageCircle size={15} />
                        WhatsApp
                      </button>

                      {booking.balanceAmount > 0 && (
                        <button
                          onClick={() => openReceivePayment(booking)}
                          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                          <Wallet size={15} />
                          Receive
                        </button>
                      )}
                    </div>
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
