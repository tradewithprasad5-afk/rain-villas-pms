interface PaymentFiltersProps {
  dateFilter: string;
  paymentStatus: string;
  onDateFilterChange: (value: string) => void;
  onPaymentStatusChange: (value: string) => void;
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs sm:text-sm font-medium text-slate-600">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-8 text-xs sm:text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          {children}
        </select>

        <svg
          className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
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

export default function PaymentFilters({
  dateFilter,
  paymentStatus,
  onDateFilterChange,
  onPaymentStatusChange,
}: PaymentFiltersProps) {
  return (
    <div className="mb-4 sm:mb-6 grid grid-cols-2 gap-2.5 sm:gap-4 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm">
      <FilterSelect
        label="Date"
        value={dateFilter}
        onChange={onDateFilterChange}
      >
        <option value="all">All</option>
        <option value="today">Today</option>
        <option value="yesterday">Yesterday</option>
        <option value="last7">Last 7 Days</option>
        <option value="thisMonth">This Month</option>
        <option value="lastMonth">Last Month</option>
      </FilterSelect>

      <FilterSelect
        label="Payment Status"
        value={paymentStatus}
        onChange={onPaymentStatusChange}
      >
        <option value="all">All</option>
        <option value="paid">Paid</option>
        <option value="partial">Partial</option>
        <option value="unpaid">Unpaid</option>
      </FilterSelect>
    </div>
  );
}
