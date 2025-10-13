// Guest rate limiting utility
const GUEST_MATCH_LIMIT = 5; // 5 matches per day for guests
const STORAGE_KEY = 'guestMatchData';

interface GuestMatchData {
  count: number;
  resetDate: string; // ISO date string
}

export function getGuestMatchData(): GuestMatchData {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const newData = { count: 0, resetDate: getTomorrowDate() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    return newData;
  }
  
  try {
    const data: GuestMatchData = JSON.parse(stored);
    
    // Check if we need to reset (new day)
    const resetDate = new Date(data.resetDate);
    const now = new Date();
    
    if (now >= resetDate) {
      // Reset for new day and persist immediately
      const newData = { count: 0, resetDate: getTomorrowDate() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      return newData;
    }
    
    return data;
  } catch {
    const newData = { count: 0, resetDate: getTomorrowDate() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    return newData;
  }
}

export function incrementGuestMatches(): void {
  const data = getGuestMatchData();
  data.count += 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function canGuestPlayMatch(): boolean {
  const data = getGuestMatchData();
  return data.count < GUEST_MATCH_LIMIT;
}

export function getRemainingGuestMatches(): number {
  const data = getGuestMatchData();
  return Math.max(0, GUEST_MATCH_LIMIT - data.count);
}

export function getGuestMatchLimit(): number {
  return GUEST_MATCH_LIMIT;
}

function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}
