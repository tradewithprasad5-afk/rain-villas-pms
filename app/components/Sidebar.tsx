"use client";

import Link from "next/link";
import {
  FaHome,
  FaCalendarAlt,
  FaUsers,
  FaMoneyBill,
  FaFileInvoice,
  FaClipboardList,
  FaChartBar,
  FaCog,
} from "react-icons/fa";

export default function Sidebar() {
 const menu = [
  { name: "Dashboard", icon: <FaHome />, link: "/" },

  { name: "Availability", icon: <FaCalendarAlt />, link: "/availability" },

  { name: "Bookings", icon: <FaCalendarAlt />, link: "/bookings" },

  { name: "Payments", icon: <FaMoneyBill />, link: "/payments" },

  { name: "Invoices", icon: <FaFileInvoice />, link: "/invoices" },

  { name: "Housekeeping", icon: <FaClipboardList />, link: "/housekeeping" },

  { name: "Reports", icon: <FaChartBar />, link: "/reports" },

  { name: "Settings", icon: <FaCog />, link: "/settings" },
];

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen p-6">
      <h1 className="text-2xl font-bold text-green-400 mb-10">
        The 5ive Ventures
      </h1>

      {menu.map((item) => (
        <Link
          key={item.name}
          href={item.link}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 mb-2"
        >
          {item.icon}
          {item.name}
        </Link>
      ))}
    </div>
  );
}