import type { ImageSourcePropType } from "react-native";

export type Recipe = {
  id: string;
  title: string;
  image: ImageSourcePropType;
  time: string;
  difficulty: "Facile" | "Moyen" | "Avancé";
  category: string;
  portions: number;
  description: string;
  cookidooUrl: string;
  isNew?: boolean;
  ingredients: { label: string; qty: string }[];
  steps: string[];
};

export type Video = {
  id: string;
  title: string;
  image: ImageSourcePropType;
  duration: string;
  category: string;
  description: string;
  progress?: number;
};

export type Article = {
  id: string;
  title: string;
  excerpt: string;
  image: ImageSourcePropType;
  readTime: string;
  category: string;
};

export type Live = {
  id: string;
  title: string;
  date: string;
  time: string;
  image: ImageSourcePropType;
  status: "À venir" | "En direct" | "Replay";
  description: string;
  platform: string;
};

export type AppEvent = {
  id: string;
  title: string;
  date: string; // ISO yyyy-mm-dd
  time: string;
  type: "live" | "atelier" | "publication" | "rappel";
  description?: string;
};

export type UserProduct = {
  id: string;
  name: string;
  purchasedAt: string;
  image: ImageSourcePropType;
};

export type AppUser = {
  name: string;
  firstName: string;
  email: string;
  phone: string;
  avatar: string; // remote URL
  memberSince: string;
  invitation: string;
  products: UserProduct[];
};

export type FounderInfo = {
  name: string;
  fullName: string;
  bio: string;
  avatar: ImageSourcePropType;
};

export type FaqItem = {
  q: string;
  a: string;
};

export type WelcomeMessage = {
  subject: string;
  body: string;
};
