import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronDown, ChevronUp, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import type { LabReport, LabResult } from '../../types/patient';
import { Badge } from '../ui';
import { formatDate } from '../../services/abhaService';

interface LabReportsCardProps {
  reports: LabReport[];
}

function ResultStatusIcon({ status }: { status: LabResult['status'] }) {
  switch (status) {
    case 'Normal':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'Low':
    case 'High':
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case 'Critical':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    default:
      return null;
  }
}

function LabReportItem({ report, index }: { report: LabReport; index: number }) {
  const [isExpanded, setIsExpanded] = useState(index === 0);
  const abnormalCount = report.results.filter(r => r.status !== 'Normal').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-lg border border-gray-100 overflow-hidden"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-medical-50 flex items-center justify-center">
            <FileText className="w-5 h-5 text-medical-600" />
          </div>
          <div className="text-left">
            <h4 className="font-medium text-gray-900 text-sm">{report.testName}</h4>
            <p className="text-xs text-gray-500">{formatDate(report.resultDate)} • {report.lab}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {abnormalCount > 0 && (
            <Badge variant="warning">{abnormalCount} abnormal</Badge>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 border-t border-gray-100">
              <table className="w-full mt-3">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-100">
                    <th className="text-left py-2 font-medium">Parameter</th>
                    <th className="text-right py-2 font-medium">Value</th>
                    <th className="text-right py-2 font-medium">Reference</th>
                    <th className="text-center py-2 font-medium w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {report.results.map((result, i) => (
                    <tr
                      key={i}
                      className={`text-sm border-b border-gray-50 last:border-b-0 ${
                        result.status !== 'Normal' ? 'bg-amber-50/50' : ''
                      }`}
                    >
                      <td className="py-2 text-gray-700">{result.parameter}</td>
                      <td className="py-2 text-right font-medium text-gray-900">
                        {result.value} <span className="text-gray-400 text-xs">{result.unit}</span>
                      </td>
                      <td className="py-2 text-right text-gray-500 text-xs">
                        {result.referenceRange}
                      </td>
                      <td className="py-2 text-center">
                        <ResultStatusIcon status={result.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                Ordered by: {report.orderedBy}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function LabReportsCard({ reports }: LabReportsCardProps) {
  return (
    <div className="p-4">
      <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
        <FileText className="w-4 h-4 text-medical-600" />
        Lab Reports
      </h3>

      <div className="space-y-3">
        {reports.map((report, index) => (
          <LabReportItem key={report.id} report={report} index={index} />
        ))}
      </div>
    </div>
  );
}
