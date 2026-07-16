"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

interface Booking {
  id: string;
  villa: string;
  checkIn: string;
  checkOut: string;
  status: string;
}

export default function AgentPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "bookings"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Booking, "id">),
        }));

        setBookings(data);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-10">
        <h1 className="text-4xl font-bold text-center">
          Rain Villas
        </h1>

        <p className="text-center text-slate-500 mt-3">
          Live Availability Portal
        </p>

        <p className="text-center mt-6">
          Total Bookings: {bookings.length}
        </p>
      </div>
    </div>
  );
}