import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { villas } from "./data";

export async function checkAvailability(
  checkIn: Date,
  checkOut: Date
) {
  const snapshot = await getDocs(collection(db, "bookings"));

  const bookings = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return villas.map((villa) => {
    const conflict = bookings.find((booking: any) => {
      // Only compare bookings for this villa
      if (booking.villa !== villa.name) return false;

      // Ignore cancelled/pending bookings
      if (booking.status !== "Confirmed") return false;

      const bookingIn = new Date(booking.checkIn);
      const bookingOut = new Date(booking.checkOut);

      // Check if requested dates overlap
      return (
        checkIn < bookingOut &&
        checkOut > bookingIn
      );
    });

    return {
      ...villa,
      available: !conflict,
      booking: conflict || null,
    };
  });
}