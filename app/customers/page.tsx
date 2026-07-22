"use client";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import * as XLSX from "xlsx";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

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

  async function deleteCustomer(id: string) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "customers", id));

      setCustomers((prev) =>
        prev.filter((customer) => customer.id !== id)
      );

      alert("Customer deleted successfully.");
    } catch (error) {
      console.error(error);
      alert("Unable to delete customer.");
    }
  }

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
      <Sidebar collapsed={collapsed} />

      <div className="flex-1">
        <Navbar
  collapsed={collapsed}
  toggleSidebar={() => setCollapsed((prev) => !prev)}
  onMenuClick={() => {}}
/>

        <main className="p-8">

          <div className="mb-8 flex items-center justify-between">

            <div>
              <h1 className="text-3xl font-bold">
                Customers
              </h1>

              <p className="mt-1 text-gray-500">
                Customer Directory
              </p>
            </div>

            <button
              onClick={exportCustomers}
              className="rounded-lg bg-green-600 px-5 py-3 text-white hover:bg-green-700"
            >
              Export Excel
            </button>

          </div>

          <div className="overflow-x-auto rounded-xl bg-white shadow">

            <table className="min-w-[1000px] w-full">

              <thead className="bg-gray-100">

                <tr>

                  <th className="p-4 text-left">
                    Customer
                  </th>

                  <th className="p-4 text-left">
                    Phone
                  </th>

                  <th className="p-4 text-left">
                    Email
                  </th>

                  <th className="p-4 text-center">
                    Bookings
                  </th>

                  <th className="p-4 text-center">
                    Last Stay
                  </th>

                  <th className="p-4 text-right">
                    Total Spent
                  </th>

                  <th className="p-4 text-center">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan={7}
                      className="py-12 text-center text-gray-500"
                    >
                      Loading customers...
                    </td>

                  </tr>

                ) : customers.length === 0 ? (

                  <tr>

                    <td
                      colSpan={7}
                      className="py-12 text-center text-gray-500"
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

                      <td className="p-4 text-center">
                        {customer.totalBookings || 0}
                      </td>

                      <td className="p-4 text-center">
                        {customer.lastStay || "-"}
                      </td>

                      <td className="p-4 text-right font-semibold text-green-700">
                        ₹{(customer.totalSpent || 0).toLocaleString()}
                      </td>

                      <td className="p-4 text-center">

                        <button
                          onClick={() =>
                            deleteCustomer(customer.id)
                          }
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                        >
                          Delete
                        </button>

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