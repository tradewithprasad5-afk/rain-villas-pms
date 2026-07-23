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

  const firstDay = new Date(year, month, 1).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const cells: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(day);
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  function getBooking(
    villa: string,
    day: number
  ) {

    const current = `${year}-${String(
      month + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    return bookings.find((booking) =>

      booking.villa === villa &&
      booking.status !== "Cancelled" &&
      current >= booking.checkIn &&
      current < booking.checkOut

    );

  }

  
  
    return (
  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

      {/* Week Header */}

      <div className="grid grid-cols-7 bg-slate-100">

        {weekDays.map((day) => (

          <div
            key={day}
            className="border-b py-2 text-center text-xs font-semibold text-slate-600 sm:p-4 sm:text-base"
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
            className="min-h-[70px] border sm:min-h-[140px]"
          >

            {day && (

              <DayCell
                day={day}
                paradise={getBooking(
                  "Rain Paradise",
                  day
                )}
                heaven={getBooking(
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

      
      

            {/* Bottom Legend */}

      <div className="border-t bg-slate-50 p-5">

        <div className="flex flex-wrap gap-8">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 font-semibold text-green-700">
              RP
            </div>

            <div>
              <p className="font-medium">
                Rain Paradise
              </p>

              <p className="text-sm text-slate-500">
                Ground Floor
              </p>
            </div>

          </div>

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
              RH
            </div>

            <div>
              <p className="font-medium">
                Rain Heaven
              </p>

              <p className="text-sm text-slate-500">
                First Floor
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  
);
}