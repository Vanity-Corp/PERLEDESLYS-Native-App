import { useState } from 'react';
import { Switch, View } from 'react-native';
import { router } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { authStore } from '@/store/auth.store';
import { authValidation, type AccessCodeFormValues, type LoginFormValues } from '@/schemas/auth.schema';
import { getErrorMessage } from '@/utils/api-error';
import { Spacing } from '@/constants/theme';

export function LoginForm() {
  const [mode, setMode] = useState<'password' | 'code'>('password');
  const [values, setValues] = useState<LoginFormValues & AccessCodeFormValues>({ email: 'premium@perledelys.app', password: 'password', accessCode: 'LYS-PRIVE-2026', remember: true });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit() {
    const validation = mode === 'password' ? authValidation.login(values) : authValidation.access(values);
    setErrors(validation as Record<string, string>);
    if (Object.keys(validation).length > 0) return;
    setLoading(true); setApiError('');
    try { if (mode === 'password') await authStore.login(values); else await authStore.loginWithAccessCode(values); router.replace('/(tabs)'); } catch (error) { setApiError(getErrorMessage(error)); } finally { setLoading(false); }
  }
  return <View style={{ gap: Spacing.four }}><View style={{ flexDirection: 'row', gap: Spacing.two }}><Button variant={mode === 'password' ? 'primary' : 'secondary'} onPress={() => setMode('password')}>Email</Button><Button variant={mode === 'code' ? 'primary' : 'secondary'} onPress={() => setMode('code')}>Code privé</Button></View><Input label="Email" autoCapitalize="none" keyboardType="email-address" value={values.email} onChangeText={(email) => setValues((v) => ({ ...v, email }))} error={errors.email} />{mode === 'password' ? <Input label="Mot de passe" secureTextEntry value={values.password} onChangeText={(password) => setValues((v) => ({ ...v, password }))} error={errors.password} /> : <Input label="Code d’accès" autoCapitalize="characters" value={values.accessCode} onChangeText={(accessCode) => setValues((v) => ({ ...v, accessCode }))} error={errors.accessCode} />}<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text>Se souvenir de moi</Text><Switch value={values.remember} onValueChange={(remember) => setValues((v) => ({ ...v, remember }))} /></View>{apiError ? <Text style={{ color: '#B94242' }}>{apiError}</Text> : null}<Button loading={loading} onPress={submit}>Accéder à l’espace</Button></View>;
}
