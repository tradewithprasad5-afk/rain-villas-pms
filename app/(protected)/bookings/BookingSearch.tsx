interface BookingSearchProps {
  value: string;
  onChange: (value: string) => void;

  filter: "all" | "consent";
  onFilterChange: (value: "all" | "consent") => void;
}

export default function BookingSearch({
  value,
  onChange,
  filter,
  onFilterChange,
}: BookingSearchProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      
      <input
        type="text"
        placeholder="Search by customer, villa or status..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 md:max-w-md"
      />

      <select
        value={filter}
        onChange={(e) =>
          onFilterChange(e.target.value as "all" | "consent")
        }
        className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
      >
        <option value="all">All Bookings</option>
        <option value="consent">Consent Pending</option>
      </select>

    </div>
  );
}