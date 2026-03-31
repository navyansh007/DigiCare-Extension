export interface Patient {
  abhaId: string;
  abhaNumber: string;
  name: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  photo?: string;

  // Contact
  mobile: string;
  email?: string;
  address: Address;

  // Medical Info
  allergies: Allergy[];
  conditions: MedicalCondition[];
  medications: Medication[];
  vitals?: Vitals;

  // Insurance & Coverage
  insurance?: Insurance;

  // Recent visits
  recentVisits: Visit[];

  // Lab Reports
  labReports: LabReport[];

  // Emergency Contact
  emergencyContact?: EmergencyContact;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

export interface Allergy {
  id: string;
  name: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  type: 'Food' | 'Drug' | 'Environmental' | 'Other';
  reaction?: string;
  diagnosedDate?: string;
}

export interface MedicalCondition {
  id: string;
  name: string;
  icdCode?: string;
  status: 'Active' | 'Resolved' | 'Chronic';
  diagnosedDate: string;
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: 'Oral' | 'IV' | 'IM' | 'Topical' | 'Inhaled' | 'Other';
  prescribedDate: string;
  prescribedBy: string;
  status: 'Active' | 'Completed' | 'Discontinued';
  refillsRemaining?: number;
}

export interface Vitals {
  lastRecorded: string;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  heartRate: number;
  temperature: number;
  weight: number;
  height: number;
  bmi: number;
  oxygenSaturation: number;
  respiratoryRate: number;
}

export interface Insurance {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  validFrom: string;
  validTo: string;
  coverageType: string;
  status: 'Active' | 'Expired' | 'Pending';
}

export interface Visit {
  id: string;
  date: string;
  type: 'OPD' | 'IPD' | 'Emergency' | 'Telemedicine';
  doctor: string;
  department: string;
  diagnosis: string;
  prescription?: string;
  followUpDate?: string;
  notes?: string;
}

export interface LabReport {
  id: string;
  testName: string;
  testDate: string;
  resultDate: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
  results: LabResult[];
  orderedBy: string;
  lab: string;
  fileUrl?: string;
}

export interface LabResult {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'Normal' | 'Low' | 'High' | 'Critical';
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
}

export type SidebarTab = 'overview' | 'history' | 'medications' | 'reports' | 'vitals' | 'ai-chat';

export interface ABHASearchState {
  isLoading: boolean;
  error: string | null;
  patient: Patient | null;
}
