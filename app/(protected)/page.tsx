"use client";


import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/AuthProvider";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const router = useRouter();
const { user, loading } = useAuth();
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [advanceReceived, setAdvanceReceived] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [confirmedBookings, setConfirmedBookings] = useState(0);
  const totalVillas = 2;
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
const [monthlyRevenue, setMonthlyRevenue] = useState<number[]>(
  Array(12).fill(0)
);


  async function loadDashboard() {
    
    const snapshot = await getDocs(collection(db, "bookings"));

    const bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setTotalBookings(bookings.length);

    const revenue = bookings.reduce(
      (sum: number, booking: any) => sum + (booking.totalAmount || 0),
      0
    );
    setTotalRevenue(revenue);

    const advance = bookings.reduce(
      (sum: number, booking: any) => sum + (booking.advancePaid || 0),
      0
    );
    setAdvanceReceived(advance);

    const balance = bookings.reduce(
      (sum: number, booking: any) => sum + (booking.balanceAmount || 0),
      0
    );
    setPendingBalance(balance);
    const confirmed = bookings.filter(
  (booking: any) => booking.status === "Confirmed"
).length;

setConfirmedBookings(confirmed);


    
    setRecentBookings(bookings.slice(0, 5));
    const revenueByMonth = Array(12).fill(0);

bookings.forEach((booking: any) => {
  if (!booking.checkIn) return;

  const month = new Date(booking.checkIn).getMonth();

  revenueByMonth[month] += booking.totalAmount || 0;
});

setMonthlyRevenue(revenueByMonth);
  }

  useEffect(() => {
  if (loading) return;

  if (!user) {
    router.replace("/login");
    return;
  }

  loadDashboard();
}, [user, loading, router]);
  const chartData = {
  labels: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  datasets: [
    {
      label: "Monthly Revenue",
      data: monthlyRevenue,
      backgroundColor: "#16a34a",
    },
  ],
};
if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
  );
}

if (!user) {
  return null;
}
  return (
  <div className="space-y-6">
          <h1 className="text-3xl font-bold mb-6">
  Dashboard
</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-gray-500">Total Bookings</h3>
              <p className="text-3xl font-bold">{totalBookings}</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-gray-500">Total Revenue</h3>
              <p className="text-3xl font-bold">
                ₹{totalRevenue.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-gray-500">Advance Received</h3>
              <p className="text-3xl font-bold">
                ₹{advanceReceived.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-gray-500">Pending Balance</h3>
              <p className="text-3xl font-bold">
                ₹{pendingBalance.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-gray-500">
  Confirmed Bookings
</h3>

<p className="text-3xl font-bold">
  {confirmedBookings}
</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
  <h3 className="text-gray-500">Total Villas</h3>
  <p className="text-3xl font-bold">{totalVillas}</p>
</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 mt-8">
  <h2 className="text-xl font-bold mb-4">
    Monthly Revenue
  </h2>

  <Bar data={chartData} />
</div>
<div className="bg-white rounded-xl shadow mt-8 overflow-hidden">
  <div className="p-6 border-b flex justify-between items-center">
  <h2 className="text-xl font-bold">Recent Bookings</h2>

  <Link
    href="/bookings"
    className="text-green-600 font-semibold hover:underline"
  >
    View All →
  </Link>
</div>

  <table className="w-full">
    <thead className="bg-gray-100">
      <tr>
        <th className="text-left p-4">Customer</th>
        <th className="text-left p-4">Villa</th>
        <th className="text-left p-4">Check In</th>
        <th className="text-left p-4">Status</th>
        
      <th className="text-left p-4">Amount</th>
<th className="text-left p-4">Actions</th>
      </tr>
      
    </thead>

    <tbody>
      {recentBookings.map((booking) => (
        <tr key={booking.id} className="border-b">
          <td className="p-4">{booking.customerName}</td>
          <td className="p-4">{booking.villa}</td>
          <td className="p-4">{booking.checkIn}</td>

          <td className="p-4">
            
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                booking.status === "Confirmed"
                  ? "bg-green-100 text-green-700"
                  : booking.status === "Pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {booking.status}
            </span>
          </td>
          <td className="p-4">
  ₹{booking.totalAmount}
  
</td>
<td className="p-4">
  <Link href="/bookings">
    <button className="text-blue-600 hover:text-blue-800 mr-3">
      <FaEdit />
    </button>
  </Link>

  <Link href="/bookings">
    <button className="text-red-600 hover:text-red-800">
      <FaTrash />
    </button>
  </Link>
</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
        </div>

);
}