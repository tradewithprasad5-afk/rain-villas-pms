interface BookingSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function BookingSearch({
  value,
  onChange,
}: BookingSearchProps) {
  return (
    <div className="w-full">
      <input
        type="text"
        placeholder="Search by customer, villa or status..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 md:max-w-md"
      />
    </div>
  );
}