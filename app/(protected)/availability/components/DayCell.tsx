"use client";

interface Props {
  day: number;
  paradise: any;
  heaven: any;
  onClick?: () => void;
}

export default function DayCell({
  day,
  paradise,
  heaven,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className="h-full w-full p-2 text-left transition hover:bg-slate-50"
    >
      {/* Day */}

      <div className="mb-2 text-sm font-bold text-slate-800 sm:text-lg">
        {day}
      </div>

      {/* Mobile */}

      <div className="space-y-1 sm:hidden">
        {paradise && (
          <div className="rounded bg-green-600 px-2 py-1 text-center text-[10px] font-semibold text-white">
            RP
          </div>
        )}

        {heaven && (
          <div className="rounded bg-blue-600 px-2 py-1 text-center text-[10px] font-semibold text-white">
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