import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Sidebar, ToggleButton } from '../components/sidebar';
import '../index.css';
import './content.css';

const MOUNT_POINT_ID = 'digicare-sidebar-root';

function ContentApp() {
    const [isOpen, setIsOpen] = useState(false);
    const [autoLoadPatient, setAutoLoadPatient] = useState<any | null>(null);

    useEffect(() => {
        const handleMessage = (request: any, _sender: chrome.runtime.MessageSender, _sendResponse: (response?: any) => void) => {
            if (request.type === 'TOGGLE_SIDEBAR') {
                setIsOpen((prev) => !prev);
            }
        };

        const handleOpenPatient = (event: CustomEvent) => {
            if (event.detail && event.detail.patient) {
                setIsOpen(true);
                setAutoLoadPatient(event.detail.patient);
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
                autoLoadPatient={autoLoadPatient}
                onAutoLoadComplete={() => setAutoLoadPatient(null)}
            />
        </>
    );
}

// Function to mount the app
function mount() {
    // Check if already mounted
    if (document.getElementById(MOUNT_POINT_ID)) return;

    const mountPoint = document.createElement('div');
    mountPoint.id = MOUNT_POINT_ID;
    document.body.appendChild(mountPoint);

    const root = createRoot(mountPoint);
    root.render(
        <StrictMode>
            <ContentApp />
        </StrictMode>
    );
}

// Mount the app
mount();
