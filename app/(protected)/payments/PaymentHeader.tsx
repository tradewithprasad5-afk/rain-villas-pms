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
        <h1 className="text-xl sm:text-3xl font-bold">
          Payments
        </h1>

        <p className="mt-1 text-xs sm:text-base text-gray-500">
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
        className="w-full md:w-auto border rounded-lg px-3 py-2 text-sm sm:text-base"
      >
        <option value="month">This Month</option>
        <option value="year">This Year</option>
        <option value="all">All Time</option>
      </select>
    </div>
  );
}
