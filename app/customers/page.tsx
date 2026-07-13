"use client";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import * as XLSX from "xlsx";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadCustomers() {
    try {
      setLoading(true);

      const snapshot = await getDocs(collection(db, "customers"));

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCustomers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  function exportCustomers() {
    const exportData = customers.map((customer) => ({
      Customer: customer.name,
      Phone: customer.phone,
      Email: customer.email || "",
      "Total Bookings": customer.totalBookings || 0,
      "Last Stay": customer.lastStay || "",
      "Total Spent (₹)": customer.totalSpent || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Customers"
    );

    XLSX.writeFile(
      workbook,
      `RainVilla_Customers_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <main className="p-8">

          <div className="flex justify-between items-center mb-8">

            <div>
              <h1 className="text-3xl font-bold">
                Customers
              </h1>

              <p className="text-gray-500 mt-1">
                Customer Directory
              </p>
            </div>

            <button
              onClick={exportCustomers}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg"
            >
              Export Excel
            </button>

          </div>

          <div className="bg-white rounded-xl shadow overflow-hidden">

            <table className="w-full">

              <thead className="bg-gray-100">

                <tr>

                  <th className="text-left p-4">
                    Customer
                  </th>

                  <th className="text-left p-4">
                    Phone
                  </th>

                  <th className="text-left p-4">
                    Email
                  </th>

                  <th className="text-center p-4">
                    Bookings
                  </th>

                  <th className="text-center p-4">
                    Last Stay
                  </th>

                  <th className="text-right p-4">
                    Total Spent
                  </th>

                </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan={6}
                      className="text-center py-12 text-gray-500"
                    >
                      Loading customers...
                    </td>

                  </tr>

                ) : customers.length === 0 ? (

                  <tr>

                    <td
                      colSpan={6}
                      className="text-center py-12 text-gray-500"
                    >
                      No customers found.
                    </td>

                  </tr>

                ) : (

                  customers.map((customer) => (

                    <tr
                      key={customer.id}
                      className="border-t hover:bg-gray-50"
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