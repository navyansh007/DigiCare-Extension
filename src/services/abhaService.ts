import type { Patient, Allergy, MedicalCondition, Medication, Visit, LabReport } from '../types/patient';

// Mock data generator for development
// In production, replace with actual ABHA API calls

const mockAllergies: Allergy[] = [
  {
    id: '1',
    name: 'Penicillin',
    severity: 'Severe',
    type: 'Drug',
    reaction: 'Anaphylaxis',
    diagnosedDate: '2019-03-15'
  },
  {
    id: '2',
    name: 'Peanuts',
    severity: 'Moderate',
    type: 'Food',
    reaction: 'Hives, swelling',
    diagnosedDate: '2015-08-20'
  },
  {
    id: '3',
    name: 'Dust Mites',
    severity: 'Mild',
    type: 'Environmental',
    reaction: 'Sneezing, runny nose',
    diagnosedDate: '2020-01-10'
  }
];

const mockConditions: MedicalCondition[] = [
  {
    id: '1',
    name: 'Type 2 Diabetes Mellitus',
    icdCode: 'E11',
    status: 'Chronic',
    diagnosedDate: '2018-06-15',
    notes: 'Well controlled with medication'
  },
  {
    id: '2',
    name: 'Essential Hypertension',
    icdCode: 'I10',
    status: 'Active',
    diagnosedDate: '2019-02-20',
    notes: 'On combination therapy'
  },
  {
    id: '3',
    name: 'Acute Bronchitis',
    icdCode: 'J20',
    status: 'Resolved',
    diagnosedDate: '2024-01-05',
    notes: 'Resolved after antibiotic course'
  }
];

const mockMedications: Medication[] = [
  {
    id: '1',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    route: 'Oral',
    prescribedDate: '2024-01-15',
    prescribedBy: 'Dr. Sharma',
    status: 'Active',
    refillsRemaining: 3
  },
  {
    id: '2',
    name: 'Amlodipine',
    dosage: '5mg',
    frequency: 'Once daily',
    route: 'Oral',
    prescribedDate: '2024-01-15',
    prescribedBy: 'Dr. Sharma',
    status: 'Active',
    refillsRemaining: 2
  },
  {
    id: '3',
    name: 'Atorvastatin',
    dosage: '10mg',
    frequency: 'Once daily at night',
    route: 'Oral',
    prescribedDate: '2023-11-20',
    prescribedBy: 'Dr. Patel',
    status: 'Active',
    refillsRemaining: 5
  },
  {
    id: '4',
    name: 'Azithromycin',
    dosage: '500mg',
    frequency: 'Once daily for 3 days',
    route: 'Oral',
    prescribedDate: '2024-01-05',
    prescribedBy: 'Dr. Kumar',
    status: 'Completed'
  }
];

const mockVisits: Visit[] = [
  {
    id: '1',
    date: '2024-01-15',
    type: 'OPD',
    doctor: 'Dr. Ananya Sharma',
    department: 'Internal Medicine',
    diagnosis: 'Routine follow-up for Diabetes & Hypertension',
    prescription: 'Continue current medications',
    followUpDate: '2024-04-15',
    notes: 'HbA1c improved to 6.8%. BP well controlled.'
  },
  {
    id: '2',
    date: '2024-01-05',
    type: 'OPD',
    doctor: 'Dr. Rajesh Kumar',
    department: 'Pulmonology',
    diagnosis: 'Acute Bronchitis',
    prescription: 'Azithromycin 500mg x 3 days, Salbutamol inhaler PRN',
    notes: 'Chest X-ray clear. Advised steam inhalation.'
  },
  {
    id: '3',
    date: '2023-11-20',
    type: 'OPD',
    doctor: 'Dr. Priya Patel',
    department: 'Cardiology',
    diagnosis: 'Annual cardiac evaluation',
    prescription: 'Started on Atorvastatin 10mg',
    followUpDate: '2024-05-20',
    notes: 'ECG normal. Echo shows normal EF. LDL elevated - started statin therapy.'
  },
  {
    id: '4',
    date: '2023-08-10',
    type: 'Emergency',
    doctor: 'Dr. Vikram Singh',
    department: 'Emergency Medicine',
    diagnosis: 'Hypoglycemic episode',
    notes: 'Blood sugar 52 mg/dL on arrival. Treated with IV dextrose. Discharged after observation.'
  }
];

const mockLabReports: LabReport[] = [
  {
    id: '1',
    testName: 'Complete Blood Count (CBC)',
    testDate: '2024-01-14',
    resultDate: '2024-01-15',
    status: 'Completed',
    orderedBy: 'Dr. Sharma',
    lab: 'City Diagnostics',
    results: [
      { parameter: 'Hemoglobin', value: '14.2', unit: 'g/dL', referenceRange: '13.5-17.5', status: 'Normal' },
      { parameter: 'WBC Count', value: '7,500', unit: '/mcL', referenceRange: '4,500-11,000', status: 'Normal' },
      { parameter: 'Platelet Count', value: '250,000', unit: '/mcL', referenceRange: '150,000-400,000', status: 'Normal' },
      { parameter: 'RBC Count', value: '5.1', unit: 'million/mcL', referenceRange: '4.5-5.5', status: 'Normal' }
    ]
  },
  {
    id: '2',
    testName: 'Lipid Profile',
    testDate: '2024-01-14',
    resultDate: '2024-01-15',
    status: 'Completed',
    orderedBy: 'Dr. Sharma',
    lab: 'City Diagnostics',
    results: [
      { parameter: 'Total Cholesterol', value: '195', unit: 'mg/dL', referenceRange: '<200', status: 'Normal' },
      { parameter: 'LDL Cholesterol', value: '118', unit: 'mg/dL', referenceRange: '<100', status: 'High' },
      { parameter: 'HDL Cholesterol', value: '52', unit: 'mg/dL', referenceRange: '>40', status: 'Normal' },
      { parameter: 'Triglycerides', value: '142', unit: 'mg/dL', referenceRange: '<150', status: 'Normal' }
    ]
  },
  {
    id: '3',
    testName: 'HbA1c',
    testDate: '2024-01-14',
    resultDate: '2024-01-15',
    status: 'Completed',
    orderedBy: 'Dr. Sharma',
    lab: 'City Diagnostics',
    results: [
      { parameter: 'HbA1c', value: '6.8', unit: '%', referenceRange: '<7.0', status: 'Normal' }
    ]
  },
  {
    id: '4',
    testName: 'Kidney Function Test',
    testDate: '2024-01-14',
    resultDate: '2024-01-15',
    status: 'Completed',
    orderedBy: 'Dr. Sharma',
    lab: 'City Diagnostics',
    results: [
      { parameter: 'Creatinine', value: '1.0', unit: 'mg/dL', referenceRange: '0.7-1.3', status: 'Normal' },
      { parameter: 'BUN', value: '18', unit: 'mg/dL', referenceRange: '7-20', status: 'Normal' },
      { parameter: 'eGFR', value: '92', unit: 'mL/min/1.73m2', referenceRange: '>90', status: 'Normal' }
    ]
  }
];

function generateRandomAbhaNumber(): string {
  const part1 = Math.floor(10 + Math.random() * 90);
  const part2 = Math.floor(1000 + Math.random() * 9000);
  const part3 = Math.floor(1000 + Math.random() * 9000);
  const part4 = Math.floor(1000 + Math.random() * 9000);
  return `${part1}-${part2}-${part3}-${part4}`;
}

function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export async function fetchPatientByAbhaId(abhaId: string): Promise<Patient> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Determine if this is a "valid" demo ID or just random input
  // Since we want "Strict" loading, we only return the mock patient if there's a specific match
  // or if the frontend explicitly asks for it via a known ID.
  // For the prompt's request: "don't show about the default Rajesh Kumar Verma"

  // We throw an error for everything unless it matches specific demo IDs we might use for testing.
  // The '91-1234-5678-9012' is the button in the UI.

  if (abhaId !== '91-1234-5678-9012' && abhaId !== '9876543210') {
    throw new Error('Patient not found. Please select a patient from the search suggestions.');
  }

  // Generate mock patient data (Rajesh) ONLY if the specific demo ID is used
  const dob = '1975-08-15';
  const mockPatient: Patient = {
    abhaId: abhaId,
    abhaNumber: generateRandomAbhaNumber(),
    name: 'Rajesh Kumar Verma',
    firstName: 'Rajesh',
    middleName: 'Kumar',
    lastName: 'Verma',
    dateOfBirth: dob,
    age: calculateAge(dob),
    gender: 'Male',
    bloodGroup: 'B+',
    photo: undefined,

    mobile: '+91 98765 43210',
    email: 'rajesh.verma@email.com',
    address: {
      line1: '42, Sunrise Apartments',
      line2: 'MG Road, Sector 15',
      city: 'Gurugram',
      district: 'Gurugram',
      state: 'Haryana',
      pincode: '122001'
    },

    allergies: mockAllergies,
    conditions: mockConditions,
    medications: mockMedications,
    vitals: {
      lastRecorded: '2024-01-15T10:30:00',
      bloodPressure: { systolic: 128, diastolic: 82 },
      heartRate: 76,
      temperature: 98.4,
      weight: 78,
      height: 172,
      bmi: 26.4,
      oxygenSaturation: 98,
      respiratoryRate: 16
    },

    insurance: {
      provider: 'Star Health Insurance',
      policyNumber: 'SHI-2023-4567890',
      groupNumber: 'GRP-1234',
      validFrom: '2023-04-01',
      validTo: '2024-03-31',
      coverageType: 'Family Floater',
      status: 'Active'
    },

    recentVisits: mockVisits,
    labReports: mockLabReports,

    emergencyContact: {
      name: 'Sunita Verma',
      relationship: 'Spouse',
      phone: '+91 98765 43211',
      alternatePhone: '+91 11 2345 6789'
    }
  };

  return mockPatient;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    Active: 'success',
    Chronic: 'warning',
    Resolved: 'info',
    Completed: 'info',
    Discontinued: 'danger',
    Pending: 'warning',
    Expired: 'danger',
    Normal: 'success',
    Low: 'warning',
    High: 'warning',
    Critical: 'danger',
    Mild: 'success',
    Moderate: 'warning',
    Severe: 'danger'
  };
  return statusColors[status] || 'info';
}
