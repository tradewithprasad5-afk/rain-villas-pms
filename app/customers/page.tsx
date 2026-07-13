"use client";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);

  async function loadCustomers() {
    const snapshot = await getDocs(collection(db, "customers"));

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setCustomers(data);
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <main className="p-8">
          <h1 className="text-3xl font-bold mb-6">
            Customers
          </h1>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-4">Customer</th>
                  <th className="text-left p-4">Phone</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-center p-4">Bookings</th>
                  <th className="text-center p-4">Last Stay</th>
                  <th className="text-right p-4">Total Spent</th>
                </tr>
              </thead>

              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-8 text-gray-500"
                    >
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-4 font-semibold">
                        {customer.name}
                      </td>

                      <td className="p-4">
                        {customer.phone}
                      </td>

                      <td className="p-4">
                        {customer.email || "-"}
                      </td>

                      <td className="text-center p-4">
                        {customer.totalBookings || 0}
                      </td>

                      <td className="text-center p-4">
                        {customer.lastStay || "-"}
                      </td>

                      <td className="text-right p-4 font-semibold text-green-700">
                        ₹{(customer.totalSpent || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}