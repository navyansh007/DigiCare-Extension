import { motion } from 'framer-motion';
import { Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import type { MedicalCondition, Allergy } from '../../types/patient';
import { Badge } from '../ui';
import { formatDate, getStatusColor } from '../../services/abhaService';

interface ConditionsCardProps {
  conditions: MedicalCondition[];
  allergies: Allergy[];
}

export function ConditionsCard({ conditions, allergies }: ConditionsCardProps) {
  const activeConditions = conditions.filter(c => c.status === 'Active' || c.status === 'Chronic');
  const resolvedConditions = conditions.filter(c => c.status === 'Resolved');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <Activity className="w-4 h-4 text-blue-500" />;
      case 'Chronic':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'Resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Allergies Section */}
      <div>
        <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-red-500" />
          Allergies
        </h3>
        <div className="space-y-2">
          {allergies.map((allergy, index) => (
            <motion.div
              key={allergy.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-3 rounded-lg border ${allergy.severity === 'Severe'
                  ? 'bg-red-50 border-red-200'
                  : allergy.severity === 'Moderate'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-green-50 border-green-200'
                }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{allergy.name}</h4>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {allergy.type} • {allergy.reaction || 'No reaction specified'}
                  </p>
                </div>
                <Badge variant={getStatusColor(allergy.severity) as any}>
                  {allergy.severity}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Active Conditions */}
      <div>
        <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-medical-600" />
          Active Conditions
        </h3>
        <div className="space-y-2">
          {activeConditions.map((condition, index) => (
            <motion.div
              key={condition.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 bg-white rounded-lg border border-gray-100"
            >
              <div className="flex items-start gap-3">
                {getStatusIcon(condition.status)}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-gray-900">{condition.name}</h4>
                    <Badge variant={getStatusColor(condition.status) as any} size="sm">
                      {condition.status}
                    </Badge>
                  </div>
                  {condition.icdCode && (
                    <p className="text-xs text-gray-500 mt-0.5 font-mono">
                      ICD: {condition.icdCode}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    Since {formatDate(condition.diagnosedDate)}
                  </p>
                  {condition.notes && (
                    <p className="text-sm text-gray-500 mt-1 italic">
                      {condition.notes}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Resolved Conditions */}
      {resolvedConditions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-3">Resolved Conditions</h4>
          <div className="space-y-1">
            {resolvedConditions.map((condition) => (
              <div
                key={condition.id}
                className="p-2 bg-gray-50 rounded-lg text-sm flex items-center gap-2"
              >
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                <span className="text-gray-700">{condition.name}</span>
                <span className="text-gray-400 text-xs ml-auto">
                  {formatDate(condition.diagnosedDate)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
