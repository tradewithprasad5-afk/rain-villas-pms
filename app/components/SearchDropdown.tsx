"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useSearch } from "../context/SearchContext";
import { Search, User, CalendarDays, CreditCard } from "lucide-react";
import Link from "next/link";

export default function SearchDropdown() {
  const { search } = useSearch();

  const [customers, setCustomers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const customerSnap = await getDocs(collection(db, "customers"));
      const bookingSnap = await getDocs(collection(db, "bookings"));

      let paymentSnap;
      try {
        paymentSnap = await getDocs(collection(db, "payments"));
      } catch {
        paymentSnap = { docs: [] };
      }

      setCustomers(
        customerSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );

      setBookings(
        bookingSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );

      setPayments(
        paymentSnap.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    }

    loadData();
  }, []);

  if (!search.trim()) return null;

  const keyword = search.toLowerCase();

  const customerResults = customers.filter((c) =>
    c.name?.toLowerCase().includes(keyword)
  );

  const bookingResults = bookings.filter(
    (b) =>
      b.customerName?.toLowerCase().includes(keyword) ||
      b.villa?.toLowerCase().includes(keyword)
  );

  const paymentResults = payments.filter(
    (p) =>
      p.customerName?.toLowerCase().includes(keyword)
  );

  return (
    <div className="absolute left-0 right-0 top-14 z-50 rounded-xl border bg-white shadow-xl">

      {customerResults.length === 0 &&
        bookingResults.length === 0 &&
        paymentResults.length === 0 && (
          <div className="p-5 text-center text-gray-500">
            <Search className="mx-auto mb-2" />
            No results found
          </div>
        )}

      {customerResults.length > 0 && (
        <>
          <div className="px-4 pt-4 pb-2 text-xs font-bold text-gray-400 uppercase">
            Customers
          </div>

          {customerResults.map((customer) => (
            <Link
              key={customer.id}
              href="/customers"
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100"
            >
              <User size={18} />
              <div>
                <p className="font-medium">{customer.name}</p>
                <p className="text-sm text-gray-500">
                  {customer.phone}
                </p>
              </div>
            </Link>
          ))}
        </>
      )}

      {bookingResults.length > 0 && (
        <>
          <div className="px-4 pt-4 pb-2 text-xs font-bold text-gray-400 uppercase">
            Bookings
          </div>

          {bookingResults.map((booking) => (
            <Link
              key={booking.id}
              href="/bookings"
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100"
            >
              <CalendarDays size={18} />
              <div>
                <p className="font-medium">
                  {booking.customerName}
                </p>
                <p className="text-sm text-gray-500">
                  {booking.villa}
                </p>
              </div>
            </Link>
          ))}
        </>
      )}

      {paymentResults.length > 0 && (
        <>
          <div className="px-4 pt-4 pb-2 text-xs font-bold text-gray-400 uppercase">
            Payments
          </div>

          {paymentResults.map((payment) => (
            <Link
              key={payment.id}
              href="/payments"
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100"
            >
              <CreditCard size={18} />
              <div>
                <p className="font-medium">
                  {payment.customerName}
                </p>
                <p className="text-sm text-gray-500">
                  ₹{payment.amount}
                </p>
              </div>
            </Link>
          ))}
        </>
      )}
    </div>
  );
}