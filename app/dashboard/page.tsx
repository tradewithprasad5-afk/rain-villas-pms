"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";

import { db } from "../lib/firebase";



import DashboardHeader from "./components/DashboardHeader";
import StatsCards from "./components/StatsCards";
import RevenueChart from "./components/RevenueChart";
import ActivityCard from "./components/ActivityCard";
import PaymentSummary from "./components/PaymentSummary";

import { Booking } from "@/app/types/booking";

interface Activity {
  type: "checkin" | "checkout";
  guest: string;
  villa: string;
  date: string;
}

export default function DashboardPage() {
  

  const [bookings, setBookings] = useState<Booking[]>([]);

  const [totalBookings, setTotalBookings] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [advanceReceived, setAdvanceReceived] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);

  const [paradiseOccupied, setParadiseOccupied] = useState(false);
  const [heavenOccupied, setHeavenOccupied] = useState(false);

  const [paradiseGuest, setParadiseGuest] = useState("");
  const [heavenGuest, setHeavenGuest] = useState("");

  const [paradiseCheckout, setParadiseCheckout] = useState("");
  const [heavenCheckout, setHeavenCheckout] = useState("");

  const [activities, setActivities] = useState<Activity[]>([]);

  const [monthlyRevenue, setMonthlyRevenue] = useState<number[]>(
    new Array(12).fill(0)
  );

  async function loadDashboard() {
    const snapshot = await getDocs(collection(db, "bookings"));

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Booking, "id">),
    }));

    setBookings(data);

    setTotalBookings(data.length);

    setTotalRevenue(
      data.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0)
    );

    setAdvanceReceived(
      data.reduce((sum, booking) => sum + (booking.advancePaid || 0), 0)
    );

    setPendingBalance(
      data.reduce((sum, booking) => sum + (booking.balanceAmount || 0), 0)
    );

    const revenue = new Array(12).fill(0);

    data.forEach((booking) => {
      if (!booking.checkIn) return;

      const date = new Date(booking.checkIn);

      if (isNaN(date.getTime())) return;

      revenue[date.getMonth()] += booking.totalAmount || 0;
    });

    setMonthlyRevenue(revenue);

    const today = new Date().toISOString().split("T")[0];

    setParadiseOccupied(false);
    setHeavenOccupied(false);

    setParadiseGuest("");
    setHeavenGuest("");

    setParadiseCheckout("");
    setHeavenCheckout("");

    const activityList: Activity[] = [];

    data.forEach((booking) => {
      if (booking.status !== "Confirmed") return;

      if (
        booking.villa === "Rain Paradise" &&
        booking.checkIn <= today &&
        booking.checkOut >= today
      ) {
        setParadiseOccupied(true);
        setParadiseGuest(booking.customerName);
        setParadiseCheckout(booking.checkOut);
      }

      if (
        booking.villa === "Rain Heaven" &&
        booking.checkIn <= today &&
        booking.checkOut >= today
      ) {
        setHeavenOccupied(true);
        setHeavenGuest(booking.customerName);
        setHeavenCheckout(booking.checkOut);
      }

      if (booking.checkIn === today) {
        activityList.push({
          type: "checkin",
          guest: booking.customerName,
          villa: booking.villa,
          date: booking.checkIn,
        });
      }

      if (booking.checkOut === today) {
        activityList.push({
          type: "checkout",
          guest: booking.customerName,
          villa: booking.villa,
          date: booking.checkOut,
        });
      }
    });

    setActivities(activityList);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
  <div className="mx-auto max-w-7xl space-y-8 px-4 py-4 sm:px-6">

      

          <DashboardHeader />

          <StatsCards
            totalBookings={totalBookings}
            totalRevenue={totalRevenue}
            advanceReceived={advanceReceived}
            pendingBalance={pendingBalance}
            paradiseOccupied={paradiseOccupied}
            heavenOccupied={heavenOccupied}
          />

          <RevenueChart
            revenueData={monthlyRevenue}
            totalRevenue={totalRevenue}
          />

          <div className="grid gap-6 lg:grid-cols-3">

  <div className="lg:col-span-2">
    <ActivityCard activities={activities} />
  </div>

  <div>
    <PaymentSummary
      totalRevenue={totalRevenue}
      advanceReceived={advanceReceived}
      pendingBalance={pendingBalance}
    />
  </div>

</div>

        </div>
  );
}