'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Filter } from 'lucide-react';

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function CustomDropdown({
  value,
  onChange,
  options,
  label,
  icon,
  className = '',
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      setTimeout(() => {
        const element = dropdownRef.current;
        if (element) {
          const rect = element.getBoundingClientRect();
          const dropdownHeight = 300; // Approximate dropdown menu height
          const viewportHeight = window.innerHeight;

          // Check if dropdown would be cut off at bottom
          if (rect.bottom + dropdownHeight > viewportHeight) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }
        }
      }, 50);
    }
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center justify-between gap-1
          w-full
          px-2 py-2
          bg-white dark:bg-gray-800
          border border-purple-200 dark:border-purple-700
          rounded-xl
          text-sm font-semibold text-gray-900 dark:text-gray-200
          shadow-sm
          hover:border-purple-300 dark:hover:border-purple-600
          hover:shadow
          focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500
          transition-all duration-200
          cursor-pointer
        "
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-purple-600 dark:text-purple-400">{icon}</span>}
          <span>{selectedOption?.label || 'Select...'}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-purple-600 dark:text-purple-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''
            }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full z-50">
          <div className="
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            rounded-xl
            shadow-lg
            py-1
            animate-in fade-in slide-in-from-top-2 duration-200
          ">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  block w-full text-left px-3 py-2
                  transition-colors duration-200
                  ${option.value === value
                    ? 'bg-purple-50 text-purple-600 font-semibold dark:bg-purple-900 dark:text-purple-300'
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-purple-400'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

