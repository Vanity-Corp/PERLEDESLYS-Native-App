import { useState } from 'react';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth.service';
export default function ForgotPassword() { const [email, setEmail] = useState(''); const [sent, setSent] = useState(false); return <Screen><Card><Text variant="title">Réinitialisation</Text><Text muted>Nous simulons l’envoi d’un email de récupération.</Text><Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />{sent ? <Text>Un email mocké a été envoyé.</Text> : null}<Button onPress={async () => { await authService.forgotPassword(email); setSent(true); }}>Envoyer</Button></Card></Screen>; }
