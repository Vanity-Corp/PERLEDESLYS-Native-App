import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
export default function ProtectedLayout() { const { isAuthenticated } = useAuth(); if (!isAuthenticated) return <Redirect href="/(auth)/login" />; return <Stack screenOptions={{ headerShown: false }} />; }
