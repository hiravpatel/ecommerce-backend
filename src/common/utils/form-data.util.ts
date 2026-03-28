export function parseJsonFormValue<TValue>(value: TValue | string): TValue | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    return value;
  }

  return JSON.parse(value) as TValue;
}

export function parseStringArrayFormValue(value: string[] | string | undefined) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value;
  }

  const parsed = parseJsonFormValue<string[] | string>(value);
  return Array.isArray(parsed) ? parsed : [parsed];
}
