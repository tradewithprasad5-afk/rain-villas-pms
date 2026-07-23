interface PaymentStatsProps {
  totalRevenue: number;
  totalReceived: number;
  totalOutstanding: number;
  totalBookings: number;
}

export default function PaymentStats({
  totalRevenue,
  totalReceived,
  totalOutstanding,
  totalBookings,
}: PaymentStatsProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div className="rounded-xl bg-white p-4 shadow sm:p-5">
        <p className="text-xs text-gray-500 sm:text-sm">
          Total Revenue
        </p>

        <p className="mt-2 break-words text-xl font-bold sm:text-2xl">
          ₹{totalRevenue.toLocaleString()}
        </p>
      </div>

      <div className="rounded-xl bg-white p-4 shadow sm:p-5">
        <p className="text-xs text-gray-500 sm:text-sm">
          Total Received
        </p>

        <p className="mt-2 break-words text-xl font-bold text-green-600 sm:text-2xl">
          ₹{totalReceived.toLocaleString()}
        </p>
      </div>

      <div className="rounded-xl bg-white p-4 shadow sm:p-5">
        <p className="text-xs text-gray-500 sm:text-sm">
          Outstanding
        </p>

        <p className="mt-2 break-words text-xl font-bold text-red-600 sm:text-2xl">
          ₹{totalOutstanding.toLocaleString()}
        </p>
      </div>

      <div className="rounded-xl bg-white p-4 shadow sm:p-5">
        <p className="text-xs text-gray-500 sm:text-sm">
          Total Bookings
        </p>

        <p className="mt-2 text-xl font-bold text-blue-600 sm:text-2xl">
          {totalBookings}
        </p>
      </div>
    </div>
  );
}