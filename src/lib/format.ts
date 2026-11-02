// How much room something takes up, in the units the browser and the operating
// system use to report it — powers of a thousand rather than of 1024.
export function bytes(amount: number): string {
  const units = ["B", "kB", "MB", "GB", "TB"];

  let value = amount;
  let unit = 0;
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit += 1;
  }

  return unit === 0
    ? `${value} ${units[unit]}`
    : `${value.toFixed(1)} ${units[unit]}`;
}

export function dateTime(at: number | string): string {
  return new Date(at).toLocaleString();
}

// Just the time of day
export function clockTime(at: number): string {
  return new Date(at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// How long ago something happened in informal terms, e.g. "3 hours ago" or "yesterday".
export function timeAgo(at: number): string {
  const secondsAgo = Math.max(0, Math.round((Date.now() - at) / 1000));

  if (secondsAgo < 60) return "less than a minute ago";

  const minutesAgo = Math.round(secondsAgo / 60);
  if (minutesAgo < 60) {
    return `${minutesAgo} ${plural(minutesAgo, "minute", "minutes")} ago`;
  }

  const hoursAgo = Math.round(minutesAgo / 60);
  if (hoursAgo < 24) {
    return `${hoursAgo} ${plural(hoursAgo, "hour", "hours")} ago`;
  }

  return dateTime(at);
}

// How old something is in whole days, in words.
export function describeAge(at: number): string {
  const days = Math.floor((Date.now() - at) / (24 * 60 * 60 * 1_000));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

export function plural(count: number, one: string, many: string): string {
  return count === 1 ? one : many;
}
