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
    <div className="mb-5 sm:mb-6 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
      <div className="rounded-xl bg-white p-3 sm:p-5 shadow">
        <p className="text-[11px] sm:text-sm text-gray-500">
          Total Revenue
        </p>

        <p className="mt-1.5 sm:mt-2 break-words text-lg sm:text-2xl font-bold">
          ₹{totalRevenue.toLocaleString()}
        </p>
      </div>

      <div className="rounded-xl bg-white p-3 sm:p-5 shadow">
        <p className="text-[11px] sm:text-sm text-gray-500">
          Total Received
        </p>

        <p className="mt-1.5 sm:mt-2 break-words text-lg sm:text-2xl font-bold text-green-600">
          ₹{totalReceived.toLocaleString()}
        </p>
      </div>

      <div className="rounded-xl bg-white p-3 sm:p-5 shadow">
        <p className="text-[11px] sm:text-sm text-gray-500">
          Outstanding
        </p>

        <p className="mt-1.5 sm:mt-2 break-words text-lg sm:text-2xl font-bold text-red-600">
          ₹{totalOutstanding.toLocaleString()}
        </p>
      </div>

      <div className="rounded-xl bg-white p-3 sm:p-5 shadow">
        <p className="text-[11px] sm:text-sm text-gray-500">
          Total Bookings
        </p>

        <p className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-bold text-blue-600">
          {totalBookings}
        </p>
      </div>
    </div>
  );
}
