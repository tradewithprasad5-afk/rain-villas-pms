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
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold">
          Payments
        </h1>

        <p className="text-gray-500 mt-1">
          Receive and manage booking payments.
        </p>
      </div>

      <select
        value={filter}
        onChange={(e) =>
          onFilterChange(
            e.target.value as "month" | "year" | "all"
          )
        }
        className="border rounded-lg px-3 py-2"
      >
        <option value="month">This Month</option>
        <option value="year">This Year</option>
        <option value="all">All Time</option>
      </select>
    </div>
  );
}