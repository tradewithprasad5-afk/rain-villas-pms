import {
  LayoutDashboard,
  CalendarDays,
  BookOpenCheck,
  CreditCard,
  BarChart3,
  Settings,
} from "lucide-react";

export const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Availability",
    href: "/availability",
    icon: CalendarDays,
  },
  {
    title: "Bookings",
    href: "/bookings",
    icon: BookOpenCheck,
  },
  {
    title: "Payments",
    href: "/payments",
    icon: CreditCard,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];