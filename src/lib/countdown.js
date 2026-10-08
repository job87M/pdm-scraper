const pad = (n) => String(n).padStart(2, '0');

/** Milliseconds left until `endsAt` (ISO string), or null if there is no valid end time. */
export function msRemaining(endsAt, now = Date.now()) {
  if (!endsAt) return null;
  const end = Date.parse(endsAt);
  return Number.isNaN(end) ? null : end - now;
}

/** 06:17:27, or "2d 03h 04m" once more than a day is left; "Ended" when finished. */
export function formatRemaining(ms) {
  if (ms === null) return '';
  if (ms <= 0) return 'Ended';
  const total = Math.floor(ms / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (days > 0) return `${days}d ${pad(hours)}h ${pad(minutes)}m`;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
