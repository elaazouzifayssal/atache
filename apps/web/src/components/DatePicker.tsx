'use client';

import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import 'react-day-picker/style.css';

interface DatePickerProps {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  minDate?: Date;
  placeholder?: string;
}

export default function DatePicker({
  selected,
  onSelect,
  minDate = addDays(new Date(), 1),
  placeholder = 'Sélectionner une date',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (date: Date | undefined) => {
    onSelect(date);
    setIsOpen(false);
  };

  const isDateDisabled = (date: Date) => {
    return isBefore(startOfDay(date), startOfDay(minDate));
  };

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input w-full text-left flex items-center justify-between"
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
          {selected
            ? format(selected, 'EEEE d MMMM yyyy', { locale: fr })
            : placeholder}
        </span>
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      {/* Calendar dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Calendar */}
          <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={handleSelect}
              disabled={isDateDisabled}
              locale={fr}
              showOutsideDays
              fixedWeeks
              classNames={{
                root: 'rdp-custom',
                months: 'flex flex-col',
                month: 'space-y-4',
                caption: 'flex justify-center pt-1 relative items-center',
                caption_label: 'text-sm font-medium text-gray-900',
                nav: 'space-x-1 flex items-center',
                nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md hover:bg-gray-100',
                nav_button_previous: 'absolute left-1',
                nav_button_next: 'absolute right-1',
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex',
                head_cell: 'text-gray-500 rounded-md w-9 font-normal text-[0.8rem]',
                row: 'flex w-full mt-2',
                cell: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
                day: 'h-9 w-9 p-0 font-normal rounded-full hover:bg-gray-100 inline-flex items-center justify-center',
                day_selected: 'bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white',
                day_today: 'bg-gray-100 text-gray-900',
                day_outside: 'text-gray-300',
                day_disabled: 'text-gray-300 opacity-50 cursor-not-allowed hover:bg-transparent',
                day_hidden: 'invisible',
              }}
              components={{
                Chevron: ({ orientation }) => (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {orientation === 'left' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    )}
                  </svg>
                ),
              }}
            />

            {/* Quick select buttons */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSelect(addDays(new Date(), 1))}
                className="px-3 py-1.5 text-xs rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Demain
              </button>
              <button
                type="button"
                onClick={() => handleSelect(addDays(new Date(), 2))}
                className="px-3 py-1.5 text-xs rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Après-demain
              </button>
              <button
                type="button"
                onClick={() => handleSelect(addDays(new Date(), 7))}
                className="px-3 py-1.5 text-xs rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Dans 1 semaine
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
