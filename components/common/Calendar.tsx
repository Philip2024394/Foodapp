import React, { useState, useMemo } from 'react';

interface CalendarProps {
    startDate: Date | null;
    endDate: Date | null;
    onDateChange: (start: Date | null, end: Date | null) => void;
}

const Calendar: React.FC<CalendarProps> = ({ startDate, endDate, onDateChange }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

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

    const handleDateClick = (day: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (day < today) return; // Disable past dates

        if (!startDate || (startDate && endDate)) {
            onDateChange(day, null);
        } else if (startDate && !endDate) {
            if (day < startDate) {
                onDateChange(day, null);
            } else {
                onDateChange(startDate, day);
            }
        }
    };

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
                    const isSelectedStart = startDate && day.getTime() === startDate.getTime();
                    const isSelectedEnd = endDate && day.getTime() === endDate.getTime();
                    const isInRange = startDate && endDate && day > startDate && day < endDate;
                    const isToday = day.toDateString() === new Date().toDateString();
                    const isPast = day < new Date(new Date().setDate(new Date().getDate() - 1));

                    let cellClasses = 'p-2 rounded-full cursor-pointer transition-colors ';
                    if (isPast) {
                        cellClasses += 'text-stone-600 cursor-not-allowed';
                    } else {
                         cellClasses += 'hover:bg-orange-500/50 ';
                        if (isSelectedStart || isSelectedEnd) {
                            cellClasses += 'bg-orange-600 text-white font-bold ';
                        } else if (isInRange) {
                            cellClasses += 'bg-orange-500/30 ';
                        } else if (isToday) {
                            cellClasses += 'bg-stone-700 ';
                        }
                    }

                    return (
                        <div key={day.toString()} onClick={() => handleDateClick(day)} className={cellClasses}>
                            {day.getDate()}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Calendar;