import { motion } from 'framer-motion';
import { Phone, Mail, AlertTriangle } from 'lucide-react';
import type { Patient } from '../../types/patient';
import { Badge } from '../ui';

interface PatientHeaderProps {
  patient: Patient;
}

export function PatientHeader({ patient }: PatientHeaderProps) {
  const initials = `${patient.firstName[0]}${patient.lastName[0]}`;
  const severeAllergies = patient.allergies.filter(a => a.severity === 'Severe');

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-medical-600 to-medical-500 text-white p-4 rounded-b-2xl shadow-lg"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative">
          {patient.photo ? (
            <img
              src={patient.photo}
              alt={patient.name}
              className="w-16 h-16 rounded-full border-2 border-white/30 object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
              <span className="text-xl font-semibold">{initials}</span>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        </div>

        {/* Patient Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold truncate">{patient.name}</h2>
          <div className="flex items-center gap-3 text-sm text-white/80 mt-1">
            <span>{patient.gender}, {patient.age} yrs</span>
            {patient.bloodGroup && (
              <Badge variant="default" className="bg-white/20 text-white border-0">
                {patient.bloodGroup}
              </Badge>
            )}
          </div>
          <p className="text-xs text-white/70 mt-1 font-mono">
            ABHA: {patient.abhaId}
          </p>
        </div>
      </div>

      {/* Quick Contact */}
      <div className="mt-4 pt-3 border-t border-white/20 grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2 text-white/90">
          <Phone className="w-3.5 h-3.5" />
          <span className="truncate">{patient.mobile}</span>
        </div>
        {patient.email && (
          <div className="flex items-center gap-2 text-white/90">
            <Mail className="w-3.5 h-3.5" />
            <span className="truncate">{patient.email}</span>
          </div>
        )}
      </div>

      {/* Severe Allergies Warning */}
      {severeAllergies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-3 p-2 bg-red-500/90 rounded-lg flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">
            Severe Allergies: {severeAllergies.map(a => a.name).join(', ')}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
