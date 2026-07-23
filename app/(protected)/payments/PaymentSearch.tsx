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
    <div className="bg-white rounded-xl shadow p-4 mb-6 flex gap-4">
      <input
        type="text"
        placeholder="🔍 Search by Booking Number or Guest Name..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 border rounded-lg px-4 py-3"
      />

      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="border rounded-lg px-4 py-3"
      >
        <option value="All">All</option>
        <option value="Paid">Paid</option>
        <option value="Partial">Partial</option>
      </select>
    </div>
  );
}