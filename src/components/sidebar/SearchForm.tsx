import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, User, Stethoscope } from 'lucide-react';
import { Button, Input } from '../ui';
import type { Patient } from '../../types/patient';

interface SearchFormProps {
  onSearch: (searchTerm: string | Patient, specialization: string) => void;
  isLoading: boolean;
}

const specializations = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Orthopedics',
  'Endocrinology'
];

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('General Medicine');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    const handleResults = (e: CustomEvent) => {
      if (e.detail && e.detail.results) {
        setSuggestions(e.detail.results);
      }
    };
    window.addEventListener('DIGICARE_EXT_SEARCH_RESULTS', handleResults as EventListener);
    return () => window.removeEventListener('DIGICARE_EXT_SEARCH_RESULTS', handleResults as EventListener);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitSearch(phone);
  };

  const submitSearch = (searchTerm: string | Patient) => {
    setError('');

    if (typeof searchTerm === 'string') {
      const trimmedTerm = searchTerm.trim();
      if (!trimmedTerm) {
        setError('Please enter a Name, Phone or ID');
        return;
      }
      onSearch(trimmedTerm, specialization);
    } else {
      // It is a patient object
      onSearch(searchTerm, specialization);
    }

    setSuggestions([]);
  };

  const handleInputChange = (value: string) => {
    setPhone(value);
    setError('');

    // Dispatch query to CRM
    const event = new CustomEvent('DIGICARE_EXT_SEARCH_QUERY', {
      detail: { query: value }
    });
    window.dispatchEvent(event);

    // Clear suggestions if empty
    if (!value.trim()) {
      setSuggestions([]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-medical-500 to-medical-600 flex items-center justify-center shadow-lg">
          <Stethoscope className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Doctor Assistant</h2>
        <p className="text-sm text-gray-500 mt-1">
          Select specialization & find patient
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 relative">
        {/* Specialization Select */}
        <div className="relative">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
            Specialization
          </label>
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="w-full h-11 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-medical-500 focus:ring-2 focus:ring-medical-200 transition-all appearance-none cursor-pointer"
          >
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
          <div className="absolute right-3 top-[34px] pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="relative">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
            Patient Search
          </label>
          <Input
            placeholder="Search by Name, Phone, or ABHA ID"
            value={phone}
            onChange={(e) => handleInputChange(e.target.value)}
            error={error}
            leftIcon={<User className="w-5 h-5" />}
            className="text-base"
          />

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 max-h-60 overflow-y-auto"
              >
                {suggestions.map((patient) => (
                  <button
                    key={patient.id}
                    type="button"
                    className="w-full text-left px-4 py-3 hover:bg-medical-50 border-b border-gray-50 last:border-0 flex items-center gap-3 transition-colors"
                    onClick={() => {
                      setPhone(patient.name);
                      // Pass the FULL patient object up to bypass the "fetch by ID" logic which might fail
                      submitSearch(patient);
                    }}
                  >
                    <div className="w-8 h-8 rounded-full bg-medical-50 flex items-center justify-center flex-shrink-0 text-medical-600">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{patient.name}</p>
                      <p className="text-xs text-gray-500">{patient.phone} • {patient.abhaId}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full"
          size="lg"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          {isLoading ? 'Fetching details...' : 'Load Patient Data'}
        </Button>
      </form>
    </motion.div>
  );
}
