import { useState } from 'react';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/use-auth';
import { authStore } from '@/store/auth.store';
import { userService } from '@/services/user.service';
import { validateProfile } from '@/schemas/profile.schema';
export default function EditProfile() { const { user } = useAuth(); const [values, setValues] = useState({ name: user?.name ?? '', avatarUrl: user?.avatarUrl ?? '' }); const [errors, setErrors] = useState<Record<string, string>>({}); return <Screen><Card><Text variant="title">Modifier profil</Text><Input label="Nom" value={values.name} onChangeText={(name) => setValues((v) => ({ ...v, name }))} error={errors.name} /><Input label="Avatar URL" value={values.avatarUrl} onChangeText={(avatarUrl) => setValues((v) => ({ ...v, avatarUrl }))} error={errors.avatarUrl} /><Button onPress={async () => { const nextErrors = validateProfile(values); setErrors(nextErrors); if (!user || Object.keys(nextErrors).length) return; const nextUser = await userService.updateProfile(user, values); authStore.setUser(nextUser); router.back(); }}>Enregistrer</Button></Card></Screen>; }
