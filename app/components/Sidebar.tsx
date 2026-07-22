"use client";

import { Hotel, LogOut } from "lucide-react";
import SidebarItem from "./SidebarItem";
import { menuItems } from "./menu";

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({
  collapsed,
}: SidebarProps) {
  return (
    <aside
  className={`
    hidden md:flex
    min-h-screen
    flex-col
    border-r
    border-slate-800
    bg-slate-950
    transition-all
    duration-300
    ${collapsed ? "w-20" : "w-72"}
  `}
>

      {/* Logo */}
      <div className="border-b border-slate-800 px-5 py-6">
  <div className="flex items-center gap-3">

    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500">
      <Hotel className="text-white" size={24} />
    </div>

    {!collapsed && (
      <div>
        <h1 className="text-lg font-bold text-white">
          Rain Villa PMS
        </h1>

        <p className="text-xs text-slate-400">
          Property Management
        </p>
      </div>
    )}

  </div>
</div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-6">
        {menuItems.map((item) => (
          <SidebarItem
    key={item.title}
    collapsed={collapsed}
    {...item}
/>
        ))}
      </nav>

      {/* User Card */}
     <div className="border-t border-slate-800 p-4">
  <div className="rounded-2xl bg-slate-900 p-4">

    <div className="flex justify-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-bold text-white">
        A
      </div>
    </div>

    {!collapsed && (
      <>
        <div className="mt-3 text-center">
          <p className="font-semibold text-white">
            Admin
          </p>

          <p className="text-xs text-slate-400">
            Property Manager
          </p>
        </div>

        <button
          className="
            mt-4
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-slate-800
            py-2
            text-sm
            text-slate-200
            transition
            hover:bg-red-500
            hover:text-white
          "
        >
          <LogOut size={18} />
          Logout
        </button>
      </>
    )}

  </div>
</div>
    </aside>
  );
}