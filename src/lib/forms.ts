export type FieldErrors<T extends Record<string, unknown>> = Partial<Record<keyof T, string>>;
export function hasErrors<T extends Record<string, unknown>>(errors: FieldErrors<T>) { return Object.keys(errors).length > 0; }
