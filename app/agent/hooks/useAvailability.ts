"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../../lib/firebase";
import { Booking } from "../types";

export function useAvailability() {

  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const unsubscribe = onSnapshot(

      collection(db, "bookings"),

      (snapshot) => {

        const data = snapshot.docs.map((doc) => ({

          id: doc.id,

          ...doc.data(),

        })) as Booking[];

        setBookings(data);

        setLoading(false);

      }

    );

    return () => unsubscribe();

  }, []);

  return {

    bookings,

    loading,

  };

}


