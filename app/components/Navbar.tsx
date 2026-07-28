"use client";

import {
  Menu,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useSearch } from "../context/SearchContext";
import SearchDropdown from "./SearchDropdown";
interface NavbarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
  onMenuClick: () => void;
}

export default function Navbar({
  collapsed,
  toggleSidebar,
  onMenuClick,
}: NavbarProps) {
  // Global Search
  const { search, setSearch } = useSearch();
  const pathname = usePathname();

const pageTitle = useMemo(() => {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname.startsWith("/bookings")) return "Bookings";
  if (pathname.startsWith("/customers")) return "Customers";
  if (pathname.startsWith("/payments")) return "Payments";
  if (pathname.startsWith("/reports")) return "Reports";
  if (pathname.startsWith("/consents")) return "Guest Consents";
  if (pathname.startsWith("/settings")) return "Settings";

  return "Rain Villa PMS";
}, [pathname]);

  // Today's Date
  const today = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date());
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-lg">

      {/* Left */}
      <div className="flex items-center gap-3">

        {/* Mobile Menu */}
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 transition hover:bg-slate-100 md:hidden"
        >
          <Menu size={24} />
        </button>

        {/* Desktop Collapse */}
        <button
          onClick={toggleSidebar}
          className="hidden rounded-xl p-2 transition hover:bg-slate-100 md:flex"
        >
          {collapsed ? (
            <PanelLeftOpen size={22} />
          ) : (
            <PanelLeftClose size={22} />
          )}
        </button>

        {/* Title */}
        <div>
  <h1 className="text-xl font-bold text-slate-900 md:text-2xl">
  {pageTitle}
</h1>
    {pageTitle}
  </h1>

  <p className="hidden text-sm text-slate-500 md:block">
    {today}
  </p>
</div>

      </div>

      {/* Search */}
      <div className="hidden lg:flex w-full max-w-md mx-10">

        <div className="relative w-full">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookings, customers..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
          />

          {/* Global Search Results */}
          <SearchDropdown />

        </div>

      </div>

      {/* Right */}
      <div className="flex items-center gap-5">

        

        {/* User */}
        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 font-semibold text-white">
            A
          </div>

          <div className="hidden sm:block">

            <p className="font-semibold text-slate-800">
              Admin
            </p>

            <p className="text-xs text-slate-500">
              Property Manager
            </p>

          </div>

        </div>

      </div>

    </header>
  );
}