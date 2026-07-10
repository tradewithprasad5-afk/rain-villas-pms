import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import { Booking } from "./bookingTypes";

// Get all bookings
export async function getBookings(): Promise<Booking[]> {
  const snapshot = await getDocs(collection(db, "bookings"));

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<Booking, "id">),
  }));
}

// Add a booking
export async function addBooking(booking: Booking) {
  await addDoc(collection(db, "bookings"), booking);
}

// Update a booking
export async function updateBooking(id: string, booking: Booking) {
  await updateDoc(doc(db, "bookings", id), {
    ...booking,
  });
}

// Delete a booking
export async function deleteBooking(id: string) {
  await deleteDoc(doc(db, "bookings", id));
}