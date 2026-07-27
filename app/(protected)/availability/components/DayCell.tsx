"use client";

interface Props {
  day: number;
  month: number;
  year: number;
  paradise: any;
  heaven: any;
  onClick?: () => void;
}

export default function DayCell({
  day,
  month,
  year,
  paradise,
  heaven,
  onClick,
}: Props) {
  const today = new Date();

  const isToday =
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  return (
    <button
      onClick={onClick}
      className="h-full w-full p-1.5 sm:p-2 text-left transition hover:bg-slate-50"
    >
      {/* Day */}

      <div
        className={`mb-1 sm:mb-2 flex h-6 w-6 sm:h-9 sm:w-9 items-center justify-center rounded-full text-xs sm:text-lg font-bold ${
          isToday
            ? "bg-slate-900 text-white shadow-md"
            : "text-slate-800"
        }`}
      >
        {day}
      </div>

      {/* Mobile */}

      <div className="space-y-0.5 sm:hidden">
        {paradise && (
          <div className="rounded bg-green-600 px-1 py-0.5 text-center text-[9px] font-semibold text-white">
            RP
          </div>
        )}

        {heaven && (
          <div className="rounded bg-blue-600 px-1 py-0.5 text-center text-[9px] font-semibold text-white">
            RH
          </div>
        )}
      </div>

      {/* Desktop */}

      <div className="hidden space-y-1 sm:block">
        {paradise && (
          <div className="rounded bg-green-600 px-2 py-1 text-xs font-medium text-white">
            Rain Paradise
          </div>
        )}

        {heaven && (
          <div className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white">
            Rain Heaven
          </div>
        )}
      </div>
    </button>
  );
}
