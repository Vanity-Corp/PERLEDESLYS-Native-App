import couscous from "@/assets/perledeslys/perle-couscous.jpg";
import tajine from "@/assets/perledeslys/perle-tajine.jpg";
import rechta from "@/assets/perledeslys/perle-rechta.jpg";
import chakhchoukha from "@/assets/perledeslys/perle-chakhchoukha.jpg";
import baghrir from "@/assets/perledeslys/perle-baghrir.jpg";
import cornes from "@/assets/perledeslys/perle-cornes.jpg";
import makrout from "@/assets/perledeslys/perle-makrout.jpg";
import chorba from "@/assets/perledeslys/perle-chorba.jpg";
import bourek from "@/assets/perledeslys/perle-bourek.jpg";
import msemen from "@/assets/perledeslys/perle-msemen.jpg";
import mhalbi from "@/assets/perledeslys/perle-mhalbi.jpg";
import the from "@/assets/perledeslys/perle-the.jpg";
import tm7 from "@/assets/perledeslys/perle-tm7.jpg";
import founder from "@/assets/perledeslys/perle-hero-2.png";
import liveImg from "@/assets/perledeslys/perle-live.jpg";

import { FIRST_STEPS_VIDEO_ID } from "@/constants/content";
import type {
  Article,
  AppEvent,
  AppUser,
  FaqItem,
  FounderInfo,
  Live,
  Recipe,
  Video,
  WelcomeMessage,
} from "@/types/content";

export { FIRST_STEPS_VIDEO_ID };

export const founderImg = founder;
export const tm7Img = tm7;
export const liveCover = liveImg;

export const recipes: Recipe[] = [
  {
    id: "couscous-royal",
    title: "Couscous royal de Ghania",
    image: couscous,
    time: "1h30",
    difficulty: "Moyen",
    category: "Couscous",
    portions: 6,
    description:
      "Le couscous signature de la maison : semoule parfumée, bouillon de légumes mijoté et viande fondante au TM7.",
    cookidooUrl: "https://cookidoo.fr/recipes/recipe/fr-FR/r-couscous",
    isNew: true,
    ingredients: [
      { label: "Semoule moyenne", qty: "500 g" },
      { label: "Agneau", qty: "800 g" },
      { label: "Pois chiches trempés", qty: "200 g" },
      { label: "Courgettes", qty: "3" },
      { label: "Carottes", qty: "4" },
      { label: "Navet", qty: "1" },
      { label: "Ras el hanout", qty: "2 c.à.s" },
    ],
    steps: [
      "Faites revenir l'agneau au TM7 avec oignon et épices, 8 min / 120°C / sens inverse / vitesse 1.",
      "Ajoutez la tomate, les légumes durs et 1L d'eau. 35 min / Varoma / sens inverse / vitesse mijotage.",
      "Placez la semoule humidifiée dans le Varoma, posez-le et lancez 20 min / Varoma.",
      "Aérez la semoule au beurre, dressez avec viande, légumes et un peu de bouillon.",
    ],
  },
  {
    id: "tajine-poulet",
    title: "Tajine de poulet aux olives & citron confit",
    image: tajine,
    time: "55 min",
    difficulty: "Facile",
    category: "Tajines",
    portions: 4,
    description:
      "Un grand classique revisité au Thermomix TM7 : poulet fondant, olives violettes et citron confit maison.",
    cookidooUrl: "https://cookidoo.fr/recipes/recipe/fr-FR/r-tajine-poulet",
    ingredients: [
      { label: "Cuisses de poulet", qty: "6" },
      { label: "Olives violettes", qty: "150 g" },
      { label: "Citron confit", qty: "1" },
      { label: "Oignons", qty: "2" },
      { label: "Gingembre", qty: "1 c.à.c" },
      { label: "Safran", qty: "1 pincée" },
    ],
    steps: [
      "Hachez les oignons 5 sec / vitesse 5. Faites revenir avec l'huile et les épices.",
      "Ajoutez le poulet, mijotage 35 min / 100°C / sens inverse.",
      "Incorporez olives et citron confit en fin de cuisson, 5 min.",
      "Servez avec un pain maison ou de la semoule.",
    ],
  },
  {
    id: "rechta-blanche",
    title: "Rechta blanche d'Alger",
    image: rechta,
    time: "1h",
    difficulty: "Moyen",
    category: "Rechta",
    portions: 4,
    description:
      "La rechta traditionnelle algéroise, fines pâtes vapeur dans un bouillon blanc à la cannelle et au poulet.",
    cookidooUrl: "https://cookidoo.fr/recipes/recipe/fr-FR/r-rechta",
    ingredients: [
      { label: "Rechta (vermicelles plats)", qty: "500 g" },
      { label: "Poulet en morceaux", qty: "800 g" },
      { label: "Pois chiches", qty: "150 g" },
      { label: "Navet", qty: "1" },
      { label: "Cannelle", qty: "1 bâton" },
    ],
    steps: [
      "Faites revenir le poulet avec oignon, cannelle et poivre blanc au TM7.",
      "Ajoutez 1L d'eau et lancez la cuisson 30 min / 100°C.",
      "Cuisez la rechta vapeur dans le Varoma 18 min.",
      "Servez la rechta nappée du bouillon parfumé.",
    ],
  },
  {
    id: "chakhchoukha",
    title: "Chakhchoukha de Biskra",
    image: chakhchoukha,
    time: "1h15",
    difficulty: "Avancé",
    category: "Plats algériens",
    portions: 6,
    description:
      "Galettes effritées nappées d'une sauce rouge épicée et fondante au mouton — un trésor du Sud algérien.",
    cookidooUrl: "https://cookidoo.fr/recipes/recipe/fr-FR/r-chakhchoukha",
    ingredients: [
      { label: "Rougag (galettes)", qty: "400 g" },
      { label: "Mouton", qty: "600 g" },
      { label: "Tomates", qty: "5" },
      { label: "Pois chiches", qty: "200 g" },
      { label: "Paprika doux", qty: "2 c.à.s" },
    ],
    steps: [
      "Faites revenir l'oignon et la viande, ajoutez tomates, paprika, ras el hanout.",
      "Mijotez 45 min / 100°C / sens inverse au TM7.",
      "Émiettez les galettes en petits morceaux dans un grand plat.",
      "Nappez généreusement de sauce et de viande, servez bien chaud.",
    ],
  },
  {
    id: "baghrir",
    title: "Baghrir aux mille trous",
    image: baghrir,
    time: "30 min",
    difficulty: "Facile",
    category: "Baghrir",
    portions: 4,
    description: "Les crêpes algériennes alvéolées, ultra moelleuses, à napper de miel et beurre fondu.",
    cookidooUrl: "https://cookidoo.fr/recipes/recipe/fr-FR/r-baghrir",
    isNew: true,
    ingredients: [
      { label: "Semoule fine", qty: "250 g" },
      { label: "Farine", qty: "50 g" },
      { label: "Levure boulangère", qty: "1 sachet" },
      { label: "Eau tiède", qty: "650 ml" },
      { label: "Sucre", qty: "1 c.à.s" },
    ],
    steps: [
      "Mixez tous les ingrédients au TM7, 1 min / vitesse 5.",
      "Laissez reposer 30 min jusqu'à apparition de bulles.",
      "Cuisez à la poêle d'un seul côté jusqu'à formation des trous.",
      "Servez chaud avec miel et beurre fondu.",
    ],
  },
  {
    id: "cornes-gazelle",
    title: "Cornes de gazelle aux amandes",
    image: cornes,
    time: "1h45",
    difficulty: "Avancé",
    category: "Pâtisseries",
    portions: 30,
    description:
      "Les pâtisseries fines et raffinées des grandes occasions, farcies à la pâte d'amande à la fleur d'oranger.",
    cookidooUrl: "https://cookidoo.fr/recipes/recipe/fr-FR/r-cornes-gazelle",
    ingredients: [
      { label: "Amandes en poudre", qty: "500 g" },
      { label: "Sucre glace", qty: "300 g" },
      { label: "Fleur d'oranger", qty: "3 c.à.s" },
      { label: "Farine", qty: "300 g" },
      { label: "Beurre fondu", qty: "100 g" },
    ],
    steps: [
      "Préparez la pâte d'amande au TM7 : 30 sec / vitesse 5.",
      "Pétrissez la pâte fine 4 min / mode pétrin.",
      "Façonnez en croissants fins, garnissez d'amande.",
      "Cuisez 15 min à 170°C, blanc nacré.",
    ],
  },
  {
    id: "makrout",
    title: "Makrout aux dattes",
    image: makrout,
    time: "1h30",
    difficulty: "Moyen",
    category: "Pâtisseries",
    portions: 25,
    description: "Petits losanges à la semoule fourrés aux dattes, trempés dans le miel parfumé.",
    cookidooUrl: "https://cookidoo.fr/recipes/recipe/fr-FR/r-makrout",
    ingredients: [
      { label: "Semoule moyenne", qty: "500 g" },
      { label: "Pâte de dattes", qty: "400 g" },
      { label: "Beurre fondu", qty: "200 g" },
      { label: "Miel", qty: "300 g" },
      { label: "Cannelle", qty: "1 c.à.c" },
    ],
    steps: [
      "Mélangez semoule, beurre et eau de fleur d'oranger au TM7.",
      "Étalez, garnissez de pâte de dattes, refermez.",
      "Coupez en losanges, friez à l'huile chaude.",
      "Trempez immédiatement dans le miel tiède.",
    ],
  },
  {
    id: "chorba",
    title: "Chorba frik du Ramadan",
    image: chorba,
    time: "50 min",
    difficulty: "Facile",
    category: "Ramadan",
    portions: 6,
    description:
      "La soupe incontournable du f'tour : tomate, agneau, freekeh et coriandre fraîche.",
    cookidooUrl: "https://cookidoo.fr/recipes/recipe/fr-FR/r-chorba",
    isNew: true,
    ingredients: [
      { label: "Agneau coupé", qty: "300 g" },
      { label: "Freekeh", qty: "100 g" },
      { label: "Tomates pelées", qty: "400 g" },
      { label: "Coriandre", qty: "1 bouquet" },
      { label: "Ras el hanout", qty: "1 c.à.c" },
    ],
    steps: [
      "Faites revenir l'oignon et la viande au TM7.",
      "Ajoutez la tomate, le freekeh et 1.5L d'eau.",
      "Lancez 40 min / 100°C / sens inverse.",
      "Ajoutez coriandre et menthe avant de servir.",
    ],
  },
  {
    id: "bourek",
    title: "Bourek à la viande hachée",
    image: bourek,
    time: "35 min",
    difficulty: "Facile",
    category: "Ramadan",
    portions: 4,
    description:
      "Croustillants feuilletés farcis à la viande et à l'œuf, parfaits pour le f'tour.",
    cookidooUrl: "https://cookidoo.fr/recipes/recipe/fr-FR/r-bourek",
    ingredients: [
      { label: "Feuilles de brick", qty: "10" },
      { label: "Bœuf haché", qty: "400 g" },
      { label: "Œufs", qty: "2" },
      { label: "Persil", qty: "1 bouquet" },
      { label: "Cannelle", qty: "1 pincée" },
    ],
    steps: [
      "Hachez l'oignon 5 sec / vitesse 5.",
      "Faites revenir avec la viande et les épices 10 min.",
      "Garnissez les bricks, roulez serré.",
      "Friez ou cuisez au four 15 min à 200°C.",
    ],
  },
  {
    id: "msemen",
    title: "Msemen au beurre & miel",
    image: msemen,
    time: "45 min",
    difficulty: "Moyen",
    category: "Recettes rapides",
    portions: 6,
    description: "Crêpes feuilletées dorées, parfaites pour le petit-déjeuner ou le goûter algérien.",
    cookidooUrl: "https://cookidoo.fr/recipes/recipe/fr-FR/r-msemen",
    ingredients: [
      { label: "Farine", qty: "400 g" },
      { label: "Semoule fine", qty: "200 g" },
      { label: "Beurre", qty: "100 g" },
      { label: "Eau tiède", qty: "350 ml" },
      { label: "Sel", qty: "1 c.à.c" },
    ],
    steps: [
      "Pétrissez farine, semoule, sel et eau 4 min / mode pétrin TM7.",
      "Façonnez des boules, étalez très finement.",
      "Pliez en carrés avec beurre, cuisez à la poêle.",
      "Servez chaud nappé de miel.",
    ],
  },
  {
    id: "mhalbi",
    title: "Mhalbi à la fleur d'oranger",
    image: mhalbi,
    time: "20 min + frais",
    difficulty: "Facile",
    category: "Pâtisseries",
    portions: 6,
    description: "Crème de riz parfumée, fleur d'oranger et cannelle — la douceur des soirs d'été.",
    cookidooUrl: "https://cookidoo.fr/recipes/recipe/fr-FR/r-mhalbi",
    ingredients: [
      { label: "Farine de riz", qty: "80 g" },
      { label: "Lait", qty: "1 L" },
      { label: "Sucre", qty: "120 g" },
      { label: "Fleur d'oranger", qty: "2 c.à.s" },
      { label: "Pistaches", qty: "50 g" },
    ],
    steps: [
      "Mélangez tous les ingrédients (sauf pistaches) au TM7.",
      "Lancez 12 min / 90°C / vitesse 3.",
      "Versez en verrines, laissez prendre 2h au frais.",
      "Décorez de pistaches concassées et pétales de rose.",
    ],
  },
  {
    id: "the-menthe",
    title: "Thé à la menthe traditionnel",
    image: the,
    time: "15 min",
    difficulty: "Facile",
    category: "Boissons",
    portions: 6,
    description:
      "Le thé vert sucré à la menthe fraîche, symbole d'accueil et de partage.",
    cookidooUrl: "https://cookidoo.fr/recipes/recipe/fr-FR/r-the-menthe",
    ingredients: [
      { label: "Thé vert gunpowder", qty: "2 c.à.s" },
      { label: "Menthe fraîche", qty: "1 grand bouquet" },
      { label: "Sucre", qty: "100 g" },
      { label: "Eau", qty: "1 L" },
    ],
    steps: [
      "Rincez le thé à l'eau bouillante, jetez.",
      "Au TM7 : eau + thé, 8 min / 100°C / vitesse 1.",
      "Ajoutez menthe et sucre, 3 min / 90°C.",
      "Servez de très haut pour aérer le thé.",
    ],
  },
];

export const videos: Video[] = [
  {
    id: FIRST_STEPS_VIDEO_ID,
    title: "Mes premiers pas avec le Thermomix TM7",
    image: tm7,
    duration: "35 min",
    category: "Mes premiers pas",
    description:
      "La vidéo offerte par Ghania à toutes ses nouvelles clientes : présentation complète, première utilisation, conseils essentiels et premiers réflexes pour cuisiner sereinement avec votre TM7.",
    progress: 0,
  },
  {
    id: "tm7-demarrage",
    title: "Mise en service complète du Thermomix TM7",
    image: tm7,
    duration: "32 min",
    category: "Premier démarrage",
    description:
      "Présentation complète, déballage, premier branchement et configuration de votre TM7.",
    progress: 45,
  },
  {
    id: "ustensiles",
    title: "Utiliser tous les ustensiles du TM7",
    image: tm7,
    duration: "18 min",
    category: "Tutoriel TM7",
    description: "Fouet, mariposa, spatule, Varoma : à quoi sert chaque accessoire.",
    progress: 70,
  },
  {
    id: "nettoyage",
    title: "Nettoyer son TM7 sans abîmer le bol",
    image: tm7,
    duration: "9 min",
    category: "Tutoriel TM7",
    description: "Le programme nettoyage automatique et les bons réflexes au quotidien.",
  },
  {
    id: "vapeur",
    title: "Maîtriser la cuisson vapeur",
    image: chorba,
    duration: "14 min",
    category: "Tutoriel TM7",
    description: "Légumes, poisson, semoule au Varoma : tous les réglages.",
    progress: 22,
  },
  {
    id: "astuces-tm7",
    title: "10 astuces qui changent tout sur TM7",
    image: tajine,
    duration: "16 min",
    category: "Astuces",
    description: "Les raccourcis que seules les pros connaissent.",
  },
  {
    id: "fonctions-tm7",
    title: "Toutes les fonctions du TM7 expliquées",
    image: tm7,
    duration: "24 min",
    category: "Tutoriel TM7",
    description: "Sens inverse, mode mijotage, fermentation, sous-vide…",
  },
  {
    id: "couscous-video",
    title: "Couscous royal : la recette en vidéo",
    image: couscous,
    duration: "22 min",
    category: "Recette vidéo",
    description: "Suivez Ghania pas à pas pour réussir son couscous signature.",
    progress: 60,
  },
  {
    id: "patisseries-orientales",
    title: "Pâtisseries orientales au TM7",
    image: cornes,
    duration: "28 min",
    category: "Recette vidéo",
    description: "Cornes de gazelle, makrout, ghribia : les bases incontournables.",
  },
];

export const articles: Article[] = [
  {
    id: "organisation-ramadan",
    title: "Organiser ses menus de Ramadan",
    excerpt: "Mes 5 règles d'or pour un mois serein et délicieux en cuisine.",
    image: chorba,
    readTime: "6 min",
    category: "Ramadan",
  },
  {
    id: "entretien-tm7",
    title: "Entretien hebdomadaire du TM7",
    excerpt: "Une routine simple pour garder votre robot impeccable des années.",
    image: tm7,
    readTime: "4 min",
    category: "Entretien",
  },
  {
    id: "batch-cooking",
    title: "Batch cooking algérien : 1h pour la semaine",
    excerpt: "Préparez sauces, semoule et viandes en série pour gagner du temps.",
    image: tajine,
    readTime: "8 min",
    category: "Organisation",
  },
  {
    id: "epices",
    title: "Les épices essentielles dans ma cuisine",
    excerpt: "Ras el hanout, cumin, paprika fumé — comment les doser au TM7.",
    image: makrout,
    readTime: "5 min",
    category: "Astuces",
  },
  {
    id: "semoule",
    title: "Réussir sa semoule à tous les coups",
    excerpt: "L'astuce du roulage et de la vapeur Varoma.",
    image: couscous,
    readTime: "4 min",
    category: "Techniques",
  },
  {
    id: "the",
    title: "L'art du thé à la menthe algérien",
    excerpt: "Gestes, températures, sucre : tous mes secrets.",
    image: the,
    readTime: "5 min",
    category: "Inspiration",
  },
];

export const lives: Live[] = [
  {
    id: "live-ramadan",
    title: "Spécial Ramadan : menu f'tour complet",
    date: "Vendredi 28 mars",
    time: "20h00",
    image: liveImg,
    status: "À venir",
    description:
      "On prépare ensemble un f'tour complet : chorba frik, bourek, dattes farcies et mhalbi.",
    platform: "Zoom privé",
  },
  {
    id: "live-pat",
    title: "Atelier pâtisseries orientales",
    date: "Mardi 2 avril",
    time: "14h30",
    image: cornes,
    status: "À venir",
    description: "Cornes de gazelle, makrout au four et ghribia bahla en direct.",
    platform: "YouTube Live",
  },
  {
    id: "live-q-r",
    title: "Q&R : tous vos secrets TM7",
    date: "Jeudi 4 avril",
    time: "21h00",
    image: tm7,
    status: "À venir",
    description: "Une heure de questions/réponses en live pour tout savoir sur votre TM7.",
    platform: "YouTube privé",
  },
  {
    id: "replay-couscous",
    title: "Replay : Couscous royal façon Ghania",
    date: "18 mars",
    time: "Replay 1h45",
    image: couscous,
    status: "Replay",
    description: "Le live le plus regardé : votre couscous royal pas à pas.",
    platform: "Replay YouTube",
  },
  {
    id: "replay-tajine",
    title: "Replay : Tajine poulet citron confit",
    date: "10 mars",
    time: "Replay 55 min",
    image: tajine,
    status: "Replay",
    description: "Maîtrisez le tajine fondant avec les astuces de Ghania.",
    platform: "Replay YouTube",
  },
];

export const user: AppUser = {
  name: "Yasmine Bencherif",
  firstName: "Yasmine",
  email: "yasmine.b@email.com",
  phone: "+33 6 24 87 15 92",
  avatar: "https://i.pravatar.cc/200?img=44",
  memberSince: "Janvier 2025",
  invitation: "PDL-7821-LYS",
  products: [
    { id: "tm7", name: "Thermomix TM7", purchasedAt: "12 février 2025", image: tm7 },
  ],
};

export const founderInfo: FounderInfo = {
  name: "Ghania",
  fullName: "Ghania, votre conseillère Thermomix",
  bio: "Conseillère Thermomix classée parmi les meilleures de France, spécialisée dans les recettes algériennes adaptées au TM7.",
  avatar: founder,
};

// Genère la semaine en cours autour d'aujourd'hui
const today = new Date();
const isoDay = (offset: number) => {
  const d = new Date(today);
  d.setDate(today.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

export const events: AppEvent[] = [
  { id: "ev1", title: "Live : F'tour express", date: isoDay(0), time: "20:00", type: "live", description: "Menu du f'tour en 45 min chrono au TM7." },
  { id: "ev2", title: "Nouvelle recette : Mhalbi rose", date: isoDay(1), time: "10:00", type: "publication", description: "Publication d'une nouvelle recette signature." },
  { id: "ev3", title: "Atelier pâtisseries orientales", date: isoDay(2), time: "14:30", type: "atelier", description: "Cornes de gazelle et makrout en direct." },
  { id: "ev4", title: "Q&R Thermomix TM7", date: isoDay(3), time: "21:00", type: "live", description: "Vos questions, mes réponses en live." },
  { id: "ev5", title: "Rappel : préparer la chorba", date: isoDay(4), time: "17:00", type: "rappel" },
  { id: "ev6", title: "Live : Couscous royal", date: isoDay(5), time: "19:30", type: "live", description: "Le couscous signature, pas à pas." },
  { id: "ev7", title: "Nouveau tutoriel TM7", date: isoDay(6), time: "09:00", type: "publication" },
  { id: "ev8", title: "Atelier batch cooking", date: isoDay(8), time: "11:00", type: "atelier" },
  { id: "ev9", title: "Live mensuel privé", date: isoDay(12), time: "20:30", type: "live" },
];

export const welcomeMessage: WelcomeMessage = {
  introTitle: "Mise en service du TM7",
  introContent: "La vidéo de mise en service de votre Thermomix TM7.",
  steps: [],
  subject: "Bienvenue dans l'aventure Thermomix TM7",
  body: `Coucou,

Félicitations pour la réception de ton Thermomix TM7.

Pour t'accompagner dans tes premiers pas, j'ai fait spécialement pour toi une vidéo de mise en service, comme si nous étions ensemble, afin que tu puisses la regarder selon tes disponibilités. J'y ai mis beaucoup de temps et d'attention pour que tout soit expliqué parfaitement, comme une vraie mise en service en visio.

Il est très important que tu regardes la vidéo entièrement, car tu y trouveras :
• la présentation complète du TM7 ;
• toutes les étapes indispensables pour bien le prendre en main ;
• mes conseils pour cuisiner sereinement dès les premiers jours.

Cette vidéo est strictement réservée à mes clientes. Merci de ne pas la partager : elle représente de nombreuses heures de travail et beaucoup d'amour pour mon métier.

J'ai absolument besoin de ton retour écrit après le visionnage : dis-moi si tout est clair, si tu as pu démarrer sereinement une recette, et si tu te sens à l'aise avec ton Thermomix. C'est essentiel pour moi afin de vérifier que tout va bien.

Avec tout mon cœur,
Ghania`,
};

export const faqItems: FaqItem[] = [
  {
    q: "Comment accéder à la vidéo « Mes premiers pas » ?",
    a: "Elle est directement intégrée dans l'application, dans l'onglet Accueil > Mes premiers pas. Plus besoin de lien YouTube ni de mot de passe.",
  },
  {
    q: "Puis-je reprendre une vidéo là où je m'étais arrêtée ?",
    a: "Oui. L'application mémorise automatiquement la minute exacte de votre dernier visionnage. Retrouvez-la dans Profil > Historique.",
  },
  {
    q: "Comment prendre des notes pendant un visionnage ?",
    a: "Utilisez le bouton flottant en bas à droite. Vos notes sont enregistrées avec une référence vers le contenu consulté.",
  },
  {
    q: "Où retrouver mes notes ?",
    a: "Profil > Mes notes — toutes vos notes sont rangées avec un lien direct vers la vidéo ou la recette concernée.",
  },
  {
    q: "Comment voir le calendrier des lives ?",
    a: "Le mini-calendrier de la semaine est visible sur la page d'accueil. Cliquez dessus pour ouvrir la vue mensuelle complète.",
  },
  {
    q: "Comment modifier mes informations personnelles ?",
    a: "Profil > Paramètres : vous pouvez y changer votre nom, votre email, votre téléphone et vos préférences.",
  },
  {
    q: "Mes données sont-elles partagées ?",
    a: "Non. Vos notes, votre historique et vos favoris restent privés sur votre appareil.",
  },
  {
    q: "Comment contacter Ghania ?",
    a: "Directement depuis l'application, via la section Support de votre profil.",
  },
];
