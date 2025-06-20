import React, { useState, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { searchLocations, type Location } from '../utils/cities';
import { motion, AnimatePresence } from 'framer-motion';

type LocationAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (location: Location) => void;
  placeholder?: string;
  className?: string;
};

export default function LocationAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Enter location...',
  className = ''
}: LocationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSuggestions(searchLocations(newValue));
    setIsOpen(true);
  };

  const handleSelectLocation = (location: Location) => {
    onChange(location.name);
    onSelect(location);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto"
          >
            {suggestions.map((location, index) => (
              <button
                key={`${location.name}-${location.type}-${index}`}
                onClick={() => handleSelectLocation(location)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
              >
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{location.name}</div>
                    <div className="text-sm text-gray-500">
                      {location.type === 'municipality' 
                        ? `${location.city}, ${location.country}`
                        : location.country}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}