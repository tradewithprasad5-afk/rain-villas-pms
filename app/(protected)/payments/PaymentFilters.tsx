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
    <div className="mb-6 flex flex-col gap-4 rounded-xl bg-white p-4 shadow md:flex-row md:items-end">
      {/* Date Filter */}
      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium text-gray-600">
          Date
        </label>

        <select
          value={dateFilter}
          onChange={(e) => onDateFilterChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
        >
          <option value="all">All</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="last7">Last 7 Days</option>
          <option value="last30">Last 30 Days</option>
          <option value="thisMonth">This Month</option>
          <option value="lastMonth">Last Month</option>
          <option value="recent10">Recent 10 Bookings</option>
        </select>
      </div>

      {/* Payment Status */}
      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium text-gray-600">
          Payment Status
        </label>

        <select
          value={paymentStatus}
          onChange={(e) => onPaymentStatusChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
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