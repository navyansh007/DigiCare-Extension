// Background service worker for DigiCare Extension.
// All API fetches are proxied through here to bypass CORS restrictions —
// background service workers are not subject to CORS for URLs listed in host_permissions.

chrome.action.onClicked.addListener((tab: chrome.tabs.Tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SIDEBAR' });
  }
});

chrome.runtime.onMessage.addListener(
  (
    message: any,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) => {
    // ── VDocs backend (JSON, cookie-credentialed) ───────────────────────────
    if (message.type === 'API_FETCH') {
      fetch(message.url, {
        method: message.method ?? 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        ...(message.body !== undefined ? { body: JSON.stringify(message.body) } : {})
      })
        .then(async (res) => {
          if (!res.ok) {
            sendResponse({
              success: false,
              status: res.status,
              error: `API error ${res.status}: ${res.statusText}`
            });
            return;
          }
          const text = await res.text();
          let data: unknown;
          try {
            data = JSON.parse(text);
          } catch {
            data = text;
          }
          sendResponse({ success: true, data });
        })
        .catch((err: Error) => {
          sendResponse({ success: false, error: err.message });
        });

      return true;
    }

    // ── DigiCare AI Pipeline (plain JSON, no cookies) ───────────────────────
    if (message.type === 'PIPELINE_FETCH') {
      const init: RequestInit = {
        method: message.method ?? 'GET',
        headers: { 'Content-Type': 'application/json' },
        ...(message.body !== undefined ? { body: JSON.stringify(message.body) } : {})
      };

      fetch(message.url, init)
        .then(async (res) => {
          if (!res.ok) {
            sendResponse({
              success: false,
              status: res.status,
              error: `Pipeline error ${res.status}: ${res.statusText}`
            });
            return;
          }
          const data = await res.json();
          sendResponse({ success: true, data });
        })
        .catch((err: Error) => {
          sendResponse({ success: false, error: err.message });
        });

      return true;
    }

    // ── Process a report: fetch the file then POST to pipeline ──────────────
    if (message.type === 'PIPELINE_PROCESS_REPORT') {
      const { fileUrl, patientId, reportId, reportDate } = message as {
        fileUrl: string;
        patientId: string;
        reportId: string;
        reportDate: string;
      };

      (async () => {
        // 1. Fetch the raw file bytes from the VDocs file URL
        let fileRes: Response;
        try {
          fileRes = await fetch(fileUrl, { credentials: 'include' });
        } catch (err) {
          sendResponse({ success: false, error: `Failed to fetch report file: ${(err as Error).message}` });
          return;
        }
        if (!fileRes.ok) {
          sendResponse({ success: false, error: `Failed to fetch report file: HTTP ${fileRes.status}` });
          return;
        }

        const blob = await fileRes.blob();

        // Infer file extension from Content-Type or URL
        const contentType = fileRes.headers.get('Content-Type') ?? 'application/octet-stream';
        const ext = contentType.includes('pdf')
          ? '.pdf'
          : contentType.includes('png')
          ? '.png'
          : contentType.includes('jpeg') || contentType.includes('jpg')
          ? '.jpg'
          : '.png';

        // 2. Build multipart/form-data and POST to pipeline
        const form = new FormData();
        form.append('file', new File([blob], `report${ext}`, { type: contentType }));
        form.append('patient_id', patientId);
        form.append('report_id', reportId);
        form.append('report_date', reportDate);

        let pipelineRes: Response;
        try {
          // Fetch the pipeline base URL from the stored pipeline base
          // We look at the PIPELINE_FETCH message convention: message.url already has base
          // For PROCESS_REPORT we construct the URL from the same base pattern.
          // The pipeline base URL must match PIPELINE_BASE_URL in pipelineService.ts.
          pipelineRes = await fetch(`${message.pipelineBaseUrl ?? 'http://localhost:8090'}/reports/process`, {
            method: 'POST',
            body: form
          });
        } catch (err) {
          sendResponse({ success: false, error: `Pipeline unreachable: ${(err as Error).message}` });
          return;
        }

        if (!pipelineRes.ok) {
          const errText = await pipelineRes.text().catch(() => pipelineRes.statusText);
          sendResponse({ success: false, error: `Pipeline error ${pipelineRes.status}: ${errText}` });
          return;
        }

        const data = await pipelineRes.json();
        sendResponse({ success: true, data });
      })();

      return true;
    }
  }
);

console.log('DigiCare Background Service Worker initialized');
