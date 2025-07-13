'use client';

import { useState, useRef, useEffect } from 'react';
import { format, parse, isValid, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek, addMonths, subMonths, isSameDay, setMonth, setYear, getYear } from 'date-fns';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

export default function DatePicker({
  value,
  onChange,
  className = '',
  placeholder = 'MM/DD/YYYY',
  required = false
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Parse date strings as local dates to avoid timezone issues
  const parseValueAsLocalDate = (val: string) => {
    if (!val) return new Date();
    // If it's a date-only string (yyyy-MM-dd), add local time
    if (val.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return new Date(val + 'T00:00:00');
    }
    return new Date(val);
  };
  const [currentMonth, setCurrentMonth] = useState(parseValueAsLocalDate(value));
  const [inputValue, setInputValue] = useState(value ? format(parseValueAsLocalDate(value), 'MM/dd/yyyy') : '');
  const [error, setError] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      setInputValue(format(parseValueAsLocalDate(value), 'MM/dd/yyyy'));
      setCurrentMonth(parseValueAsLocalDate(value));
    } else {
      setInputValue('');
    }
  }, [value]);

  const parseDate = (value: string): Date | null => {
    if (!value) return null;
    
    // Try different date formats
    const formats = ['MM/dd/yyyy', 'M/d/yyyy', 'MM-dd-yyyy', 'yyyy-MM-dd'];
    for (const fmt of formats) {
      const parsed = parse(value, fmt, new Date());
      if (isValid(parsed)) {
        return parsed;
      }
    }
    return null;
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setError('');
  };

  const handleInputBlur = () => {
    if (!inputValue && required) {
      setError('Date is required');
      return;
    }
    
    if (!inputValue) {
      onChange('');
      return;
    }
    
    const date = parseDate(inputValue);
    if (!date) {
      setError('Invalid date format');
      // Don't revert the value immediately, let user fix it
    } else {
      // Valid date, update the actual date
      onChange(format(date, 'yyyy-MM-dd'));
      setCurrentMonth(date);
      setInputValue(format(date, 'MM/dd/yyyy')); // Normalize format
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const handleDateClick = (date: Date) => {
    onChange(format(date, 'yyyy-MM-dd'));
    setInputValue(format(date, 'MM/dd/yyyy'));
    setIsOpen(false);
    setError('');
    setCurrentMonth(date);
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const selectedDate = value ? parseValueAsLocalDate(value) : null;

    return (
      <div className="grid grid-cols-7 gap-0.5">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <div key={day} className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center py-1">
            {day}
          </div>
        ))}
        {days.map((day, idx) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);
          
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleDateClick(day)}
              disabled={!isCurrentMonth}
              className={`
                relative py-1.5 text-xs rounded transition-all
                ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : ''}
                ${isCurrentMonth && !isSelected ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                ${isSelected ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium' : ''}
                ${isTodayDate && !isSelected ? 'font-bold text-blue-600 dark:text-blue-400' : ''}
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          className={`w-full px-3 py-2 pr-10 text-sm bg-white dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
            error 
              ? 'border-red-500 focus:ring-red-300' 
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:ring-gray-300 dark:focus:ring-gray-600'
          }`}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {isOpen && (
        <div className="absolute z-50 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
          {/* Month/Year Navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex items-center space-x-1">
              <select
                value={currentMonth.getMonth()}
                onChange={(e) => setCurrentMonth(setMonth(currentMonth, parseInt(e.target.value)))}
                className="text-sm font-medium bg-transparent focus:outline-none cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {format(new Date(2000, i, 1), 'MMM')}
                  </option>
                ))}
              </select>
              
              <select
                value={getYear(currentMonth)}
                onChange={(e) => setCurrentMonth(setYear(currentMonth, parseInt(e.target.value)))}
                className="text-sm font-medium bg-transparent focus:outline-none cursor-pointer"
              >
                {Array.from({ length: 50 }, (_, i) => {
                  const year = new Date().getFullYear() - 25 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
            
            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Calendar */}
          {renderCalendar()}

          {/* Today button */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                handleDateClick(today);
              }}
              className="w-full px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}