interface BookingHeaderProps {
  onNewBooking: () => void;
  onExport: () => void;
}

export default function BookingHeader({
  onNewBooking,
  onExport,
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

      <div className="flex w-full gap-3 sm:w-auto">
        <button
          onClick={onExport}
          className="w-full rounded-xl border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-100 sm:w-auto"
        >
          Export CSV
        </button>

        <button
          onClick={onNewBooking}
          className="w-full rounded-xl bg-green-600 px-5 py-3 font-medium text-white transition hover:bg-green-700 sm:w-auto"
        >
          + New Booking
        </button>
      </div>
    </div>
  );
}