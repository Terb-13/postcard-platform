"use client";

const STORAGE_KEY = "postcard_guest_session_id";

function generateGuestSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `guest_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

/** Persistent anonymous session id for guest campaign wizard + checkout. */
export function getGuestSessionId(): string {
  if (typeof window === "undefined") return "";

  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = generateGuestSessionId();
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return generateGuestSessionId();
  }
}

export function ensureGuestSessionId(): string {
  return getGuestSessionId();
}
