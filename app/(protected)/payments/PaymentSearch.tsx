interface PaymentSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function PaymentSearch({
  search,
  onSearchChange,
}: PaymentSearchProps) {
  return (
    <div className="mb-4 sm:mb-6 rounded-xl bg-white p-3 sm:p-4 shadow">
      <input
        type="text"
        placeholder="🔍 Search by Booking Number or Guest Name..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full rounded-lg border px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
}
