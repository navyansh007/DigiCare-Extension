import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronDown, ChevronUp, AlertCircle, CheckCircle, AlertTriangle, Sparkles, Loader2, TrendingUp } from 'lucide-react';
import type { LabReport, LabResult } from '../../types/patient';
import type { ProcessReportResult } from '../../types/pipeline';
import { Badge } from '../ui';
import { formatDate } from '../../services/abhaService';
import { processReport } from '../../services/pipelineService';

interface LabReportsCardProps {
  reports: LabReport[];
  patientId: string;
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

type AnalysisState = 'idle' | 'loading' | 'done' | 'error';

function LabReportItem({
  report,
  index,
  patientId
}: {
  report: LabReport;
  index: number;
  patientId: string;
}) {
  const [isExpanded, setIsExpanded] = useState(index === 0);
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [analysisResult, setAnalysisResult] = useState<ProcessReportResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const abnormalCount = report.results.filter(r => r.status !== 'Normal').length;

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!report.fileUrl) return;
    setAnalysisState('loading');
    setAnalysisError(null);
    try {
      const result = await processReport(
        report.fileUrl,
        patientId,
        report.id,
        report.testDate
      );
      setAnalysisResult(result);
      setAnalysisState('done');
      setIsExpanded(true);
    } catch (err) {
      setAnalysisError((err as Error).message);
      setAnalysisState('error');
    }
  };

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
          {analysisState === 'done' && analysisResult && (
            <Badge variant={analysisResult.stats.findings_critical > 0 ? 'danger' : analysisResult.stats.findings_abnormal > 0 ? 'warning' : 'success'}>
              {analysisResult.stats.findings_abnormal} flag{analysisResult.stats.findings_abnormal !== 1 ? 's' : ''}
            </Badge>
          )}
          {report.fileUrl && analysisState !== 'done' && (
            <button
              onClick={handleAnalyze}
              disabled={analysisState === 'loading'}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {analysisState === 'loading' ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              {analysisState === 'loading' ? 'Analyzing…' : 'Analyze'}
            </button>
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
              {report.results.length > 0 ? (
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
              ) : report.fileUrl ? (
                <div className="mt-3 text-center">
                  <a
                    href={report.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-medical-600 hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    View Report Document
                  </a>
                </div>
              ) : (
                <p className="mt-3 text-xs text-gray-400 text-center">No structured results available.</p>
              )}
              {report.orderedBy && (
                <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                  Ordered by: {report.orderedBy}
                </div>
              )}

              {/* ── Pipeline analysis error ── */}
              {analysisState === 'error' && analysisError && (
                <div className="mt-3 p-2 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600 flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>{analysisError}</span>
                </div>
              )}

              {/* ── Pipeline analysis results ── */}
              {analysisState === 'done' && analysisResult && (
                <div className="mt-3 space-y-3">
                  {/* Clinical brief */}
                  {analysisResult.brief?.brief && (
                    <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                      <div className="flex items-center gap-1.5 text-indigo-700 mb-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold uppercase tracking-wide">AI Analysis</span>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed">{analysisResult.brief.brief}</p>
                    </div>
                  )}

                  {/* Red flags */}
                  {analysisResult.brief?.red_flags?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-red-600 mb-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Red Flags ({analysisResult.brief.red_flags.length})
                      </p>
                      <div className="space-y-1">
                        {analysisResult.brief.red_flags.map((flag, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs p-2 rounded bg-red-50 border border-red-100">
                            <TrendingUp className="w-3 h-3 mt-0.5 text-red-500 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-red-700">{flag.test}: </span>
                              <span className="text-red-600">{flag.result} {flag.unit}</span>
                              <p className="text-red-500 mt-0.5">{flag.reason}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Green flags summary */}
                  {analysisResult.brief?.green_flags?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-green-600 mb-1.5 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Normal ({analysisResult.brief.green_flags.length} parameters)
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {analysisResult.brief.green_flags.slice(0, 8).map((flag, i) => (
                          <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-100">
                            {flag.test}
                          </span>
                        ))}
                        {analysisResult.brief.green_flags.length > 8 && (
                          <span className="text-xs text-green-600">+{analysisResult.brief.green_flags.length - 8} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Disclaimer */}
                  {analysisResult.brief?.disclaimer && (
                    <p className="text-[10px] text-gray-400 italic">{analysisResult.brief.disclaimer}</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function LabReportsCard({ reports, patientId }: LabReportsCardProps) {
  return (
    <div className="p-4">
      <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
        <FileText className="w-4 h-4 text-medical-600" />
        Lab Reports
      </h3>

      <div className="space-y-3">
        {reports.map((report, index) => (
          <LabReportItem key={report.id} report={report} index={index} patientId={patientId} />
        ))}
      </div>
    </div>
  );
}
