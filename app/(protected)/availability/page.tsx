"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";

import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { db } from "../../lib/firebase";


import DashboardCards from "./components/DashboardCards";
import CalendarGrid from "./components/CalendarGrid";
import BookingDrawer from "./components/BookingDrawer";
import Legend from "./components/Legend";

interface Booking {
  id: string;
  customerId?: string;
  customerName: string;
  bookingNumber?: string;
  villa: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;
  status: string;
}

const villas = [
  "Rain Paradise",
  "Rain Heaven",
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function AvailabilityPage() {

  const router = useRouter();

  const today = new Date();

  const [selectedMonth, setSelectedMonth] =
    useState(today.getMonth());

  const [selectedYear, setSelectedYear] =
    useState(today.getFullYear());

  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedDate, setSelectedDate] =
    useState<Date | null>(today);
      async function loadBookings() {

    setLoading(true);

    try {

      const snapshot = await getDocs(
        collection(db, "bookings")
      );

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Booking[];

      setBookings(data);

    } catch (error) {

      console.error(
        "Error loading bookings:",
        error
      );

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    loadBookings();

  }, []);

  function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
  function getBooking(

    villa: string,
    date: Date

  ) {

    const current =
      formatDate(date);

    return bookings.find((booking) =>

      booking.villa === villa &&
      booking.status !== "Cancelled" &&
      current >= booking.checkIn &&
      current < booking.checkOut

    );

  }

  const paradiseBooking =
    selectedDate
      ? getBooking(
          "Rain Paradise",
          selectedDate
        )
      : null;

  const heavenBooking =
    selectedDate
      ? getBooking(
          "Rain Heaven",
          selectedDate
        )
      : null;

  const occupiedToday =
    useMemo(() => {

      const todayString =
        formatDate(today);

      return villas.filter((villa) =>

        bookings.some((booking) =>

          booking.villa === villa &&
          booking.status !== "Cancelled" &&
          todayString >= booking.checkIn &&
          todayString < booking.checkOut

        )

      ).length;

    }, [bookings]);

  const availableToday =
    villas.length -
    occupiedToday;

  const occupancyRate =
    villas.length === 0
      ? 0
      : Math.round(
          (occupiedToday /
            villas.length) *
            100
        );

  function handleDayClick(
    date: Date
  ) {

    setSelectedDate(date);

  }

  function createBooking(

    villa: string,
    date: Date

  ) {

    const booking =
      getBooking(villa, date);

    if (booking) {

      alert(
        "This villa is already booked."
      );

      return;

    }

    const checkIn =
      formatDate(date);

    const checkOutDate =
      new Date(date);

    checkOutDate.setDate(
      checkOutDate.getDate() + 1
    );

    const checkOut =
      formatDate(checkOutDate);

    router.push(

      `/bookings?villa=${encodeURIComponent(
        villa
      )}&checkIn=${checkIn}&checkOut=${checkOut}`

    );

  }
    return (

    <div className="flex min-h-screen bg-slate-100">

      <Sidebar />

      <div className="flex flex-1 flex-col">

        <Navbar />

        <main className="flex-1 p-6 lg:p-8 space-y-6">

          

          {/* Page Header */}

<div className="flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">

  <div>

    <h1 className="text-3xl font-bold text-slate-800">
      Availability Calendar
    </h1>

    <p className="mt-2 text-slate-500">
      View villa availability and create bookings.
    </p>

  </div>

  <div className="flex gap-3">

    <select
      value={selectedMonth}
      onChange={(e) =>
        setSelectedMonth(Number(e.target.value))
      }
      className="rounded-xl border border-slate-300 px-4 py-3"
    >
      {months.map((month, index) => (
        <option key={index} value={index}>
          {month}
        </option>
      ))}
    </select>

    <select
      value={selectedYear}
      onChange={(e) =>
        setSelectedYear(Number(e.target.value))
      }
      className="rounded-xl border border-slate-300 px-4 py-3"
    >
      {[2025, 2026, 2027, 2028].map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>

  </div>

</div>
          {/* Dashboard */}

          <div className="mt-6">

            <DashboardCards
              totalBookings={bookings.length}
              occupiedToday={occupiedToday}
              availableToday={availableToday}
              occupancyRate={occupancyRate}
            />

          </div>

          {/* Legend */}

          <div className="mt-6">

            <Legend />

          </div>

          {/* Calendar Layout */}

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-4">

            <div className="xl:col-span-3">

              {loading ? (

  <div className="flex h-[600px] items-center justify-center rounded-3xl bg-white shadow-sm">

    <p className="text-lg font-medium text-slate-500">
      Loading availability...
    </p>

  </div>

) : (

  <CalendarGrid
    month={selectedMonth}
    year={selectedYear}
    bookings={bookings}
    onSelectDay={handleDayClick}
  />

)}

</div>

<div className="xl:col-span-1">

  <BookingDrawer
    selectedDate={selectedDate}
    paradiseBooking={paradiseBooking}
    heavenBooking={heavenBooking}
  />

  {selectedDate && (

    <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">

      <h3 className="mb-4 text-lg font-semibold text-slate-800">
        Quick Actions
      </h3>

      <div className="space-y-3">

        <button
          onClick={() =>
            createBooking(
              "Rain Paradise",
              selectedDate
            )
          }
          className="w-full rounded-xl bg-green-600 px-4 py-3 text-white hover:bg-green-700"
        >
          Book Rain Paradise
        </button>

        <button
          onClick={() =>
            createBooking(
              "Rain Heaven",
              selectedDate
            )
          }
          className="w-full rounded-xl bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"
        >
          Book Rain Heaven
        </button>

      </div>

    </div>

  )}

</div>

          </div>

          
        </main>

      </div>

    </div>
      );
}