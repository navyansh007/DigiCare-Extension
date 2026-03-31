import type {
  ProcessReportResult,
  PatientFindingsResult,
  PatientBriefResult,
  ChatResponse,
  PipelineHealthStatus
} from '../types/pipeline';

// DigiCare AI Pipeline base URL — change this to the deployed URL when moving to production
export const PIPELINE_BASE_URL = 'http://localhost:8090';

// ─── Core fetch helpers ────────────────────────────────────────────────────

function pipelineFetch<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: 'PIPELINE_FETCH',
        url: `${PIPELINE_BASE_URL}${path}`,
        method,
        body
      },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (response?.success) {
          resolve(response.data as T);
        } else {
          reject(new Error(response?.error ?? 'Pipeline request failed'));
        }
      }
    );
  });
}

// ─── Pipeline API functions ────────────────────────────────────────────────

/**
 * Checks whether the pipeline is reachable and configured.
 */
export function checkPipelineHealth(): Promise<PipelineHealthStatus> {
  return pipelineFetch<PipelineHealthStatus>('/health');
}

/**
 * Fetches the report file from fileUrl and submits it to the pipeline for analysis.
 * The background worker handles the binary transfer so the content script only
 * passes serialisable data.
 */
export function processReport(
  fileUrl: string,
  patientId: string,
  reportId: string,
  reportDate: string
): Promise<ProcessReportResult> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: 'PIPELINE_PROCESS_REPORT',
        fileUrl,
        patientId,
        reportId,
        reportDate,
        pipelineBaseUrl: PIPELINE_BASE_URL
      },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (response?.success) {
          resolve(response.data as ProcessReportResult);
        } else {
          reject(new Error(response?.error ?? 'Failed to process report'));
        }
      }
    );
  });
}

/**
 * Returns all extracted lab findings for a patient.
 * Optionally filter by a specific LOINC concept (e.g. "HEMOGLOBIN").
 */
export function getPatientFindings(
  patientId: string,
  loincConcept?: string
): Promise<PatientFindingsResult> {
  const query = loincConcept ? `?loinc_concept=${encodeURIComponent(loincConcept)}` : '';
  return pipelineFetch<PatientFindingsResult>(`/patients/${encodeURIComponent(patientId)}/findings${query}`);
}

/**
 * Returns a synthesised clinical brief for a patient based on all stored findings.
 */
export function getPatientBrief(patientId: string): Promise<PatientBriefResult> {
  return pipelineFetch<PatientBriefResult>(`/patients/${encodeURIComponent(patientId)}/brief`);
}

/**
 * Asks the pipeline a clinical question about a specific patient.
 */
export function askPatientQuestion(
  patientId: string,
  question: string
): Promise<ChatResponse> {
  return pipelineFetch<ChatResponse>(
    `/patients/${encodeURIComponent(patientId)}/chat`,
    'POST',
    { question }
  );
}
