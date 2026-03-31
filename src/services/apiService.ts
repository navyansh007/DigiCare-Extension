import type {
  Patient,
  Allergy,
  MedicalCondition,
  Medication,
  Visit,
  LabReport,
  Address,
  EmergencyContact
} from '../types/patient';

// VDocs Backend — API Gateway base URL
export const BASE_URL = 'http://localhost:8080';

// ─── API response shapes ───────────────────────────────────────────────────

interface ApiClinicPatient {
  id: string;
  patientId: string;
  patientName: string;
  patientContactNo: string;
  clinic: { id: string; name: string };
}

interface ApiPatient {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  phoneNumber: string;
  email: string;
  address: string;
  medicalHistory: string;
  currentMedications: string;
  allergies: Array<{ allergen: string; reaction: string }>;
  emergencyContact: string;
}

interface ApiAppointment {
  id: string;
  patientId: string;
  patientName: string;
  clinic: { id: string; name: string };
  appointmentDate: string;
  status: string;
  medicalRequirement: string;
  remarks: string;
  patientReportUrl: string | null;
  clinicReportUrl: string | null;
  assignedDoctor: { id: string; name: string; specialization: string } | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiReport {
  id: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileUrl: string;
  uploadedAt: string;
  category: string;
  patient: { id: string };
}

// ─── Public shape for search suggestions ──────────────────────────────────

export interface PatientSuggestion {
  patientId: string;
  name: string;
  phone: string;
}

// ─── Core fetch helper ─────────────────────────────────────────────────────
// Proxied through the background service worker to bypass CORS restrictions.

function apiFetch<T>(path: string): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: 'API_FETCH', url: `${BASE_URL}${path}` },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (response?.success) {
          resolve(response.data as T);
        } else {
          const status = response?.status;
          if (status === 401 || status === 403) {
            reject(new Error('Not authenticated. Please log in to the clinic portal first.'));
          } else {
            reject(new Error(response?.error ?? 'API request failed'));
          }
        }
      }
    );
  });
}

// ─── Search ────────────────────────────────────────────────────────────────

/**
 * Fetches all patients for the authenticated clinic and filters them
 * client-side by the provided query (name or phone number).
 */
export async function searchPatients(query: string): Promise<PatientSuggestion[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const raw = await apiFetch<unknown>('/api/clinic/clinic-patients/patients');
  // Backend may return a plain array or a paginated wrapper ({ content: [...] })
  const all: ApiClinicPatient[] = Array.isArray(raw)
    ? (raw as ApiClinicPatient[])
    : Array.isArray((raw as any)?.content)
    ? ((raw as any).content as ApiClinicPatient[])
    : [];

  return all
    .filter(
      p =>
        p.patientName.toLowerCase().includes(trimmed) ||
        p.patientContactNo.includes(trimmed)
    )
    .map(p => ({
      patientId: p.patientId,
      name: p.patientName,
      phone: p.patientContactNo
    }))
    .slice(0, 10);
}

// ─── Data mappers ──────────────────────────────────────────────────────────

function mapAllergies(raw: Array<{ allergen: string; reaction: string }>): Allergy[] {
  return (raw || []).map((a, i) => ({
    id: String(i + 1),
    name: a.allergen,
    severity: 'Moderate' as const,
    type: 'Other' as const,
    reaction: a.reaction || undefined
  }));
}

function mapConditions(medicalHistory: string): MedicalCondition[] {
  if (!medicalHistory?.trim()) return [];

  // Split on common clinical list separators
  const entries = medicalHistory
    .split(/[,;]+/)
    .map(s => s.trim())
    .filter(Boolean);

  return entries.map((name, i) => ({
    id: String(i + 1),
    name,
    status: 'Active' as const,
    diagnosedDate: new Date().toISOString().split('T')[0]
  }));
}

function mapMedications(currentMedications: string): Medication[] {
  if (!currentMedications?.trim()) return [];

  const entries = currentMedications
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  return entries.map((entry, i) => {
    // Best-effort parse of "Name Dosage" (e.g. "Amlodipine 5mg")
    const spaceIdx = entry.indexOf(' ');
    const name = spaceIdx !== -1 ? entry.slice(0, spaceIdx) : entry;
    const dosage = spaceIdx !== -1 ? entry.slice(spaceIdx + 1) : '';

    return {
      id: String(i + 1),
      name,
      dosage,
      frequency: '',
      route: 'Oral' as const,
      prescribedDate: new Date().toISOString().split('T')[0],
      prescribedBy: '',
      status: 'Active' as const
    };
  });
}

function mapVisits(appointments: unknown): Visit[] {
  const arr: ApiAppointment[] = Array.isArray(appointments)
    ? (appointments as ApiAppointment[])
    : Array.isArray((appointments as any)?.content)
    ? ((appointments as any).content as ApiAppointment[])
    : [];
  return [...arr]
    .sort(
      (a, b) =>
        new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
    )
    .map((appt: ApiAppointment) => ({
      id: appt.id,
      date: appt.appointmentDate.split('T')[0],
      type: 'OPD' as const,
      doctor: appt.assignedDoctor?.name || 'Not assigned',
      department:
        appt.assignedDoctor?.specialization || appt.clinic?.name || '',
      diagnosis: appt.medicalRequirement || '',
      notes: appt.remarks || undefined
    }));
}

function mapLabReports(reports: unknown): LabReport[] {
  const arr: ApiReport[] = Array.isArray(reports)
    ? (reports as ApiReport[])
    : Array.isArray((reports as any)?.content)
    ? ((reports as any).content as ApiReport[])
    : [];
  return arr.map(r => ({
    id: r.id,
    testName: r.originalName || r.fileName,
    testDate: r.uploadedAt.split('T')[0],
    resultDate: r.uploadedAt.split('T')[0],
    status: 'Completed' as const,
    results: [],
    orderedBy: '',
    lab: r.category || 'Lab',
    fileUrl: r.fileUrl || undefined
  }));
}

// ─── Main fetch ────────────────────────────────────────────────────────────

/**
 * Fetches all data for a patient (profile, appointments, reports) in
 * parallel and assembles them into the extension's Patient interface.
 */
export async function fetchPatientById(patientId: string): Promise<Patient> {
  const [apiPatient, appointments, reports] = await Promise.all([
    apiFetch<ApiPatient>(`/api/patient/patients/${patientId}`),
    apiFetch<unknown>(`/api/clinic/appointments/patient/${patientId}`).catch(() => []),
    apiFetch<unknown>(`/api/patient/reports/patient/${patientId}`).catch(() => [])
  ]);

  const address: Address = {
    line1: apiPatient.address || '',
    city: '',
    district: '',
    state: '',
    pincode: ''
  };

  const emergencyContact: EmergencyContact | undefined = apiPatient.emergencyContact
    ? {
        name: 'Emergency Contact',
        relationship: 'Contact',
        phone: apiPatient.emergencyContact
      }
    : undefined;

  return {
    abhaId: apiPatient.id,
    abhaNumber: apiPatient.id,
    name: `${apiPatient.firstName} ${apiPatient.lastName}`,
    firstName: apiPatient.firstName,
    lastName: apiPatient.lastName,
    dateOfBirth: '',
    age: apiPatient.age,
    gender: (['Male', 'Female', 'Other'].includes(apiPatient.gender)
      ? apiPatient.gender
      : 'Other') as 'Male' | 'Female' | 'Other',
    mobile: apiPatient.phoneNumber,
    email: apiPatient.email,
    address,
    allergies: mapAllergies(apiPatient.allergies),
    conditions: mapConditions(apiPatient.medicalHistory),
    medications: mapMedications(apiPatient.currentMedications),
    recentVisits: mapVisits(appointments),
    labReports: mapLabReports(reports),
    emergencyContact
  };
}
