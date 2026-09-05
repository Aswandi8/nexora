"use client";

import { Input } from "@/components/ui/input";

interface DurationInputProps {
  minutes: string;
  seconds: string;
  disabled?: boolean;
  onMinutesChange: (value: string) => void;
  onSecondsChange: (value: string) => void;
}

function normalizeDurationPart(value: string): string | null {
  const digits = value.replace(/\D/g, "");

  if (digits.length > 2) {
    return null;
  }

  if (digits === "") {
    return "";
  }

  const number = Number(digits);

  if (!Number.isInteger(number) || number < 0 || number > 59) {
    return null;
  }

  return digits;
}

function normalizeBlurredDurationPart(value: string): string {
  if (!value) {
    return "00";
  }

  return String(Number(value)).padStart(2, "0");
}

export function DurationInput({
  minutes,
  seconds,
  disabled = false,
  onMinutesChange,
  onSecondsChange,
}: DurationInputProps) {
  function handleMinutesChange(value: string) {
    const normalized = normalizeDurationPart(value);

    if (normalized !== null) {
      onMinutesChange(normalized);
    }
  }

  function handleSecondsChange(value: string) {
    const normalized = normalizeDurationPart(value);

    if (normalized !== null) {
      onSecondsChange(normalized);
    }
  }

  return (
    <div className="flex max-w-52 items-center gap-2">
      <div className="min-w-0 flex-1">
        <Input
          id="shortlink-duration-minutes"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={2}
          value={minutes}
          disabled={disabled}
          onChange={(event) => handleMinutesChange(event.target.value)}
          onBlur={() => onMinutesChange(normalizeBlurredDurationPart(minutes))}
          aria-label="Display duration minutes"
          placeholder="00"
          className="text-center tabular-nums"
        />
      </div>

      <span
        className="shrink-0 text-sm font-semibold text-muted-foreground"
        aria-hidden="true"
      >
        :
      </span>

      <div className="min-w-0 flex-1">
        <Input
          id="shortlink-duration-seconds"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={2}
          value={seconds}
          disabled={disabled}
          onChange={(event) => handleSecondsChange(event.target.value)}
          onBlur={() => onSecondsChange(normalizeBlurredDurationPart(seconds))}
          aria-label="Display duration seconds"
          placeholder="15"
          className="text-center tabular-nums"
        />
      </div>
    </div>
  );
}
