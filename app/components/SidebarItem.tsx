"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarItemProps {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  collapsed?: boolean;
}

export default function SidebarItem({
  title,
  href,
  icon: Icon,
  badge,
  collapsed,
}: SidebarItemProps) {
  const pathname = usePathname();

  const active =
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`relative flex items-center rounded-xl transition-all duration-300 group ${
        collapsed
          ? "justify-center px-0 py-4"
          : "gap-4 px-4 py-3"
      } ${
        active
          ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
          : "text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-cyan-300" />
      )}

      <Icon size={20} />

      {!collapsed && (
        <span className="font-medium">
          {title}
        </span>
      )}

      {!collapsed && badge && (
        <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
          {badge}
        </span>
      )}

      {collapsed && (
        <div
          className="
            pointer-events-none
            absolute
            left-20
            rounded-lg
            bg-slate-900
            px-3
            py-2
            text-sm
            text-white
            opacity-0
            transition
            whitespace-nowrap
            z-50
            group-hover:opacity-100
          "
        >
          {title}
        </div>
      )}
    </Link>
  );
}