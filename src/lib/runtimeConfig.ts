export function getApiBase() {
  const k = 'OBLIQUE_API_BASE';
  const v = typeof window !== 'undefined' ? window.localStorage.getItem(k) : null;
  // Default to my Replit URL:
  return (v && v.trim()) ? v : 'https://mandate-parser-brenertomer.replit.app';
}

export function setApiBase(url: string) {
  const k = 'OBLIQUE_API_BASE';
  if (typeof window !== 'undefined') window.localStorage.setItem(k, url);
}