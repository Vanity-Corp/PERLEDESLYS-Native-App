import '@/global.css';
import { ThemeProvider, DarkTheme, DefaultTheme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { authStore } from '@/store/auth.store';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

function Bootstrap({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const { isHydrating } = useAuth();
  useEffect(() => { void authStore.hydrate().finally(() => setReady(true)); }, []);
  useEffect(() => { if (ready && !isHydrating) void SplashScreen.hideAsync().catch(() => undefined); }, [ready, isHydrating]);
  if (!ready || isHydrating) return null;
  return <>{children}</>;
}

export function AppProvider({ children }: PropsWithChildren) {
  const { scheme } = useTheme();
  useEffect(() => { if (Platform.OS === 'web') document.documentElement.classList.toggle('dark', scheme === 'dark'); }, [scheme]);
  return <GestureHandlerRootView style={{ flex: 1 }}><ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}><Bootstrap>{children}</Bootstrap></ThemeProvider></GestureHandlerRootView>;
}
