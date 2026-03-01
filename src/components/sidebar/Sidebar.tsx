import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  LayoutDashboard,
  History,
  Pill,
  FileText,
  Activity,
  RefreshCw,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import type { Patient, SidebarTab } from '../../types/patient';
import { fetchPatientByAbhaId } from '../../services/abhaService';
import { Tabs, Button, PatientCardSkeleton } from '../ui';
import { SearchForm } from './SearchForm';
import {
  PatientHeader,
  QuickOverview,
  VitalsCard,
  MedicationsCard,
  ConditionsCard,
  VisitsCard,
  LabReportsCard
} from '../patient';
import { AIChat } from './AIChat';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  autoLoadPatient?: any | null;
  onAutoLoadComplete?: () => void;
}

const tabConfig = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'vitals', label: 'Vitals', icon: <Activity className="w-4 h-4" /> },
  { id: 'medications', label: 'Meds', icon: <Pill className="w-4 h-4" /> },
  { id: 'ai-chat', label: 'Ask AI', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
  { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
];

export function Sidebar({ isOpen, onClose, autoLoadPatient, onAutoLoadComplete }: SidebarProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [width, setWidth] = useState(window.innerWidth * 0.5);
  const [isResizing, setIsResizing] = useState(false);
  const [activeTab, setActiveTab] = useState<SidebarTab>('overview');
  const [specialization, setSpecialization] = useState('General Medicine');

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing) {
        const newWidth = window.innerWidth - mouseMoveEvent.clientX;
        // Limit width to between 300px and 80% of screen width
        if (newWidth > 300 && newWidth < window.innerWidth * 0.8) {
          setWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  const handleSearch = useCallback(async (searchTerm: string | Patient, spec?: string) => {
    setIsLoading(true);
    setError(null);
    setPatient(null);
    if (spec) setSpecialization(spec);

    try {
      let data: Patient;
      if (typeof searchTerm === 'object') {
        // If the search form passed the full patient object (from suggestion)
        // We simulate a "network delay" just for effect, or use it directly
        // But we need to make sure it's fully populated.
        // The CRM "suggestions" might be lightweight.
        // Ideally, we treat it as the source of truth if it has key fields.
        data = searchTerm;
      } else {
        // Fallback to fetching by ID string
        data = await fetchPatientByAbhaId(searchTerm);
      }

      setPatient(data);
      setActiveTab('overview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch patient data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoadPatient) {
      setPatient(autoLoadPatient);
      onAutoLoadComplete?.();
    }
  }, [autoLoadPatient, onAutoLoadComplete]);

  const handleClear = () => {
    setPatient(null);
    setError(null);
    setActiveTab('overview');
  };

  const handleRefresh = () => {
    if (patient) {
      handleSearch(patient.abhaId);
    }
  };

  const renderTabContent = () => {
    if (!patient) return null;

    switch (activeTab) {
      case 'overview':
        return <QuickOverview patient={patient} specialization={specialization} />;
      case 'ai-chat':
        return <AIChat patient={patient} specialization={specialization} />;
      case 'vitals':
        return <VitalsCard vitals={patient.vitals} />;
      case 'medications':
        return <MedicationsCard medications={patient.medications} />;
      case 'history':
        return (
          <div className="space-y-0">
            <ConditionsCard conditions={patient.conditions} allergies={patient.allergies} />
            <VisitsCard visits={patient.recentVisits} />
          </div>
        );
      case 'reports':
        return <LabReportsCard reports={patient.labReports} />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          style={{ width: width }}
          className="digicare-sidebar open"
        >
          {/* Resize Handle */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-medical-400 active:bg-medical-600 transition-colors z-50 flex items-center justify-center group"
            onMouseDown={startResizing}
          >
            <div className="h-8 w-1 bg-gray-300 rounded-full group-hover:bg-medical-500 transition-colors" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
            <div className="flex items-center gap-2">
              {patient && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="p-1.5"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              )}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-medical-500 to-medical-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
                <div>
                  <h1 className="font-semibold text-gray-800 text-sm">DigiCare</h1>
                  <p className="text-xs text-gray-500">ABHA Patient Assistant</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {patient && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="p-1.5"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-1.5"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {isLoading ? (
              <div className="p-4">
                <PatientCardSkeleton />
                <div className="mt-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <X className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Error</h3>
                <p className="text-sm text-gray-600 mb-4">{error}</p>
                <Button variant="secondary" onClick={handleClear}>
                  Try Again
                </Button>
              </div>
            ) : patient ? (
              <>
                <PatientHeader patient={patient} />
                <Tabs
                  tabs={tabConfig}
                  activeTab={activeTab}
                  onChange={(id) => setActiveTab(id as SidebarTab)}
                />
                <div className="flex-1 overflow-y-auto digicare-scrollbar bg-gray-50">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                    >
                      {renderTabContent()}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <SearchForm onSearch={handleSearch} isLoading={isLoading} />
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Powered by ABHA Health Information Exchange
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
