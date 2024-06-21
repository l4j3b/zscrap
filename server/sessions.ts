export const AUTH_SESSION_KEY = 'auth';

interface AuthSession {
  sessionUserId: string;
  activeOrganizationId: string;
  displayName: string;
  username: string;
  email: string;
  isAdmin: boolean;
}

export interface SessionData {
  [AUTH_SESSION_KEY]: AuthSession;
}

export interface SessionFlashData {
  errorMessage: string;
  infoMessage: string;
  successMessage: string;
}
