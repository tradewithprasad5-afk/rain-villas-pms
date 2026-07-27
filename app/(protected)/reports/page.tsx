"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import * as XLSX from "xlsx";
import { db } from "../../lib/firebase";
import {
  IndianRupee,
  Wallet,
  AlertCircle,
  BookOpen,
  Download,
} from "lucide-react";



interface Booking {
  id: string;
  bookingNumber?: string;
  customerName: string;
  villa: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBg,
  iconColor,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-slate-500">{title}</p>

          <h2 className="mt-2 sm:mt-3 text-xl sm:text-3xl font-bold text-slate-900 truncate">
            {value}
          </h2>

          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-400 truncate">
            {subtitle}
          </p>
        </div>

        <div
          className={`h-10 w-10 sm:h-14 sm:w-14 shrink-0 rounded-2xl flex items-center justify-center ${iconBg}`}
        >
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  async function loadBookings() {
    try {
      const snapshot = await getDocs(collection(db, "bookings"));

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Booking[];

      setBookings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);
  const filteredBookings = useMemo(() => {
  const now = new Date();

  return bookings.filter((booking) => {
    const date = new Date(booking.checkIn);

    switch (period) {
      case "today":
        return date.toDateString() === now.toDateString();

      case "week": {
        const start = new Date(now);
start.setDate(now.getDate() - now.getDay());

const end = new Date(start);
end.setDate(start.getDate() + 6);

return date >= start && date <= end;
      }

      case "month":
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );

      case "lastMonth": {
        const lastMonth = new Date(
  now.getFullYear(),
  now.getMonth() - 1,
  1
);

        return (
          date.getMonth() === lastMonth.getMonth() &&
          date.getFullYear() === lastMonth.getFullYear()
        );
      }

      case "quarter": {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const bookingQuarter = Math.floor(date.getMonth() / 3);

        return (
          bookingQuarter === currentQuarter &&
          date.getFullYear() === now.getFullYear()
        );
      }

      case "year":
        return date.getFullYear() === now.getFullYear();

      default:
        return true;
    }
  });
}, [bookings, period]);

  const totalRevenue = useMemo(
  () =>
    filteredBookings.reduce(
      (sum, booking) => sum + Number(booking.totalAmount || 0),
      0
    ),
  [filteredBookings]
);

  const totalReceived = useMemo(
    () =>
      filteredBookings.reduce(
        (sum, booking) => sum + Number(booking.advancePaid || 0),
        0
      ),
    [filteredBookings]
  );

  const totalBalance = useMemo(
    () =>
      filteredBookings.reduce(
        (sum, booking) => sum + Number(booking.balanceAmount || 0),
        0
      ),
    [filteredBookings]
  );

  const totalBookings = useMemo(() => {
  let total = 0;

  filteredBookings.forEach((booking) => {
    if (!booking.checkIn || !booking.checkOut) return;

    let current = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);

    while (current < checkOut) {
      total++;
      current.setDate(current.getDate() + 1);
    }
  });

  return total;
}, [filteredBookings]);

  const monthlyBookings = useMemo(() => {
  const stats: Record<string, number> = {};

  filteredBookings.forEach((booking) => {
    if (!booking.checkIn || !booking.checkOut) return;

    let current = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);

    while (current < checkOut) {
      const month = current.toLocaleString("en-IN", {
        month: "short",
        year: "numeric",
      });

      stats[month] = (stats[month] || 0) + 1;

      current.setDate(current.getDate() + 1);
    }
  });

  return stats;
}, [filteredBookings]);

  const villaRevenue = useMemo(() => {
    const stats: Record<string, number> = {};

    filteredBookings.forEach((booking) => {
      stats[booking.villa] =
        (stats[booking.villa] || 0) +
        Number(booking.totalAmount || 0);
    });

    return stats;
  }, [filteredBookings]);

  const maxRevenue = Math.max(
    ...Object.values(villaRevenue),
    1
  );
  const handleExport = () => {
  const data = filteredBookings.map((booking) => ({
    "Booking No": booking.bookingNumber,
    Customer: booking.customerName,
    Villa: booking.villa,
    "Check In": booking.checkIn,
    "Check Out": booking.checkOut,
    "Total Amount": booking.totalAmount,
    "Advance Paid": booking.advancePaid,
    Balance: booking.balanceAmount,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");

  XLSX.writeFile(workbook, `Reports-${period}.xlsx`);
};

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl border bg-white p-10 text-center text-slate-500 shadow-sm">
          Loading reports...
        </div>
      </div>
    );
  }

  const sortedMonthlyBookings = Object.entries(monthlyBookings).sort(
    ([a], [b]) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="max-w-7xl mx-auto px-3 py-4 sm:px-6 lg:px-8 sm:py-8 space-y-5 sm:space-y-8">

      {/* Header */}

      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">

        <div>

          <h1 className="text-xl sm:text-3xl font-bold text-slate-900">
            Reports
          </h1>

          <p className="mt-1 sm:mt-2 text-sm text-slate-500">
            Revenue, occupancy and booking reports.
          </p>

        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">

          <select
  value={period}
  onChange={(e) => setPeriod(e.target.value)}
  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm outline-none hover:bg-slate-50"
>
  <option value="today">Today</option>
  <option value="week">This Week</option>
  <option value="month">This Month</option>
  <option value="lastMonth">Last Month</option>
  <option value="quarter">This Quarter</option>
  <option value="year">This Year</option>
</select>

          <button
  onClick={handleExport}
  className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
>

            <Download size={18} />

            Export

          </button>

        </div>

      </div>

      {/* KPI Cards */}

      <div className="grid grid-cols-2 gap-3 sm:gap-6 xl:grid-cols-4">

        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          subtitle="Total booking value"
          icon={<IndianRupee size={22} />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />

        <StatCard
          title="Amount Received"
          value={`₹${totalReceived.toLocaleString("en-IN")}`}
          subtitle="Collected payments"
          icon={<Wallet size={22} />}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />

        <StatCard
          title="Outstanding"
          value={`₹${totalBalance.toLocaleString("en-IN")}`}
          subtitle="Pending payments"
          icon={<AlertCircle size={22} />}
          iconBg="bg-red-100"
          iconColor="text-red-600"
        />

        <StatCard
          title="Total Bookings"
          value={totalBookings.toString()}
          subtitle="Confirmed bookings"
          icon={<BookOpen size={22} />}
          iconBg="bg-violet-100"
          iconColor="text-violet-600"
        />

      </div>

            {/* Reports Grid */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">

        {/* Monthly Bookings */}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 p-4 sm:p-6">

            <h2 className="text-base sm:text-lg font-semibold text-slate-900">
              Monthly Bookings
            </h2>

            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Booking summary by month
            </p>

          </div>

          {/* Mobile: compact list */}

          <div className="sm:hidden divide-y divide-slate-100">
            {sortedMonthlyBookings.map(([month, count]) => (
              <div
                key={month}
                className="flex items-center justify-between px-4 py-3"
              >
                <span className="text-sm text-slate-700">{month}</span>
                <span className="text-sm font-semibold text-slate-900">
                  {count}
                </span>
              </div>
            ))}
          </div>

          {/* Desktop: table */}

          <div className="hidden sm:block overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-50">

                <tr>

                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">
                    Month
                  </th>

                  <th className="px-6 py-4 text-right text-sm font-medium text-slate-600">
                    Bookings
                  </th>

                </tr>

              </thead>

              <tbody>

                {sortedMonthlyBookings.map(([month, count]) => (

                    <tr
                      key={month}
                      className="border-t border-slate-100 hover:bg-slate-50 transition"
                    >

                      <td className="px-6 py-4 text-slate-700">
                        {month}
                      </td>

                      <td className="px-6 py-4 text-right font-semibold">
                        {count}
                      </td>

                    </tr>

                  ))}

              </tbody>

            </table>

          </div>

        </div>

        {/* Villa Revenue */}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 p-4 sm:p-6">

            <h2 className="text-base sm:text-lg font-semibold text-slate-900">
              Villa Revenue
            </h2>

            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Revenue contribution by villa
            </p>

          </div>

          <div className="space-y-5 sm:space-y-8 p-4 sm:p-6">

            {Object.entries(villaRevenue)
              .sort(([, a], [, b]) => b - a)
              .map(([villa, amount]) => {

                const percent =
                  (amount / maxRevenue) * 100;

                return (

                  <div key={villa}>

                    <div className="flex items-center justify-between gap-2">

                      <div className="min-w-0">

                        <h3 className="text-sm sm:text-base font-medium text-slate-800 truncate">
                          {villa}
                        </h3>

                        <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-500">
                          ₹{amount.toLocaleString("en-IN")}
                        </p>

                      </div>

                      <span className="shrink-0 rounded-full bg-blue-50 px-2.5 sm:px-3 py-1 text-xs font-medium text-blue-700">
                        {percent.toFixed(0)}%
                      </span>

                    </div>

                    <div className="mt-2.5 sm:mt-3 h-2.5 sm:h-3 overflow-hidden rounded-full bg-slate-100">

                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 transition-all duration-700 ease-out"
                        style={{
                          width: `${percent}%`,
                        }}
                      />

                    </div>

                  </div>

                );

              })}

          </div>

        </div>

      </div>

      {/* Footer */}

      <div className="flex flex-col gap-2 sm:gap-3 border-t border-slate-200 pt-4 sm:pt-6 text-xs sm:text-sm text-slate-500 md:flex-row md:items-center md:justify-between">

        <p>
          Showing revenue generated from all completed
          booking records.
        </p>

        <p>
          Updated just now
        </p>

      </div>

    </div>

  );
}
