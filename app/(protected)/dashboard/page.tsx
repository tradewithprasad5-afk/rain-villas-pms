"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";

import { db } from "@/app/lib/firebase";



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
  const [filter, setFilter] = useState<"month" | "year" | "all">("month");
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
  const [todayBalanceDue, setTodayBalanceDue] = useState<Booking[]>([]);
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

    const now = new Date();
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();
const filteredData = data.filter((booking) => {
  if (booking.status === "Cancelled") return false;
  if (!booking.checkIn) return false;

  const checkIn = new Date(booking.checkIn);

  switch (filter) {
    case "month":
      return (
        checkIn.getMonth() === currentMonth &&
        checkIn.getFullYear() === currentYear
      );

    case "year":
      return checkIn.getFullYear() === currentYear;

    case "all":
      return true;
  }
});
let monthlyBookings = 0;

filteredData.forEach((booking) => {
  if (booking.status === "Cancelled") return;
  if (!booking.checkIn || !booking.checkOut) return;

  let current = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);

  while (current < checkOut) {
  if (filter === "month") {
    if (
      current.getMonth() === currentMonth &&
      current.getFullYear() === currentYear
    ) {
      monthlyBookings++;
    }
  } else if (filter === "year") {
    if (current.getFullYear() === currentYear) {
      monthlyBookings++;
    }
  } else {
    monthlyBookings++;
  }

  current.setDate(current.getDate() + 1);
}
});

setTotalBookings(monthlyBookings);

    setTotalRevenue(
  filteredData.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0)
);

setAdvanceReceived(
  filteredData.reduce((sum, booking) => sum + (booking.advancePaid || 0), 0)
);

setPendingBalance(
  filteredData.reduce((sum, booking) => sum + (booking.balanceAmount || 0), 0)
);

    const revenue = new Array(12).fill(0);

    filteredData.forEach((booking) => {
      if (!booking.checkIn) return;

      const date = new Date(booking.checkIn);

      if (isNaN(date.getTime())) return;

      revenue[date.getMonth()] += booking.totalAmount || 0;
    });

    setMonthlyRevenue(revenue);

    

const today = `${now.getFullYear()}-${String(
  now.getMonth() + 1
).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

const currentHour = now.getHours();

const CHECK_OUT_HOUR = 11;

    setParadiseOccupied(false);
    setHeavenOccupied(false);

    setParadiseGuest("");
    setHeavenGuest("");

    setParadiseCheckout("");
    setHeavenCheckout("");

    const activityList: Activity[] = [];
    const balanceDueToday: Booking[] = [];
    data.forEach((booking) => {
      if (
  booking.status === "Confirmed" &&
  booking.checkIn <= today &&
booking.checkOut >= today &&
booking.balanceAmount > 0
) {
  balanceDueToday.push(booking);
}
      if (booking.status !== "Confirmed") return;

      const paradiseOccupied =
  booking.villa === "Rain Paradise" &&
  booking.checkIn <= today &&
  (
    booking.checkOut > today ||
    (booking.checkOut === today && currentHour < CHECK_OUT_HOUR)
  );

if (paradiseOccupied) {
        setParadiseOccupied(true);
        setParadiseGuest(booking.customerName);
        setParadiseCheckout(booking.checkOut);
      }

      const heavenOccupied =
  booking.villa === "Rain Heaven" &&
  booking.checkIn <= today &&
  (
    booking.checkOut > today ||
    (booking.checkOut === today && currentHour < CHECK_OUT_HOUR)
  );

if (heavenOccupied) {
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
    setTodayBalanceDue(balanceDueToday);
  }

  useEffect(() => {
  loadDashboard();
}, [filter]);

  return (
  <div className="mx-auto max-w-7xl space-y-8 px-4 py-4 sm:px-6">

      

          <DashboardHeader
  todayBalanceDue={todayBalanceDue}
  filter={filter}
  onFilterChange={setFilter}
/>

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