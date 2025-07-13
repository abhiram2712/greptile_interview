'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  format, parse, isValid, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameMonth, isToday, isBefore, isAfter, subDays, startOfWeek, 
  endOfWeek, addMonths, subMonths, isSameDay, setMonth, setYear, getYear 
} from 'date-fns';
import { formatDateString, parseLocalDate } from '@/lib/date-utils';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  className?: string;
}

const presets = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className = ''
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingEndDate, setSelectingEndDate] = useState(false);
  
  const [startInputValue, setStartInputValue] = useState(format(parseLocalDate(startDate), 'MM/dd/yyyy'));
  const [endInputValue, setEndInputValue] = useState(format(parseLocalDate(endDate), 'MM/dd/yyyy'));
  const [startError, setStartError] = useState('');
  const [endError, setEndError] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

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
    setStartInputValue(format(parseLocalDate(startDate), 'MM/dd/yyyy'));
    setEndInputValue(format(parseLocalDate(endDate), 'MM/dd/yyyy'));
  }, [startDate, endDate]);

  const parseDate = (value: string): Date | null => {
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

  const handleStartInputChange = (value: string) => {
    setStartInputValue(value);
    setStartError('');
  };

  const handleEndInputChange = (value: string) => {
    setEndInputValue(value);
    setEndError('');
  };

  const handleStartInputBlur = () => {
    if (!startInputValue.trim()) {
      // If empty, keep it empty
      return;
    }
    
    const date = parseDate(startInputValue);
    if (!date) {
      setStartError('Invalid date format');
      // Don't revert the value immediately, let user fix it
    } else {
      // Valid date, update the actual date
      onStartDateChange(formatDateString(date));
      setCurrentMonth(date);
      setStartInputValue(format(date, 'MM/dd/yyyy')); // Normalize format
      
      // Check if it's after end date
      const end = parseLocalDate(endDate);
      if (isAfter(date, end)) {
        setStartError('Start date must be before end date');
      }
    }
  };

  const handleEndInputBlur = () => {
    if (!endInputValue.trim()) {
      // If empty, keep it empty
      return;
    }
    
    const date = parseDate(endInputValue);
    if (!date) {
      setEndError('Invalid date format');
      // Don't revert the value immediately, let user fix it
    } else {
      // Valid date, update the actual date
      onEndDateChange(formatDateString(date));
      setEndInputValue(format(date, 'MM/dd/yyyy')); // Normalize format
      
      // Check if it's before start date
      const start = parseLocalDate(startDate);
      if (isBefore(date, start)) {
        setEndError('End date must be after start date');
      }
    }
  };

  const handleStartKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const handleEndKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const handlePreset = (days: number) => {
    const end = new Date();
    const start = subDays(end, days);
    onStartDateChange(formatDateString(start));
    onEndDateChange(formatDateString(end));
    setStartInputValue(format(start, 'MM/dd/yyyy'));
    setEndInputValue(format(end, 'MM/dd/yyyy'));
    setStartError('');
    setEndError('');
    setIsOpen(false);
  };

  const handleDateClick = (date: Date) => {
    const dateStr = formatDateString(date);
    const formattedDate = format(date, 'MM/dd/yyyy');
    
    if (!selectingEndDate) {
      onStartDateChange(dateStr);
      setStartInputValue(formattedDate);
      setStartError('');
      setSelectingEndDate(true);
    } else {
      const start = parseLocalDate(startDate);
      if (isBefore(date, start)) {
        // If end date is before start, swap them
        onStartDateChange(dateStr);
        onEndDateChange(startDate);
        setStartInputValue(formattedDate);
        setEndInputValue(format(parseLocalDate(startDate), 'MM/dd/yyyy'));
      } else {
        onEndDateChange(dateStr);
        setEndInputValue(formattedDate);
      }
      setEndError('');
      setSelectingEndDate(false);
      setIsOpen(false);
    }
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const start = parseLocalDate(startDate);
    const end = parseLocalDate(endDate);

    return (
      <div className="grid grid-cols-7 gap-0.5">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <div key={day} className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center py-1">
            {day}
          </div>
        ))}
        {days.map((day, idx) => {
          const isSelected = isSameDay(day, start) || isSameDay(day, end);
          const isInRange = isAfter(day, start) && isBefore(day, end);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);
          
          return (
            <button
              key={idx}
              onClick={() => handleDateClick(day)}
              disabled={!isCurrentMonth}
              className={`
                relative py-1.5 text-xs rounded transition-all
                ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : ''}
                ${isCurrentMonth && !isSelected && !isInRange ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                ${isSelected ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium' : ''}
                ${isInRange ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : ''}
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
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <input
            type="text"
            value={startInputValue}
            onChange={(e) => handleStartInputChange(e.target.value)}
            onBlur={handleStartInputBlur}
            onKeyDown={handleStartKeyDown}
            placeholder="MM/DD/YYYY"
            className={`w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              startError 
                ? 'border-red-500 focus:ring-red-300' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:ring-gray-300 dark:focus:ring-gray-600'
            }`}
          />
          {startError && <p className="text-xs text-red-500 mt-1">{startError}</p>}
        </div>
        
        <span className="text-gray-500 dark:text-gray-400">to</span>
        
        <div className="flex-1">
          <input
            type="text"
            value={endInputValue}
            onChange={(e) => handleEndInputChange(e.target.value)}
            onBlur={handleEndInputBlur}
            onKeyDown={handleEndKeyDown}
            placeholder="MM/DD/YYYY"
            className={`w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              endError 
                ? 'border-red-500 focus:ring-red-300' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:ring-gray-300 dark:focus:ring-gray-600'
            }`}
          />
          {endError && <p className="text-xs text-red-500 mt-1">{endError}</p>}
        </div>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Open calendar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 right-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          {/* Presets */}
          <div className="flex flex-wrap gap-1 mb-4">
            {presets.map(preset => (
              <button
                key={preset.label}
                onClick={() => handlePreset(preset.days)}
                className="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Month/Year Navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
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
                    {format(new Date(2000, i, 1), 'MMMM')}
                  </option>
                ))}
              </select>
              
              <select
                value={getYear(currentMonth)}
                onChange={(e) => setCurrentMonth(setYear(currentMonth, parseInt(e.target.value)))}
                className="text-sm font-medium bg-transparent focus:outline-none cursor-pointer"
              >
                {Array.from({ length: 20 }, (_, i) => {
                  const year = new Date().getFullYear() - 10 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
            
            <button
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

          {/* Helper text */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {selectingEndDate ? 'Select end date' : 'Select start date'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}