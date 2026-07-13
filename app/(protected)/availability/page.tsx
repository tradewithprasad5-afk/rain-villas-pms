"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { useSearchParams } from "next/navigation";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../../lib/firebase";

/* =========================================================
   Booking Interface
========================================================= */

interface Booking {

  id: string;

  customerId?: string;

  customerName: string;

  villa: string;

  checkIn: string;

  checkOut: string;

  guests: number;

  totalAmount: number;

  advancePaid: number;

  balanceAmount: number;

  status: string;

}

/* =========================================================
   Availability Page
========================================================= */

export default function AvailabilityPage() {

  const router = useRouter();

  /* =======================================================
      Today
  ======================================================= */

  const today = new Date();

  /* =======================================================
      Month & Year
  ======================================================= */

  const [selectedMonth, setSelectedMonth] =
    useState(today.getMonth());

  const [selectedYear, setSelectedYear] =
    useState(today.getFullYear());

  /* =======================================================
      Firestore
  ======================================================= */

  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [loading, setLoading] =
    useState(true);

  /* =======================================================
      Villa List
  ======================================================= */

  const villas = [

    "Rain Paradise",

    "Rain Heaven",

  ];

  /* =======================================================
      Month Names
  ======================================================= */

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

  /* =======================================================
      Days in Month
  ======================================================= */

  const daysInMonth = new Date(

    selectedYear,

    selectedMonth + 1,

    0

  ).getDate();

  /* =======================================================
      Calendar Days
  ======================================================= */

  const calendarDays = Array.from(

    {

      length: daysInMonth,

    },

    (_, index) => index + 1

  );

  /* =======================================================
      Format Date
  ======================================================= */

  function formatDate(day: number) {

    const month = String(

      selectedMonth + 1

    ).padStart(2, "0");

    const date = String(day).padStart(2, "0");

    return `${selectedYear}-${month}-${date}`;

  }
    /* =======================================================
      Load Bookings
  ======================================================= */

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

    }

    catch (error) {

      console.error("Error loading bookings:", error);

    }

    finally {

      setLoading(false);

    }

  }

  /* =======================================================
      Load on Page Open
  ======================================================= */

  useEffect(() => {

    loadBookings();

  }, []);

  /* =======================================================
      Villa Bookings
  ======================================================= */

  function getVillaBookings(villa: string) {

    return bookings.filter(

      (booking) => booking.villa === villa

    );

  }

  /* =======================================================
      Check Booking
  ======================================================= */

  function isBooked(

    villa: string,

    day: number

  ) {

    const currentDate = formatDate(day);

    const villaBookings =
      getVillaBookings(villa);

    return villaBookings.find((booking) => {

  return (

    currentDate >= booking.checkIn &&
    currentDate < booking.checkOut

  );

});

  }

  /* =======================================================
      Cell Color
  ======================================================= */

  function getCellColor(

    villa: string,

    day: number

  ) {

    const booking =
      isBooked(villa, day);

    if (!booking)

      return "bg-white hover:bg-green-100";

    if (booking.status === "Cancelled")

      return "bg-red-300";

    return "bg-blue-500";

  }

  /* =======================================================
      Cell Click
  ======================================================= */

  function openBooking(

    villa: string,

    day: number

  ) {

    if (isBooked(villa, day)) {

      alert("This villa is already booked.");

      return;

    }

    const checkIn = formatDate(day);

  const nextDay = formatDate(day + 1);

  router.push(
    `/bookings?villa=${encodeURIComponent(villa)}&checkIn=${checkIn}&checkOut=${nextDay}`

    );

  }
    /* =======================================================
      Legend
  ======================================================= */

  const legend = [

    {
      name: "Available",
      color: "bg-white",
    },

    {
      name: "Booked",
      color: "bg-blue-500",
    },

    {
      name: "Cancelled",
      color: "bg-red-300",
    },

  ];

  /* =======================================================
      UI
  ======================================================= */

  return (

    <div className="flex min-h-screen bg-slate-100">

      <Sidebar />

      <div className="flex-1">

        <Navbar />

        <main className="p-8">

          {/* Header */}

          <div className="flex justify-between items-center mb-8">

            <div>

              <h1 className="text-3xl font-bold">

                Availability Calendar

              </h1>

              <p className="text-gray-500 mt-2">

                View villa availability and create bookings.

              </p>

            </div>

            {/* Month & Year */}

            <div className="flex gap-3">

              <select
                value={selectedMonth}
                onChange={(e) =>
                  setSelectedMonth(Number(e.target.value))
                }
                className="border rounded-lg p-3"
              >

                {months.map((month, index) => (

                  <option
                    key={index}
                    value={index}
                  >

                    {month}

                  </option>

                ))}

              </select>

              <select
                value={selectedYear}
                onChange={(e) =>
                  setSelectedYear(Number(e.target.value))
                }
                className="border rounded-lg p-3"
              >

                <option value={2025}>2025</option>

                <option value={2026}>2026</option>

                <option value={2027}>2027</option>

              </select>

            </div>

          </div>

          {/* Legend */}

          <div className="flex gap-6 mb-6">

            {legend.map((item) => (

              <div
                key={item.name}
                className="flex items-center gap-2"
              >

                <div
                  className={`w-5 h-5 border ${item.color}`}
                />

                <span>

                  {item.name}

                </span>

              </div>

            ))}

          </div>
                    {/* ==========================================
              Calendar
          ========================================== */}

          {loading ? (

            <div className="bg-white rounded-xl shadow p-10 text-center">

              <p className="text-lg font-medium">

                Loading availability...

              </p>

            </div>

          ) : (

            <div className="bg-white rounded-xl shadow overflow-x-auto">

              <table className="w-full border-collapse">

                <thead>

                  <tr>

                    <th className="border bg-gray-100 p-4 min-w-[180px]">

                      Villa

                    </th>

                    {calendarDays.map((day) => (

                      <th
                        key={day}
                        className="border bg-gray-100 text-center text-sm p-2 w-10"
                      >

                        {day}

                      </th>

                    ))}

                  </tr>

                </thead>

                <tbody>

                  {villas.map((villa) => (

                    <tr key={villa}>

                      {/* Villa Name */}

                      <td className="border p-4 font-semibold bg-gray-50 whitespace-nowrap">

                        {villa}

                      </td>

                      {/* Days */}

                      {calendarDays.map((day) => {

                        const booking =
                          isBooked(villa, day);

                        return (

                          <td
                            key={day}
                            onClick={() =>
                              openBooking(villa, day)
                            }
                            className={`
                              border
                              h-10
                              w-10
                              text-center
                              cursor-pointer
                              transition
                              ${getCellColor(villa, day)}
                            `}
                            title={
                              booking
                                ? `${booking.customerName}
${booking.checkIn} → ${booking.checkOut}`
                                : "Available"
                            }
                          >

                            {booking ? "✓" : ""}

                          </td>

                        );

                      })}

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}
                    {/* ==========================================
              Quick Summary
          ========================================== */}

          <div className="mt-6 bg-white rounded-xl shadow p-6">

            <div className="grid grid-cols-3 gap-6 text-center">

              <div>

                <h3 className="text-lg font-semibold text-blue-600">

                  {bookings.length}

                </h3>

                <p className="text-gray-500">

                  Total Bookings

                </p>

              </div>

              <div>

                <h3 className="text-lg font-semibold text-green-600">

                  {villas.length}

                </h3>

                <p className="text-gray-500">

                  Villas

                </p>

              </div>

              <div>

                <h3 className="text-lg font-semibold text-purple-600">

                  {months[selectedMonth]}

                </h3>

                <p className="text-gray-500">

                  Current Month

                </p>

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>

  );

}