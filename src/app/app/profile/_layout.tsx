import { Stack } from "expo-router";

// Same rationale as recipes/_layout.tsx: one "Profil" tab, real push/pop
// to favorites/history/notes/settings/faq/tips underneath it.
export default function ProfileLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
