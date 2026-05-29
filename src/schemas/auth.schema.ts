export type LoginFormValues = { email: string; password: string; remember: boolean };
export type AccessCodeFormValues = { email: string; accessCode: string; remember: boolean };
export type ForgotPasswordValues = { email: string };
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const authValidation = {
  login(values: LoginFormValues) {
    const errors: Partial<Record<keyof LoginFormValues, string>> = {};
    if (!emailRegex.test(values.email)) errors.email = 'Email invalide.';
    if (values.password.length < 6) errors.password = '6 caractères minimum.';
    return errors;
  },
  access(values: AccessCodeFormValues) {
    const errors: Partial<Record<keyof AccessCodeFormValues, string>> = {};
    if (!emailRegex.test(values.email)) errors.email = 'Email invalide.';
    if (values.accessCode.trim().length < 8) errors.accessCode = 'Code trop court.';
    return errors;
  },
};
