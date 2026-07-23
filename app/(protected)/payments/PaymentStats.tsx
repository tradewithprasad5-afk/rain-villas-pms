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
    <div className="grid grid-cols-4 gap-4 mb-6">

      <div className="bg-white rounded-xl shadow p-5">
        <p className="text-gray-500 text-sm">
          Total Revenue
        </p>

        <p className="text-2xl font-bold">
          ₹{totalRevenue.toLocaleString()}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <p className="text-gray-500 text-sm">
          Total Received
        </p>

        <p className="text-2xl font-bold text-green-600">
          ₹{totalReceived.toLocaleString()}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <p className="text-gray-500 text-sm">
          Outstanding
        </p>

        <p className="text-2xl font-bold text-red-600">
          ₹{totalOutstanding.toLocaleString()}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <p className="text-gray-500 text-sm">
          Total Bookings
        </p>

        <p className="text-2xl font-bold text-blue-600">
          {totalBookings}
        </p>
      </div>

    </div>
  );
}