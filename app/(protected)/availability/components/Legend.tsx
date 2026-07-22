"use client";

export default function Legend() {
  const items = [
    {
      color: "bg-green-500",
      text: "Available",
    },
    {
      color: "bg-red-500",
      text: "Booked",
    },
    {
      color: "bg-yellow-500",
      text: "Check In",
    },
    {
      color: "bg-purple-500",
      text: "Check Out",
    },
  ];

  return (
    <div className="flex flex-wrap gap-5">
      {items.map((item) => (
        <div
          key={item.text}
          className="flex items-center gap-2"
        >
          <div
            className={`w-4 h-4 rounded-full ${item.color}`}
          />
          <span className="text-sm text-slate-600">
            {item.text}
          </span>
        </div>
      ))}
    </div>
  );
}