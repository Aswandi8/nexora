export interface ShortlinkDurationParts {
  minutes: string;
  seconds: string;
}

export function durationPartsToMs(minutes: string, seconds: string): number {
  const parsedMinutes = Number(minutes || 0);
  const parsedSeconds = Number(seconds || 0);

  if (
    !Number.isInteger(parsedMinutes) ||
    !Number.isInteger(parsedSeconds) ||
    parsedMinutes < 0 ||
    parsedMinutes > 59 ||
    parsedSeconds < 0 ||
    parsedSeconds > 59
  ) {
    return 0;
  }

  return parsedMinutes * 60_000 + parsedSeconds * 1_000;
}

export function displayDurationMsToParts(
  durationMs: number,
): ShortlinkDurationParts {
  const totalSeconds = Math.max(
    0,
    Math.min(59 * 60 + 59, Math.floor(durationMs / 1000)),
  );

  const minutes = Math.floor(totalSeconds / 60);

  const seconds = totalSeconds % 60;

  return {
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

export function formatShortlinkDisplayDuration(durationMs: number): string {
  const parts = displayDurationMsToParts(durationMs);

  return `${parts.minutes}:${parts.seconds}`;
}

export function formatShortlinkDuration(durationMs: number | null): string {
  if (durationMs === null) {
    return "—";
  }

  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));

  const hours = Math.floor(totalSeconds / 3600);

  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return [
      hours,
      String(minutes).padStart(2, "0"),
      String(seconds).padStart(2, "0"),
    ].join(":");
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
}

export function formatShortlinkBytes(value: string | null): string {
  if (!value) {
    return "—";
  }

  const bytes = Number(value);

  if (!Number.isFinite(bytes) || bytes < 0) {
    return value;
  }

  const units = ["B", "KB", "MB", "GB", "TB"];

  if (bytes === 0) {
    return "0 B";
  }

  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  const size = bytes / 1024 ** index;

  return `${
    size >= 10 || index === 0 ? size.toFixed(0) : size.toFixed(1)
  } ${units[index]}`;
}
