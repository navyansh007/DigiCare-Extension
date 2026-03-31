import { BASE_URL } from './apiService';

export interface ClinicProfile {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

// ─── Background-proxied POST helper ───────────────────────────────────────

function authPost<T>(path: string, body: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: 'API_FETCH', url: `${BASE_URL}${path}`, method: 'POST', body },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (response?.success) {
          resolve(response.data as T);
        } else {
          reject(new Error(response?.error ?? 'Request failed'));
        }
      }
    );
  });
}

// ─── Auth API calls ────────────────────────────────────────────────────────

/** Step 1 — validate credentials and trigger email OTP. */
export async function clinicLogin(email: string, password: string): Promise<void> {
  await authPost<string>('/api/clinic/auth/login', { email, password });
}

/** Step 2 — verify OTP, receive JWT cookie, return clinic profile. */
export async function verifyEmailOtp(
  email: string,
  code: string
): Promise<ClinicProfile> {
  return authPost<ClinicProfile>('/api/clinic/auth/verify-otp', { email, code });
}

/** Clear JWT cookie server-side and wipe local auth state. */
export async function clinicLogout(): Promise<void> {
  await authPost<string>('/api/clinic/auth/logout', {}).catch(() => {});
  await clearAuthState();
}

// ─── Persistent auth state (chrome.storage.local) ─────────────────────────

export async function getAuthState(): Promise<{
  isLoggedIn: boolean;
  clinicProfile?: ClinicProfile;
}> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['isLoggedIn', 'clinicProfile'], (result) => {
      resolve({
        isLoggedIn: result['isLoggedIn'] === true,
        clinicProfile: result['clinicProfile'] as ClinicProfile | undefined
      });
    });
  });
}

export async function setAuthState(profile: ClinicProfile): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ isLoggedIn: true, clinicProfile: profile }, resolve);
  });
}

export async function clearAuthState(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove(['isLoggedIn', 'clinicProfile'], resolve);
  });
}
