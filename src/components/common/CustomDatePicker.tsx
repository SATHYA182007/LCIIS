import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minYear?: number;
  maxYear?: number;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date of birth',
  className = '',
  minYear = 1920,
  maxYear = new Date().getFullYear(),
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isYearView, setIsYearView] = useState(false);

  // Parse initial date or default to 1980-01-01
  const parsedDate = value ? new Date(value + 'T00:00:00') : new Date(1980, 0, 1);
  const validDate = isNaN(parsedDate.getTime()) ? new Date(1980, 0, 1) : parsedDate;

  const [currentMonth, setCurrentMonth] = useState<number>(validDate.getMonth());
  const [currentYear, setCurrentYear] = useState<number>(validDate.getFullYear());

  const containerRef = useRef<HTMLDivElement>(null);
  const activeYearRef = useRef<HTMLButtonElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsYearView(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll to active year when year view opens
  useEffect(() => {
    if (isYearView && activeYearRef.current) {
      activeYearRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [isYearView]);

  // Sync internal Month/Year if external value changes
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setCurrentMonth(d.getMonth());
        setCurrentYear(d.getFullYear());
      }
    }
  }, [value]);

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => Math.max(minYear, prev - 1));
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => Math.min(maxYear, prev + 1));
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const formatted = `${currentYear}-${monthStr}-${dayStr}`;
    onChange(formatted);
    setIsOpen(false);
    setIsYearView(false);
  };

  const formatDisplay = (val: string) => {
    if (!val) return '';
    const parts = val.split('-');
    if (parts.length !== 3) return val;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Interactive Trigger Input Box */}
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          setIsYearView(false);
        }}
        className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl font-medium cursor-pointer flex items-center justify-between hover:border-teal-400 focus:ring-2 focus:ring-teal-500 transition-all shadow-xs group"
      >
        <div className="flex items-center space-x-2.5">
          <CalendarIcon className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
          <span className={value ? 'text-slate-900 font-semibold' : 'text-gray-400'}>
            {value ? formatDisplay(value) : placeholder}
          </span>
        </div>
        <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
          Select Date
        </span>
      </div>

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 z-50 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 text-xs select-none animate-in fade-in zoom-in-95 duration-150">
          {/* Header Controls: Month Select & Year Button */}
          <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-1.5">
              {/* Month Dropdown */}
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-teal-500 focus:outline-hidden cursor-pointer"
              >
                {MONTHS.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>

              {/* Year Toggle Button */}
              <button
                type="button"
                onClick={() => setIsYearView(!isYearView)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all flex items-center space-x-1 ${
                  isYearView
                    ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                    : 'bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100'
                }`}
                title="Click to toggle scrollable years grid"
              >
                <span>{currentYear}</span>
                <span className="text-[10px] opacity-75">{isYearView ? '▲' : '▼'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Year View or Days View */}
          {isYearView ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 border-b border-gray-100 pb-1">
                <span>Select Birth Year</span>
                <span className="text-teal-700 font-mono">1920 – {maxYear}</span>
              </div>
              <div className="max-h-48 overflow-y-auto grid grid-cols-4 gap-1.5 p-1 bg-slate-50/50 rounded-xl border border-slate-100">
                {years.map((y) => {
                  const isSelected = currentYear === y;
                  return (
                    <button
                      type="button"
                      key={y}
                      ref={isSelected ? activeYearRef : undefined}
                      onClick={() => {
                        setCurrentYear(y);
                        setIsYearView(false);
                      }}
                      className={`py-1.5 rounded-lg font-bold text-xs transition-all ${
                        isSelected
                          ? 'bg-teal-700 text-white shadow-md shadow-teal-900/20'
                          : 'bg-white border border-slate-200 text-slate-800 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-900'
                      }`}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-gray-400 uppercase mb-1">
                {DAYS_OF_WEEK.map((d) => (
                  <div key={d} className="py-1">{d}</div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-8" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dayMonthStr = String(currentMonth + 1).padStart(2, '0');
                  const dayNumStr = String(dayNum).padStart(2, '0');
                  const dateStr = `${currentYear}-${dayMonthStr}-${dayNumStr}`;
                  const isSelected = value === dateStr;

                  return (
                    <button
                      type="button"
                      key={dayNum}
                      onClick={() => handleSelectDay(dayNum)}
                      className={`h-8 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center ${
                        isSelected
                          ? 'bg-teal-700 text-white shadow-md shadow-teal-900/20 scale-105'
                          : 'hover:bg-teal-50 text-slate-800 hover:text-teal-900'
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-2.5 mt-3">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const yr = today.getFullYear();
                const m = String(today.getMonth() + 1).padStart(2, '0');
                const d = String(today.getDate()).padStart(2, '0');
                const formattedToday = `${yr}-${m}-${d}`;
                onChange(formattedToday);
                setIsOpen(false);
                setIsYearView(false);
              }}
              className="text-[11px] font-bold text-teal-700 hover:text-teal-800 flex items-center space-x-1"
            >
              <Clock className="w-3 h-3" />
              <span>Today</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsYearView(false);
              }}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

