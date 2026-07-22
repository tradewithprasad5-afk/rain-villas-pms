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
      className="w-full h-full text-left p-3 hover:bg-slate-50 transition"
    >
      {/* Day Number */}
      <div className="font-bold text-lg mb-3">
        {day}
      </div>

      {/* Villa Status */}
      <div className="space-y-2">

        {/* Rain Paradise */}
        <div
          className={`w-full rounded-lg px-3 py-2 text-xs font-medium flex items-center gap-2
            ${
              paradise
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
        >
          <span className="text-sm">
            {paradise ? "🔴" : "🟢"}
          </span>

          <span className="truncate">
            Paradise
          </span>
        </div>

        {/* Rain Heaven */}
        <div
          className={`w-full rounded-lg px-3 py-2 text-xs font-medium flex items-center gap-2
            ${
              heaven
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
        >
          <span className="text-sm">
            {heaven ? "🔴" : "🟢"}
          </span>

          <span className="truncate">
            Heaven
          </span>
        </div>

      </div>
    </button>
  );
}