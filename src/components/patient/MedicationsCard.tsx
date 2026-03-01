import { motion } from 'framer-motion';
import { Pill, Clock, RefreshCw, User } from 'lucide-react';
import type { Medication } from '../../types/patient';
import { Badge } from '../ui';
import { getStatusColor } from '../../services/abhaService';

interface MedicationsCardProps {
  medications: Medication[];
}

export function MedicationsCard({ medications }: MedicationsCardProps) {
  const activeMeds = medications.filter(m => m.status === 'Active');
  const otherMeds = medications.filter(m => m.status !== 'Active');

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Pill className="w-4 h-4 text-medical-600" />
          Current Medications
        </h3>
        <Badge variant="info">{activeMeds.length} Active</Badge>
      </div>

      <div className="space-y-3">
        {activeMeds.map((med, index) => (
          <motion.div
            key={med.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-3 bg-white rounded-lg border border-gray-100 hover:border-medical-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{med.name}</h4>
                <p className="text-sm text-gray-600 mt-0.5">
                  {med.dosage} - {med.frequency}
                </p>
              </div>
              <Badge
                variant={getStatusColor(med.status) as any}
              >
                {med.status}
              </Badge>
            </div>

            <div className="mt-2 pt-2 border-t border-gray-50 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {med.route}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {med.prescribedBy}
              </span>
              {med.refillsRemaining !== undefined && (
                <span className="flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  {med.refillsRemaining} refills left
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {otherMeds.length > 0 && (
        <>
          <h4 className="text-sm font-medium text-gray-500 mt-6 mb-3">Past Medications</h4>
          <div className="space-y-2">
            {otherMeds.map((med) => (
              <div
                key={med.id}
                className="p-2 bg-gray-50 rounded-lg text-sm flex items-center justify-between"
              >
                <div>
                  <span className="font-medium text-gray-700">{med.name}</span>
                  <span className="text-gray-500 ml-2">{med.dosage}</span>
                </div>
                <Badge
                  variant={getStatusColor(med.status) as any}
                  size="sm"
                >
                  {med.status}
                </Badge>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
