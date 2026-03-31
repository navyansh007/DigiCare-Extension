// DigiCare AI Pipeline — TypeScript interfaces matching digicare_api.py response shapes

export interface PipelineFinding {
  test_name_raw: string;
  result_raw: string;
  result_type: 'numeric' | 'ratio' | 'qualitative';
  numeric_value: number | null;
  unit: string;
  reference_low: number | null;
  reference_high: number | null;
  reference_range_raw: string;
  loinc_concept: string;
  is_abnormal: boolean;
  is_critical: boolean;
  abnormal_direction: 'HIGH' | 'LOW' | null;
  abnormal_reason: string;
  source_report_id: string;
  page_number: number;
  extraction_method: string;
  confidence_score: number;
  evidence_text: string;
}

export interface RedFlag {
  test: string;
  result: string;
  unit: string;
  reason: string;
  is_critical: boolean;
  source_report: string;
  page: number;
  evidence: string;
}

export interface GreenFlag {
  test: string;
  result: string;
  unit: string;
  source: string;
}

export interface ClinicalBrief {
  patient_id: string;
  brief: string;
  red_flags: RedFlag[];
  green_flags: GreenFlag[];
  findings_used: number;
  findings_total: number;
  disclaimer: string;
}

export interface ProcessReportResult {
  report_id: string;
  patient_id: string;
  report_date: string;
  findings: PipelineFinding[];
  brief: ClinicalBrief;
  stats: {
    findings_total: number;
    findings_abnormal: number;
    findings_critical: number;
    pages_processed: number;
  };
  cost_breakdown: {
    total_cost_usd: number;
    elapsed_sec: number;
    tokens_in: number;
    tokens_out: number;
  };
  errors: string[];
}

export interface PatientFindingsResult {
  patient_id: string;
  findings_count: number;
  findings: PipelineFinding[];
}

export interface PatientBriefResult {
  patient_id: string;
  findings_count: number;
  findings: PipelineFinding[];
  brief: ClinicalBrief;
}

export interface ChatCitation {
  test: string;
  result: string;
  source: string;
  page: number;
  reason: string;
}

export interface ChatResponse {
  answer: string;
  sources: string[];
  findings_used: number;
  findings_cited: ChatCitation[];
}

export interface PipelineHealthStatus {
  status: string;
  gemini_configured: boolean;
  db_configured: boolean;
}
