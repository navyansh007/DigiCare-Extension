import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Sidebar, ToggleButton } from '../components/sidebar';

// Import styles as raw strings so they can be injected into the Shadow DOM.
// Without this, Vite injects them into the host page's <head>, causing Tailwind
// Preflight resets to bleed into the host page and grey out its text.
import indexCss from '../index.css?inline';
import contentCss from './content.css?inline';

const MOUNT_POINT_ID = 'digicare-sidebar-root';

function ContentApp() {
    const [isOpen, setIsOpen] = useState(false);
    // Only the patient UUID is stored here — full data is always fetched from the API
    const [autoLoadPatientId, setAutoLoadPatientId] = useState<string | null>(null);

    useEffect(() => {
        const handleMessage = (
            request: any,
            _sender: chrome.runtime.MessageSender,
            _sendResponse: (response?: any) => void
        ) => {
            if (request.type === 'TOGGLE_SIDEBAR') {
                setIsOpen((prev) => !prev);
            }
        };

        /**
         * The VDocs clinic portal can fire this event to open the sidebar for a
         * specific patient.  We only use the patient's `id` (UUID) and always
         * re-fetch from the API — the event payload is never used as patient data.
         *
         * Expected event detail: { patientId: string }
         * Legacy shape also accepted: { patient: { id: string } }
         */
        const handleOpenPatient = (event: CustomEvent) => {
            const detail = event.detail;
            if (!detail) return;

            const patientId: string | undefined =
                detail.patientId || detail.patient?.id;

            if (patientId) {
                setIsOpen(true);
                setAutoLoadPatientId(patientId);
            }
        };

        chrome.runtime.onMessage.addListener(handleMessage);
        window.addEventListener('DIGICARE_EXT_OPEN_PATIENT', handleOpenPatient as EventListener);

        return () => {
            chrome.runtime.onMessage.removeListener(handleMessage);
            window.removeEventListener('DIGICARE_EXT_OPEN_PATIENT', handleOpenPatient as EventListener);
        };
    }, []);

    return (
        <>
            <div className="fixed top-1/2 right-0 z-[999998] transform -translate-y-1/2">
                <ToggleButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
            </div>
            <Sidebar
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                autoLoadPatientId={autoLoadPatientId}
                onAutoLoadComplete={() => setAutoLoadPatientId(null)}
            />
        </>
    );
}

function mount() {
    if (document.getElementById(MOUNT_POINT_ID)) return;

    // Shadow host — the only element added to the host page's DOM
    const host = document.createElement('div');
    host.id = MOUNT_POINT_ID;
    document.body.appendChild(host);

    // Shadow root provides full style isolation: Tailwind Preflight and all
    // extension CSS stay inside this boundary and never reach the host page.
    const shadow = host.attachShadow({ mode: 'open' });

    // Inject extension styles into the shadow root (not the host page <head>)
    const style = document.createElement('style');
    style.textContent = indexCss + '\n' + contentCss;
    shadow.appendChild(style);

    // Mount point for the React app
    const mountPoint = document.createElement('div');
    shadow.appendChild(mountPoint);

    const root = createRoot(mountPoint);
    root.render(
        <StrictMode>
            <ContentApp />
        </StrictMode>
    );
}

mount();
