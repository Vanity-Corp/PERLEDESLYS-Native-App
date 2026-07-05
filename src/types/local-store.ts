import type { ImageSourcePropType } from "react-native";

export type Note = {
  id: string;
  text: string;
  createdAt: number;
  contextLabel: string; // ex: "Vidéo : Mes premiers pas"
  contextHref: string; // expo-router path, ex: "/videos/premiers-pas-tm7"
};

export type HistoryEntry = {
  videoId: string;
  title: string;
  image: ImageSourcePropType;
  category: string;
  duration: string; // affichage
  progress: number; // 0-100
  positionSec: number; // secondes
  totalSec: number;
  updatedAt: number;
};

export type UserSettings = {
  name: string;
  firstName: string;
  email: string;
  phone: string;
  notifications: boolean;
  darkTheme: boolean;
  newsletter: boolean;
};
