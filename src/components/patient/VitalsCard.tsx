import { motion } from 'framer-motion';
import {
  Heart,
  Thermometer,
  Activity,
  Wind,
  Scale,
  Ruler,
  Droplets
} from 'lucide-react';
import type { Vitals } from '../../types/patient';
import { formatDateTime } from '../../services/abhaService';

interface VitalsCardProps {
  vitals: Vitals;
}

interface VitalItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
  status?: 'normal' | 'warning' | 'critical';
  index: number;
}

function VitalItem({ icon, label, value, unit, status = 'normal', index }: VitalItemProps) {
  const statusColors = {
    normal: 'text-medical-600 bg-medical-50',
    warning: 'text-amber-600 bg-amber-50',
    critical: 'text-red-600 bg-red-50',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`p-3 rounded-xl ${statusColors[status]} border border-current/10`}
    >
      <div className="flex items-center gap-2 text-current/60 mb-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold">{value}</span>
        <span className="text-xs text-current/60">{unit}</span>
      </div>
    </motion.div>
  );
}

export function VitalsCard({ vitals }: VitalsCardProps) {
  const getBpStatus = (sys: number, dia: number) => {
    if (sys >= 180 || dia >= 120) return 'critical';
    if (sys >= 140 || dia >= 90) return 'warning';
    return 'normal';
  };

  const getHeartRateStatus = (hr: number) => {
    if (hr > 120 || hr < 50) return 'critical';
    if (hr > 100 || hr < 60) return 'warning';
    return 'normal';
  };

  const getSpO2Status = (spo2: number) => {
    if (spo2 < 90) return 'critical';
    if (spo2 < 95) return 'warning';
    return 'normal';
  };

  const getTempStatus = (temp: number) => {
    if (temp >= 103 || temp <= 95) return 'critical';
    if (temp >= 100.4 || temp <= 97) return 'warning';
    return 'normal';
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Current Vitals</h3>
        <span className="text-xs text-gray-500">
          {formatDateTime(vitals.lastRecorded)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <VitalItem
          index={0}
          icon={<Activity className="w-4 h-4" />}
          label="Blood Pressure"
          value={`${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic}`}
          unit="mmHg"
          status={getBpStatus(vitals.bloodPressure.systolic, vitals.bloodPressure.diastolic)}
        />
        <VitalItem
          index={1}
          icon={<Heart className="w-4 h-4" />}
          label="Heart Rate"
          value={vitals.heartRate}
          unit="bpm"
          status={getHeartRateStatus(vitals.heartRate)}
        />
        <VitalItem
          index={2}
          icon={<Droplets className="w-4 h-4" />}
          label="SpO2"
          value={vitals.oxygenSaturation}
          unit="%"
          status={getSpO2Status(vitals.oxygenSaturation)}
        />
        <VitalItem
          index={3}
          icon={<Thermometer className="w-4 h-4" />}
          label="Temperature"
          value={vitals.temperature}
          unit="°F"
          status={getTempStatus(vitals.temperature)}
        />
        <VitalItem
          index={4}
          icon={<Wind className="w-4 h-4" />}
          label="Respiratory Rate"
          value={vitals.respiratoryRate}
          unit="/min"
        />
        <VitalItem
          index={5}
          icon={<Scale className="w-4 h-4" />}
          label="BMI"
          value={vitals.bmi.toFixed(1)}
          unit="kg/m²"
          status={vitals.bmi > 30 ? 'warning' : vitals.bmi > 25 ? 'warning' : 'normal'}
        />
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Scale className="w-3.5 h-3.5" />
          <span>{vitals.weight} kg</span>
        </div>
        <div className="flex items-center gap-1">
          <Ruler className="w-3.5 h-3.5" />
          <span>{vitals.height} cm</span>
        </div>
      </div>
    </div>
  );
}
