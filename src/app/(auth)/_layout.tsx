import { Stack } from "expo-router";

// No tab bar, no native header — matches the web app's Landing/Login
// pages, which render outside <MobileShell>'s nav chrome (hideNav).
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
