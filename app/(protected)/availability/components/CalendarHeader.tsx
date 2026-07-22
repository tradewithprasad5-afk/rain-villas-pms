"use client";

import DayCell from "./DayCell";

interface Booking {
  id: string;
  customerName: string;
  villa: string;
  checkIn: string;
  checkOut: string;
  status: string;
}

interface CalendarGridProps {
  month: number;
  year: number;
  bookings: Booking[];
  onSelectDay?: (date: Date) => void;
}

const villas = [
  "Rain Paradise",
  "Rain Heaven",
];

const weekDays = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

export default function CalendarGrid({
  month,
  year,
  bookings,
  onSelectDay,
}: CalendarGridProps) {

  const firstDay =
    new Date(year, month, 1).getDay();

  const daysInMonth =
    new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  function isBooked(
    villa: string,
    day: number
  ) {
    const current = new Date(
      year,
      month,
      day
    );

    return bookings.find((booking) => {

      const checkIn =
        new Date(booking.checkIn);

      const checkOut =
        new Date(booking.checkOut);

      return (
        booking.villa === villa &&
        current >= checkIn &&
        current < checkOut &&
        booking.status !== "Cancelled"
      );

    });
  }

  return (

    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">

      {/* Week Header */}

      <div className="grid grid-cols-7 bg-slate-100">

        {weekDays.map((day) => (

          <div
            key={day}
            className="py-4 text-center font-semibold text-slate-600"
          >
            {day}
          </div>

        ))}

      </div>

      {/* Calendar */}

      <div className="grid grid-cols-7">

        {cells.map((day, index) => (

          <div
            key={index}
            className="border min-h-[140px]"
          >

            {day && (

              <DayCell
                day={day}
                paradise={isBooked(
                  "Rain Paradise",
                  day
                )}
                heaven={isBooked(
                  "Rain Heaven",
                  day
                )}
                onClick={() =>
                  onSelectDay?.(
                    new Date(
                      year,
                      month,
                      day
                    )
                  )
                }
              />

            )}

          </div>

        ))}

      </div>

    </div>

  );
}