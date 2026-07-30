interface PaymentFiltersProps {
  dateFilter: string;
  paymentStatus: string;
  onDateFilterChange: (value: string) => void;
  onPaymentStatusChange: (value: string) => void;
}

export default function PaymentFilters({
  dateFilter,
  paymentStatus,
  onDateFilterChange,
  onPaymentStatusChange,
}: PaymentFiltersProps) {
  return (
    <div className="mb-4 sm:mb-6 grid grid-cols-2 gap-2.5 sm:gap-4 rounded-xl bg-white p-3 sm:p-4 shadow">
      {/* Date Filter */}
      <div>
        <label className="mb-1 block text-xs sm:text-sm font-medium text-gray-600">
          Date
        </label>

        <select
          value={dateFilter}
          onChange={(e) => onDateFilterChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-2.5 sm:px-3 py-2 text-xs sm:text-base focus:border-blue-500 focus:outline-none"
        >
          <option value="all">All</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="last7">Last 7 Days</option>
          
          <option value="thisMonth">This Month</option>
          <option value="lastMonth">Last Month</option>
          
        </select>
      </div>

      {/* Payment Status */}
      <div>
        <label className="mb-1 block text-xs sm:text-sm font-medium text-gray-600">
          Payment Status
        </label>

        <select
          value={paymentStatus}
          onChange={(e) => onPaymentStatusChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-2.5 sm:px-3 py-2 text-xs sm:text-base focus:border-blue-500 focus:outline-none"
        >
          <option value="all">All</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>
    </div>
  );
}
