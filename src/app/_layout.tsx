import { Stack } from 'expo-router';
import { AppProvider } from '@/providers/AppProvider';

export default function RootLayout() {
  return <AppProvider><Stack screenOptions={{ headerShown: false }}><Stack.Screen name="(auth)" /><Stack.Screen name="(tabs)" /><Stack.Screen name="(protected)" /><Stack.Screen name="modal" options={{ presentation: 'modal' }} /></Stack></AppProvider>;
}
