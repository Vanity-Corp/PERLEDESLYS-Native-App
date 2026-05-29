export type ProfileFormValues = { name: string; avatarUrl: string };
export function validateProfile(values: ProfileFormValues) {
  const errors: Partial<Record<keyof ProfileFormValues, string>> = {};
  if (values.name.trim().length < 2) errors.name = 'Le nom est trop court.';
  if (!values.avatarUrl.startsWith('http')) errors.avatarUrl = 'URL avatar invalide.';
  return errors;
}
