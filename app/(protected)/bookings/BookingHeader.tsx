interface BookingHeaderProps {
  onNewBooking: () => void;
}

export default function BookingHeader({
  onNewBooking,
}: BookingHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Bookings
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage customer bookings, payments and consent forms.
        </p>
      </div>

      <button
        onClick={onNewBooking}
        className="w-full rounded-xl bg-green-600 px-5 py-3 font-medium text-white transition hover:bg-green-700 sm:w-auto"
      >
        + New Booking
      </button>

    </div>
  );
}