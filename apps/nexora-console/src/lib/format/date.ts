const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDateTime(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);

  return DATE_TIME_FORMATTER.format(date);
}
