interface PaymentHeaderProps {
  filter: "month" | "year" | "all";
  onFilterChange: React.Dispatch<
    React.SetStateAction<"month" | "year" | "all">
  >;
}

export default function PaymentHeader({
  filter,
  onFilterChange,
}: PaymentHeaderProps) {
  return (
    <div className="mb-5 sm:mb-8 flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-xl sm:text-3xl font-bold text-slate-900">
          Payments
        </h1>

        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Receive and manage booking payments.
        </p>
      </div>

      <div className="relative w-full md:w-auto">
        <select
          value={filter}
          onChange={(e) =>
            onFilterChange(e.target.value as "month" | "year" | "all")
          }
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-9 text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:bg-slate-50 md:w-auto"
        >
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
        </select>

        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}
