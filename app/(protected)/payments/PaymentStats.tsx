import { IndianRupee, Wallet, AlertCircle, BookOpenCheck } from "lucide-react";

interface PaymentStatsProps {
  totalRevenue: number;
  totalReceived: number;
  totalOutstanding: number;
  totalBookings: number;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
}

function StatCard({
  title,
  value,
  icon,
  iconBg,
  iconColor,
  valueColor = "text-slate-900",
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] sm:text-sm text-slate-500 truncate">
            {title}
          </p>

          <p
            className={`mt-1.5 sm:mt-2 break-words text-lg sm:text-2xl font-bold tabular-nums ${valueColor}`}
          >
            {value}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
        >
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentStats({
  totalRevenue,
  totalReceived,
  totalOutstanding,
  totalBookings,
}: PaymentStatsProps) {
  return (
    <div className="mb-5 sm:mb-6 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
      <StatCard
        title="Total Revenue"
        value={`₹${totalRevenue.toLocaleString("en-IN")}`}
        icon={<IndianRupee size={20} />}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
      />

      <StatCard
        title="Total Received"
        value={`₹${totalReceived.toLocaleString("en-IN")}`}
        icon={<Wallet size={20} />}
        iconBg="bg-emerald-100"
        iconColor="text-emerald-600"
        valueColor="text-emerald-600"
      />

      <StatCard
        title="Outstanding"
        value={`₹${totalOutstanding.toLocaleString("en-IN")}`}
        icon={<AlertCircle size={20} />}
        iconBg="bg-red-100"
        iconColor="text-red-600"
        valueColor="text-red-600"
      />

      <StatCard
        title="Total Bookings"
        value={totalBookings.toString()}
        icon={<BookOpenCheck size={20} />}
        iconBg="bg-violet-100"
        iconColor="text-violet-600"
        valueColor="text-violet-600"
      />
    </div>
  );
}
