import React, { useState, useMemo } from 'react';

interface AvailabilityCalendarProps {
    bookedRanges: { startDate: string; endDate: string }[];
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ bookedRanges }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const bookedDatesSet = useMemo(() => {
        const dates = new Set<string>();
        bookedRanges.forEach(({ startDate, endDate }) => {
            let current = new Date(startDate);
            // Adjust for timezone differences by working in UTC
            current.setUTCHours(0,0,0,0);
            const end = new Date(endDate);
            end.setUTCHours(0,0,0,0);

            while (current <= end) {
                dates.add(current.toISOString().split('T')[0]);
                current.setDate(current.getDate() + 1);
            }
        });
        return dates;
    }, [bookedRanges]);

    const daysInMonth = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const date = new Date(year, month, 1);
        const days = [];
        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }, [currentMonth]);

    const firstDayOfMonth = useMemo(() => {
        return new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    }, [currentMonth]);

    const changeMonth = (offset: number) => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };
    
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-stone-900/50 p-4 rounded-lg border border-stone-700">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-stone-700">&lt;</button>
                <h3 className="font-bold text-lg text-white">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-stone-700">&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {weekDays.map(day => (
                    <div key={day} className="font-semibold text-stone-400">{day}</div>
                ))}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`}></div>
                ))}
                {daysInMonth.map(day => {
                    const dayString = day.toISOString().split('T')[0];
                    const isBooked = bookedDatesSet.has(dayString);
                    const isToday = day.toDateString() === new Date().toDateString();
                    const isPast = day < new Date(new Date().setDate(new Date().getDate() - 1));

                    let cellClasses = 'p-2 rounded-full ';
                    if (isPast) {
                        cellClasses += 'text-stone-600 line-through';
                    } else if (isBooked) {
                        cellClasses += 'bg-red-500/50 text-stone-400 line-through';
                    } else {
                        cellClasses += 'text-stone-200 ';
                        if (isToday) {
                            cellClasses += 'bg-orange-500/50 font-bold';
                        }
                    }

                    return (
                        <div key={day.toString()} className={cellClasses}>
                            {day.getDate()}
                        </div>
                    );
                })}
            </div>
             <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-stone-400">
                <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <span>Booked</span>
                </div>
                 <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-orange-500/50"></div>
                    <span>Today</span>
                </div>
            </div>
        </div>
    );
};

export default AvailabilityCalendar;