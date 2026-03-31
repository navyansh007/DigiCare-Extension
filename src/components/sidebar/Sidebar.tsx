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
  Sparkles,
  LogOut
} from 'lucide-react';
import type { Patient, SidebarTab } from '../../types/patient';
import { fetchPatientById } from '../../services/apiService';
import {
  getAuthState,
  clinicLogout,
  type ClinicProfile
} from '../../services/authService';
import { Tabs, Button, PatientCardSkeleton } from '../ui';
import { SearchForm } from './SearchForm';
import { LoginView } from '../auth/LoginView';
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
  autoLoadPatientId?: string | null;
  onAutoLoadComplete?: () => void;
}

const tabConfig = [
  { id: 'overview',     label: 'Overview',  icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'vitals',       label: 'Vitals',    icon: <Activity className="w-4 h-4" /> },
  { id: 'medications',  label: 'Meds',      icon: <Pill className="w-4 h-4" /> },
  { id: 'ai-chat',      label: 'Ask AI',    icon: <Sparkles className="w-4 h-4" /> },
  { id: 'history',      label: 'History',   icon: <History className="w-4 h-4" /> },
  { id: 'reports',      label: 'Reports',   icon: <FileText className="w-4 h-4" /> },
];

export function Sidebar({ isOpen, onClose, autoLoadPatientId, onAutoLoadComplete }: SidebarProps) {
  // ── Auth state ────────────────────────────────────────────────────────────
  // null = still loading from storage
  const [clinicProfile, setClinicProfile] = useState<ClinicProfile | null | undefined>(undefined);

  // ── Patient state ─────────────────────────────────────────────────────────
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SidebarTab>('overview');
  const [specialization, setSpecialization] = useState('General Medicine');

  // ── Sidebar resize ────────────────────────────────────────────────────────
  const [width, setWidth] = useState(window.innerWidth * 0.5);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback(() => setIsResizing(true), []);
  const stopResizing  = useCallback(() => setIsResizing(false), []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 300 && newWidth < window.innerWidth * 0.8) setWidth(newWidth);
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

  // ── Load auth state from storage on mount ─────────────────────────────────
  useEffect(() => {
    getAuthState().then(({ isLoggedIn, clinicProfile: profile }) => {
      setClinicProfile(isLoggedIn && profile ? profile : null);
    });
  }, []);

  // ── Patient loading ───────────────────────────────────────────────────────
  const loadPatient = useCallback(async (patientId: string, spec?: string) => {
    setIsLoading(true);
    setError(null);
    setPatient(null);
    if (spec) setSpecialization(spec);

    try {
      const data = await fetchPatientById(patientId);
      setPatient(data);
      setCurrentPatientId(patientId);
      setActiveTab('overview');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch patient data.';
      // If the API returns 401, the session expired — force re-login
      if (msg.includes('Not authenticated')) {
        setClinicProfile(null);
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = useCallback(
    (patientId: string, spec?: string) => loadPatient(patientId, spec),
    [loadPatient]
  );

  useEffect(() => {
    if (autoLoadPatientId) {
      loadPatient(autoLoadPatientId);
      onAutoLoadComplete?.();
    }
  }, [autoLoadPatientId, loadPatient, onAutoLoadComplete]);

  const handleClear = () => {
    setPatient(null);
    setError(null);
    setCurrentPatientId(null);
    setActiveTab('overview');
  };

  const handleRefresh = () => {
    if (currentPatientId) loadPatient(currentPatientId);
  };

  const handleLogout = async () => {
    await clinicLogout();
    setClinicProfile(null);
    handleClear();
  };

  // ── Tab content ───────────────────────────────────────────────────────────
  const renderTabContent = () => {
    if (!patient) return null;

    switch (activeTab) {
      case 'overview':
        return <QuickOverview patient={patient} specialization={specialization} patientId={currentPatientId!} />;
      case 'ai-chat':
        return <AIChat patient={patient} specialization={specialization} patientId={currentPatientId!} />;
      case 'vitals':
        return patient.vitals ? (
          <VitalsCard vitals={patient.vitals} />
        ) : (
          <div className="p-6 text-center text-sm text-gray-500">
            No vitals recorded for this patient.
          </div>
        );
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
        return <LabReportsCard reports={patient.labReports} patientId={currentPatientId!} />;
      default:
        return null;
    }
  };

  // ── Decide what to show in the body ───────────────────────────────────────
  const renderBody = () => {
    // Still reading storage
    if (clinicProfile === undefined) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-medical-500 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    // Not logged in → show login view
    if (clinicProfile === null) {
      return (
        <div className="flex-1 overflow-y-auto digicare-scrollbar">
          <LoginView onLoginSuccess={(profile) => setClinicProfile(profile)} />
        </div>
      );
    }

    // Logged in — normal patient flow
    if (isLoading) {
      return (
        <div className="p-4">
          <PatientCardSkeleton />
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Error</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <Button variant="secondary" onClick={handleClear}>Try Again</Button>
        </div>
      );
    }

    if (patient) {
      return (
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
      );
    }

    return <SearchForm onSearch={handleSearch} isLoading={isLoading} />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          style={{ width }}
          className="digicare-sidebar open"
        >
          {/* Resize handle */}
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
                <Button variant="ghost" size="sm" onClick={handleClear} className="p-1.5">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              )}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-medical-500 to-medical-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
                <div>
                  <h1 className="font-semibold text-gray-800 text-sm">DigiCare</h1>
                  {clinicProfile ? (
                    <p className="text-xs text-gray-500 truncate max-w-[120px]">{clinicProfile.name}</p>
                  ) : (
                    <p className="text-xs text-gray-500">ABHA Patient Assistant</p>
                  )}
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
              {clinicProfile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="p-1.5 text-gray-400 hover:text-red-500"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose} className="p-1.5">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {renderBody()}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">Powered by VDocs + DigiCare AI Pipeline</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
