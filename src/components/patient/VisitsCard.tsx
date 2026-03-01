import { motion } from 'framer-motion';
import { Calendar, User, Building2, FileText, ArrowRight } from 'lucide-react';
import type { Visit } from '../../types/patient';
import { Badge } from '../ui';
import { formatDate } from '../../services/abhaService';

interface VisitsCardProps {
  visits: Visit[];
}

export function VisitsCard({ visits }: VisitsCardProps) {
  const getVisitTypeColor = (type: Visit['type']) => {
    switch (type) {
      case 'Emergency':
        return 'danger';
      case 'IPD':
        return 'warning';
      case 'Telemedicine':
        return 'info';
      default:
        return 'success';
    }
  };

  return (
    <div className="p-4">
      <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-medical-600" />
        Visit History
      </h3>

      <div className="space-y-4">
        {visits.map((visit, index) => (
          <motion.div
            key={visit.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative pl-6 pb-4 border-l-2 border-gray-200 last:border-l-transparent last:pb-0"
          >
            {/* Timeline dot */}
            <div className={`absolute -left-2 top-0 w-4 h-4 rounded-full border-2 border-white shadow ${
              index === 0 ? 'bg-medical-500' : 'bg-gray-300'
            }`} />

            <div className="bg-white rounded-lg border border-gray-100 p-3 hover:border-medical-200 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(visit.date)}
                  </span>
                  <Badge
                    variant={getVisitTypeColor(visit.type) as any}
                    className="ml-2"
                  >
                    {visit.type}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span>{visit.doctor}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  <span>{visit.department}</span>
                </div>
                <div className="flex items-start gap-2 text-gray-700 bg-gray-50 p-2 rounded">
                  <FileText className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>{visit.diagnosis}</span>
                </div>

                {visit.notes && (
                  <p className="text-gray-500 text-xs italic mt-2">
                    {visit.notes}
                  </p>
                )}

                {visit.followUpDate && (
                  <div className="flex items-center gap-1 text-medical-600 text-xs font-medium mt-2">
                    <ArrowRight className="w-3 h-3" />
                    Follow-up: {formatDate(visit.followUpDate)}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
