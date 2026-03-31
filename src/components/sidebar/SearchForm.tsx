import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, User, Stethoscope } from 'lucide-react';
import { Button, Input } from '../ui';
import { searchPatients, type PatientSuggestion } from '../../services/apiService';

interface SearchFormProps {
  onSearch: (patientId: string, specialization: string) => void;
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
  const [query, setQuery] = useState('');
  const [specialization, setSpecialization] = useState('General Medicine');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<PatientSuggestion[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search against the API on every keystroke
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSuggestions([]);
    setError('');

    if (!query.trim()) return;

    debounceRef.current = setTimeout(async () => {
      setIsFetching(true);
      try {
        const results = await searchPatients(query);
        setSuggestions(results);
        if (results.length === 0) setError('No patients found for that name or phone.');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed.');
      } finally {
        setIsFetching(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const submitSearch = (suggestion: PatientSuggestion) => {
    setError('');
    setSuggestions([]);
    setQuery(suggestion.name);
    onSearch(suggestion.patientId, specialization);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter a name or phone number.');
      return;
    }
    if (suggestions.length === 0) {
      setError('Please select a patient from the suggestions.');
      return;
    }
    // Auto-select the first suggestion on Enter / button click
    submitSearch(suggestions[0]);
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
          Select specialization &amp; find patient
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
            placeholder="Search by Name or Phone"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
                {suggestions.map((s) => (
                  <button
                    key={s.patientId}
                    type="button"
                    className="w-full text-left px-4 py-3 hover:bg-medical-50 border-b border-gray-50 last:border-0 flex items-center gap-3 transition-colors"
                    onClick={() => submitSearch(s)}
                  >
                    <div className="w-8 h-8 rounded-full bg-medical-50 flex items-center justify-center flex-shrink-0 text-medical-600">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.phone}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button
          type="submit"
          isLoading={isLoading || isFetching}
          className="w-full"
          size="lg"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          {isLoading ? 'Fetching details…' : 'Load Patient Data'}
        </Button>
      </form>
    </motion.div>
  );
}
