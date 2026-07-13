"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

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

export default function ReportsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

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

  const totalRevenue = useMemo(
    () =>
      bookings.reduce(
        (sum, booking) => sum + Number(booking.totalAmount || 0),
        0
      ),
    [bookings]
  );

  const totalReceived = useMemo(
    () =>
      bookings.reduce(
        (sum, booking) => sum + Number(booking.advancePaid || 0),
        0
      ),
    [bookings]
  );

  const totalBalance = useMemo(
    () =>
      bookings.reduce(
        (sum, booking) => sum + Number(booking.balanceAmount || 0),
        0
      ),
    [bookings]
  );

  const totalBookings = bookings.length;

  const villaStats = useMemo(() => {
    const stats: Record<string, number> = {};

    bookings.forEach((booking) => {
      stats[booking.villa] = (stats[booking.villa] || 0) + 1;
    });

    return stats;
  }, [bookings]);

  const monthlyBookings = useMemo(() => {
    const stats: Record<string, number> = {};

    bookings.forEach((booking) => {
      if (!booking.checkIn) return;

      const month = new Date(booking.checkIn).toLocaleString("en-IN", {
        month: "short",
        year: "numeric",
      });

      stats[month] = (stats[month] || 0) + 1;
    });

    return stats;
  }, [bookings]);

  const villaRevenue = useMemo(() => {
    const stats: Record<string, number> = {};

    bookings.forEach((booking) => {
      stats[booking.villa] =
        (stats[booking.villa] || 0) +
        Number(booking.totalAmount || 0);
    });

    return stats;
  }, [bookings]);

  return (
    <div className="p-8">

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Reports
        </h1>

        <p className="text-gray-500 mt-2">
          Revenue, occupancy and booking reports.
        </p>
      </div>

      {loading ? (

        <div className="bg-white rounded-xl shadow p-10 text-center">
          Loading...
        </div>

      ) : (

        <>

          {/* Revenue */}

          <h2 className="text-2xl font-bold mb-5">
            Revenue Report
          </h2>

          <div className="grid gap-6 md:grid-cols-3 mb-10">

            <div className="bg-white rounded-xl shadow p-6">

              <p className="text-gray-500 text-sm">
                Total Revenue
              </p>

              <h3 className="mt-3 text-4xl font-bold text-blue-700">
                ₹{totalRevenue.toLocaleString("en-IN")}
              </h3>

            </div>

            <div className="bg-white rounded-xl shadow p-6">

              <p className="text-gray-500 text-sm">
                Amount Received
              </p>

              <h3 className="mt-3 text-4xl font-bold text-green-700">
                ₹{totalReceived.toLocaleString("en-IN")}
              </h3>

            </div>

            <div className="bg-white rounded-xl shadow p-6">

              <p className="text-gray-500 text-sm">
                Outstanding Balance
              </p>

              <h3 className="mt-3 text-4xl font-bold text-red-700">
                ₹{totalBalance.toLocaleString("en-IN")}
              </h3>

            </div>

          </div>

          {/* Occupancy */}

          <h2 className="text-2xl font-bold mb-5">
            Occupancy Report
          </h2>

          <div className="grid gap-6 md:grid-cols-3 mb-10">

            <div className="bg-white rounded-xl shadow p-6">

              <p className="text-gray-500 text-sm">
                Total Bookings
              </p>

              <h3 className="mt-3 text-4xl font-bold text-blue-700">
                {totalBookings}
              </h3>

            </div>

            {Object.entries(villaStats).map(([villa, count]) => (

              <div
                key={villa}
                className="bg-white rounded-xl shadow p-6"
              >

                <p className="text-gray-500 text-sm">
                  {villa}
                </p>

                <h3 className="mt-3 text-4xl font-bold text-green-700">
                  {count}
                </h3>

                <p className="mt-2 text-gray-500 text-sm">
                  Bookings
                </p>

              </div>

            ))}
                       

          </div>

          {/* Monthly Bookings */}

          <h2 className="text-2xl font-bold mb-5">
            Monthly Bookings
          </h2>

          <div className="bg-white rounded-xl shadow overflow-hidden mb-10">

            <table className="w-full">

              <thead className="bg-gray-100">

                <tr>
                  <th className="p-4 text-left">Month</th>
                  <th className="p-4 text-right">Bookings</th>
                </tr>

              </thead>

              <tbody>

                {Object.entries(monthlyBookings).length === 0 ? (

                  <tr>
                    <td
                      colSpan={2}
                      className="text-center p-6 text-gray-500"
                    >
                      No bookings available.
                    </td>
                  </tr>

                ) : (

                  Object.entries(monthlyBookings).map(
                    ([month, count]) => (

                      <tr
                        key={month}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="p-4">
                          {month}
                        </td>

                        <td className="p-4 text-right font-semibold">
                          {count}
                        </td>
                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

          {/* Villa-wise Revenue */}

          <h2 className="text-2xl font-bold mb-5">
            Villa-wise Revenue
          </h2>

          <div className="bg-white rounded-xl shadow overflow-hidden mb-10">

            <table className="w-full">

              <thead className="bg-gray-100">

                <tr>
                  <th className="p-4 text-left">Villa</th>
                  <th className="p-4 text-right">Revenue</th>
                </tr>

              </thead>

              <tbody>

                {Object.entries(villaRevenue).map(
                  ([villa, amount]) => (

                    <tr
                      key={villa}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="p-4">
                        {villa}
                      </td>

                      <td className="p-4 text-right font-semibold text-blue-700">
                        ₹{amount.toLocaleString("en-IN")}
                      </td>
                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

          {/* Revenue Details */}

          <h2 className="text-2xl font-bold mb-5">
            Booking Revenue Details
          </h2>

          <div className="bg-white rounded-xl shadow overflow-hidden">

            <table className="w-full">

              <thead className="bg-gray-100">

                <tr>
                  <th className="p-4 text-left">
                    Booking No.
                  </th>

                  <th className="p-4 text-left">
                    Guest
                  </th>

                  <th className="p-4 text-left">
                    Villa
                  </th>

                  <th className="p-4 text-right">
                    Total
                  </th>

                  <th className="p-4 text-right">
                    Received
                  </th>

                  <th className="p-4 text-right">
                    Balance
                  </th>

                </tr>

              </thead>

              <tbody>

                {bookings.length === 0 ? (

                  <tr>

                    <td
                      colSpan={6}
                      className="text-center p-8 text-gray-500"
                    >
                      No bookings available.
                    </td>

                  </tr>

                ) : (

                  bookings.map((booking) => (

                    <tr
                      key={booking.id}
                      className="border-t hover:bg-gray-50"
                    >

                      <td className="p-4">
                        {booking.bookingNumber}
                      </td>

                      <td className="p-4">
                        {booking.customerName}
                      </td>

                      <td className="p-4">
                        {booking.villa}
                      </td>

                      <td className="p-4 text-right">
                        ₹{Number(
                          booking.totalAmount
                        ).toLocaleString("en-IN")}
                      </td>

                      <td className="p-4 text-right text-green-700">
                        ₹{Number(
                          booking.advancePaid
                        ).toLocaleString("en-IN")}
                      </td>

                      <td className="p-4 text-right text-red-700">
                        ₹{Number(
                          booking.balanceAmount
                        ).toLocaleString("en-IN")}
                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </>

      )}

    </div>

  );
}