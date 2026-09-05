type AuditValue = string | number | boolean | null | string[];

type AuditChangeInput = Record<
  string,
  {
    from: AuditValue;
    to: AuditValue;
  }
>;

export type AuditChanges = Record<
  string,
  {
    from: AuditValue;
    to: AuditValue;
  }
>;

function normalizeValue(value: AuditValue): AuditValue {
  return Array.isArray(value) ? [...value].sort() : value;
}

function isEqual(left: AuditValue, right: AuditValue): boolean {
  return (
    JSON.stringify(normalizeValue(left)) ===
    JSON.stringify(normalizeValue(right))
  );
}

export function buildAuditChanges(input: AuditChangeInput): AuditChanges {
  const changes: AuditChanges = {};

  for (const [field, change] of Object.entries(input)) {
    if (isEqual(change.from, change.to)) continue;

    changes[field] = {
      from: normalizeValue(change.from),
      to: normalizeValue(change.to),
    };
  }

  return changes;
}

export function getAuditChangedFields(changes: AuditChanges): string[] {
  return Object.keys(changes).sort();
}
