"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { X, Hotel, LogOut } from "lucide-react";
import { menuItems } from "./menu";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileSidebar({
  open,
  onClose,
}: MobileSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

async function handleLogout() {
  try {
    await signOut(auth);
    onClose(); // Close the mobile drawer
    router.push("/login");
  } catch (error) {
    console.error("Logout failed:", error);
  }
}
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${
          open
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-slate-950 shadow-2xl transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500">
              <Hotel className="text-white" size={24} />
            </div>

            <div>
              <h1 className="text-lg font-bold text-white">
                Rain Villa PMS
              </h1>

              <p className="text-xs text-slate-400">
                Property Management
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-2 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={onClose}
                className={`relative flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-300 ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-cyan-300" />
                )}

                <Icon size={20} />

                <span className="font-medium">
                  {item.title}
                </span>

                
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 p-4">
          <div className="rounded-2xl bg-slate-900 p-4">
            <p className="font-semibold text-white">
              Admin
            </p>

            <p className="text-sm text-slate-400">
              Property Manager
            </p>

            <button
  onClick={handleLogout}
  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 py-2 text-sm font-medium text-slate-200 transition hover:bg-red-500 hover:text-white"
>
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}