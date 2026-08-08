import { Search } from "lucide-react";

interface PaymentSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function PaymentSearch({
  search,
  onSearchChange,
}: PaymentSearchProps) {
  return (
    <div className="mb-4 sm:mb-6 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm">
      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          placeholder="Search by Booking Number or Guest Name..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 sm:py-3 pl-11 pr-4 text-sm sm:text-base outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
      </div>
    </div>
  );
}
