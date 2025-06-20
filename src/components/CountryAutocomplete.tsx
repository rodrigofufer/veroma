import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

interface CountryAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (country: string) => void;
  error?: string;
}

export default function CountryAutocomplete({ value, onChange, onSelect, error }: CountryAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [countries, setCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Function to normalize text (remove accents and special characters)
  const normalizeText = (text: string): string => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  };

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('/countries.json');
        const data = await response.json();
        setCountries(data);
      } catch (error) {
        console.error('Error loading countries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

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
    e.preventDefault(); // Prevent form submission
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue.trim() === '') {
      setSuggestions([]);
      return;
    }

    const normalizedInput = normalizeText(inputValue);
    
    const filtered = countries
      .filter(country => 
        normalizeText(country).includes(normalizedInput)
      )
      .slice(0, 7);

    setSuggestions(filtered);
    setIsOpen(true);
  };

  const handleSelectCountry = (e: React.MouseEvent, country: string) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event propagation
    onChange(country);
    onSelect(country);
    setIsOpen(false);
    setSuggestions([]);
  };

  const clearInput = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event propagation
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent form submission on Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const validateCountry = (value: string): boolean => {
    const normalizedValue = normalizeText(value);
    return countries.some(country => normalizeText(country) === normalizedValue);
  };

  if (loading) {
    return (
      <div className="relative">
        <input
          type="text"
          disabled
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          placeholder="Cargando países..."
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            // Validate on blur
            if (value && !validateCountry(value)) {
              onChange('');
            }
          }}
          placeholder="Buscar país..."
          className={`w-full px-4 py-2 pl-10 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300'
          }`}
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        {value && (
          <button
            type="button" // Explicitly set button type
            onClick={clearInput}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto"
          >
            {suggestions.map((country, index) => (
              <button
                key={country}
                type="button" // Explicitly set button type
                onClick={(e) => handleSelectCountry(e, country)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
              >
                {country}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && value && suggestions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 p-4 text-center text-gray-500"
        >
          No se encontraron países
        </motion.div>
      )}
    </div>
  );
}