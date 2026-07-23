interface PaymentSearchProps {
  search: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export default function PaymentSearch({
  search,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: PaymentSearchProps) {
  return (
    <div className="mb-6 rounded-xl bg-white p-4 shadow">
      <div className="flex flex-col gap-3 md:flex-row">
        <input
          type="text"
          placeholder="🔍 Search by Booking Number or Guest Name..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-blue-500"
        />

        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-blue-500 md:w-48"
        >
          <option value="All">All</option>
          <option value="Paid">Paid</option>
          <option value="Partial">Partial</option>
        </select>
      </div>
    </div>
  );
}