/**
 * Admin Session Manager
 * Handles persistent sessions and inactivity timeout
 */

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const LAST_ACTIVITY_KEY = 'zen-admin-last-activity';
const SESSION_VALID_KEY = 'zen-admin-session-valid';

export const adminSession = {
  /**
   * Update last activity timestamp
   */
  updateActivity: () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    localStorage.setItem(SESSION_VALID_KEY, 'true');
  },

  /**
   * Check if session has expired due to inactivity
   */
  isSessionExpired: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    const sessionValid = localStorage.getItem(SESSION_VALID_KEY);
    
    if (!lastActivity || !sessionValid || sessionValid !== 'true') {
      return false; // No session to expire
    }
    
    const elapsed = Date.now() - parseInt(lastActivity, 10);
    return elapsed > INACTIVITY_TIMEOUT_MS;
  },

  /**
   * Get remaining session time in milliseconds
   */
  getRemainingTime: (): number => {
    if (typeof window === 'undefined') return INACTIVITY_TIMEOUT_MS;
    
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!lastActivity) return INACTIVITY_TIMEOUT_MS;
    
    const elapsed = Date.now() - parseInt(lastActivity, 10);
    return Math.max(0, INACTIVITY_TIMEOUT_MS - elapsed);
  },

  /**
   * Start a new session
   */
  startSession: () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SESSION_VALID_KEY, 'true');
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  },

  /**
   * End the session
   */
  endSession: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SESSION_VALID_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
  },

  /**
   * Check if there's a valid session
   */
  hasValidSession: (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(SESSION_VALID_KEY) === 'true';
  },
};

/**
 * Activity Tracker Hook Events
 */
export const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keydown',
  'scroll',
  'touchstart',
  'click',
  'wheel',
] as const;

/**
 * Debounce function for activity tracking
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
