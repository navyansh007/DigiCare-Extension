import { motion } from 'framer-motion';
import {
  Activity,
  Pill,
  AlertTriangle,
  Calendar,
  Shield,
  Phone,
  User,
  Sparkles
} from 'lucide-react';
import type { Patient } from '../../types/patient';
import { Badge, Card } from '../ui';
import { formatDate } from '../../services/abhaService';

interface QuickOverviewProps {
  patient: Patient;
  specialization?: string;
}

export function QuickOverview({ patient, specialization = 'General Medicine' }: QuickOverviewProps) {
  const activeConditions = patient.conditions.filter(c => c.status === 'Active' || c.status === 'Chronic');
  const activeMeds = patient.medications.filter(m => m.status === 'Active');
  const severeAllergies = patient.allergies.filter(a => a.severity === 'Severe');
  const lastVisit = patient.recentVisits[0];

  // Simulated AI Summary Generator
  const getAISummary = () => {
    switch (specialization) {
      case 'Cardiology':
        return `Patient has a history of ${patient.conditions.map(c => c.name).join(', ')}. BP trends indicate ${patient.vitals.bloodPressure.systolic > 130 ? 'uncontrolled hypertension' : 'stable pressure'}. Cardiac risk profile requires monitoring due to ${activeMeds.length > 0 ? 'polypharmacy' : 'age factors'}.`;
      case 'Dermatology':
        return `Skin conditions: ${patient.conditions.filter(c => c.name.includes('Skin') || c.name.includes('Allerg') || true).map(c => c.name).join(', ')}. Severe allergies noted: ${severeAllergies.map(a => a.name).join(', ') || 'None'}. Medication review suggested for cutaneous side effects.`;
      case 'Pediatrics':
        return `Growth metrics (Height/Weight) are ${patient.vitals.bmi > 18 ? 'within normal percentile' : 'requiring attention'}. Immunization schedule review recommended. Recent infections: ${patient.recentVisits[0]?.diagnosis || 'None'}.`;
      case 'Endocrinology':
        return `Metabolic profile: BMI ${patient.vitals.bmi}. Patient is managing ${patient.conditions.join(', ')}. Review latest HbA1c and thyroid function tests. Medication adherence to ${activeMeds[0]?.name || 'current regimen'} is critical.`;
      case 'Orthopedics':
        return `Musculoskeletal status: Patient age ${patient.age} indicates potential for ${patient.age > 50 ? 'osteoarthritis' : 'sports injuries'}. Recent visits related to: ${lastVisit?.diagnosis || 'General checkup'}. Calcium/Vitamin D supplementation review advised.`;
      default:
        return `Patient is a ${patient.age}yo ${patient.gender} with ${activeConditions.length} active conditions. Recent visit on ${formatDate(lastVisit?.date || '')} for ${lastVisit?.diagnosis}. Vitals are currently ${patient.vitals.bloodPressure.systolic < 140 ? 'stable' : 'elevated'}.`;
    }
  };

  const quickStats = [
    {
      icon: <Activity className="w-5 h-5" />,
      label: 'Active Conditions',
      value: activeConditions.length,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      icon: <Pill className="w-5 h-5" />,
      label: 'Current Medications',
      value: activeMeds.length,
      color: 'text-medical-600 bg-medical-50',
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      label: 'Severe Allergies',
      value: severeAllergies.length,
      color: severeAllergies.length > 0 ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-50',
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'Total Visits',
      value: patient.recentVisits.length,
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* AI Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-2 text-indigo-700">
          <Sparkles className="w-4 h-4" />
          <h4 className="text-sm font-bold uppercase tracking-wide">AI Flash Brief • {specialization}</h4>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed font-medium">
          {getAISummary()}
        </p>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`p-3 rounded-xl ${stat.color}`}
          >
            <div className="flex items-center gap-2 mb-1">
              {stat.icon}
              <span className="text-2xl font-bold">{stat.value}</span>
            </div>
            <p className="text-xs font-medium opacity-80">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Critical Info */}
      {activeConditions.length > 0 && (
        <Card className="p-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            Key Conditions
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {activeConditions.map((condition) => (
              <Badge
                key={condition.id}
                variant={condition.status === 'Chronic' ? 'warning' : 'info'}
              >
                {condition.name}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Current Vitals Summary */}
      <Card className="p-3">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Latest Vitals</h4>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold text-gray-900">
              {patient.vitals.bloodPressure.systolic}/{patient.vitals.bloodPressure.diastolic}
            </p>
            <p className="text-xs text-gray-500">BP (mmHg)</p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold text-gray-900">{patient.vitals.heartRate}</p>
            <p className="text-xs text-gray-500">HR (bpm)</p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold text-gray-900">{patient.vitals.oxygenSaturation}%</p>
            <p className="text-xs text-gray-500">SpO2</p>
          </div>
        </div>
      </Card>

      {/* Last Visit */}
      {lastVisit && (
        <Card className="p-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            Last Visit
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span className="font-medium">{formatDate(lastVisit.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Doctor</span>
              <span className="font-medium">{lastVisit.doctor}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Department</span>
              <span className="font-medium">{lastVisit.department}</span>
            </div>
            <p className="text-gray-600 mt-2 pt-2 border-t border-gray-100">
              {lastVisit.diagnosis}
            </p>
          </div>
        </Card>
      )}

      {/* Insurance Status */}
      {patient.insurance && (
        <Card className="p-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-500" />
            Insurance
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Provider</span>
              <span className="font-medium">{patient.insurance.provider}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Status</span>
              <Badge variant={patient.insurance.status === 'Active' ? 'success' : 'danger'}>
                {patient.insurance.status}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Valid Till</span>
              <span className="font-medium">{formatDate(patient.insurance.validTo)}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Emergency Contact */}
      {patient.emergencyContact && (
        <Card className="p-3 bg-red-50 border-red-100">
          <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Emergency Contact
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-red-400" />
              <span className="text-red-800 font-medium">
                {patient.emergencyContact.name} ({patient.emergencyContact.relationship})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-red-400" />
              <span className="text-red-700">{patient.emergencyContact.phone}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
