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
      className="h-full w-full p-2 text-left transition hover:bg-slate-50 sm:p-3"
    >
      {/* Day Number */}
      <div className="mb-2 text-base font-bold sm:mb-3 sm:text-lg">
        {day}
      </div>

      {/* Villa Status */}
      <div className="space-y-2">
        {/* Rain Paradise */}
        <div
          className={`flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium sm:px-3 ${
            paradise
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          <span>{paradise ? "🔴" : "🟢"}</span>
          <span className="truncate">Paradise</span>
        </div>

        {/* Rain Heaven */}
        <div
          className={`flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium sm:px-3 ${
            heaven
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          <span>{heaven ? "🔴" : "🟢"}</span>
          <span className="truncate">Heaven</span>
        </div>
      </div>
    </button>
  );
}