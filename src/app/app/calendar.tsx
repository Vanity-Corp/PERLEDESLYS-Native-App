import { Link } from "expo-router";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { events } from "@/lib/mock-data";
import type { AppEvent } from "@/types/content";

// Web source: kitchen-haven-club/src/routes/app/calendar/index.tsx
// Task 15: "mois" (month) view + view switcher + prev/next navigation, all functional.
// Task 16 (not yet built): "semaine"/"jour"/"année" views are honest stubs below.
type CalendarView = "jour" | "semaine" | "mois" | "année";

const VIEWS: CalendarView[] = ["jour", "semaine", "mois", "année"];
const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const iso = (d: Date) => d.toISOString().slice(0, 10);

function typeColor(t: AppEvent["type"]) {
  return t === "live"
    ? "bg-primary"
    : t === "atelier"
      ? "bg-accent"
      : t === "publication"
        ? "bg-rose-deep"
        : "bg-gold";
}

function weekStart(d: Date) {
  const day = (d.getDay() + 6) % 7;
  const r = new Date(d);
  r.setDate(d.getDate() - day);
  r.setHours(0, 0, 0, 0);
  return r;
}

export default function CalendarScreen() {
  const [view, setView] = useState<CalendarView>("mois");
  const [cursor, setCursor] = useState(new Date());

  const eventsByDate = events.reduce<Record<string, AppEvent[]>>((acc, e) => {
    (acc[e.date] ||= []).push(e);
    return acc;
  }, {});

  const goPrev = () => {
    const d = new Date(cursor);
    if (view === "année") d.setFullYear(d.getFullYear() - 1);
    else if (view === "mois") d.setMonth(d.getMonth() - 1);
    else if (view === "semaine") d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCursor(d);
  };

  const goNext = () => {
    const d = new Date(cursor);
    if (view === "année") d.setFullYear(d.getFullYear() + 1);
    else if (view === "mois") d.setMonth(d.getMonth() + 1);
    else if (view === "semaine") d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCursor(d);
  };

  const label =
    view === "année"
      ? String(cursor.getFullYear())
      : view === "mois"
        ? `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`
        : view === "semaine"
          ? `Semaine du ${weekStart(cursor).getDate()} ${MONTHS[weekStart(cursor).getMonth()]}`
          : cursor.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerClassName="pb-16" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-3 px-5 pb-2 pt-6">
          <Link href="/app" asChild>
            <Pressable className="-ml-2 rounded-full p-2">
              <Icon as={ArrowLeft} size={20} className="text-foreground" />
            </Pressable>
          </Link>
          <Text className="font-display text-2xl font-medium tracking-tight text-foreground">
            Calendrier
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-5 pb-1"
          className="mt-3"
        >
          <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as CalendarView)}>
            {VIEWS.map((v) => (
              <ToggleGroupItem
                key={v}
                value={v}
                className="mr-2 h-auto min-w-0 rounded-full border border-border bg-card px-4 py-2"
              >
                <Text className="text-xs font-medium capitalize">{v}</Text>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </ScrollView>

        <View className="mt-4 flex-row items-center justify-between px-5">
          <Pressable
            onPress={goPrev}
            className="h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
          >
            <Icon as={ChevronLeft} size={16} className="text-foreground" />
          </Pressable>
          <Text className="font-display text-lg text-foreground">{label}</Text>
          <Pressable
            onPress={goNext}
            className="h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
          >
            <Icon as={ChevronRight} size={16} className="text-foreground" />
          </Pressable>
        </View>

        <View className="mt-4 px-5">
          {view === "mois" && (
            <MonthGrid
              cursor={cursor}
              eventsByDate={eventsByDate}
              onSelect={(d) => {
                setCursor(d);
                setView("jour");
              }}
            />
          )}
          {view !== "mois" && (
            <View className="items-center rounded-2xl border border-border bg-card p-8">
              <Text className="text-center text-sm text-muted-foreground">
                Vue "{view}" à venir.
              </Text>
            </View>
          )}
        </View>

        <View className="mt-6 flex-row flex-wrap gap-3 px-5">
          <Legend color="bg-primary" label="Live" />
          <Legend color="bg-accent" label="Atelier" />
          <Legend color="bg-rose-deep" label="Publication" />
          <Legend color="bg-gold" label="Rappel" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View className={`h-2 w-2 rounded-full ${color}`} />
      <Text className="text-[10px] text-muted-foreground">{label}</Text>
    </View>
  );
}

function MonthGrid({
  cursor,
  eventsByDate,
  onSelect,
}: {
  cursor: Date;
  eventsByDate: Record<string, AppEvent[]>;
  onSelect: (d: Date) => void;
}) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
  const todayIso = iso(new Date());

  return (
    <View>
      <View className="mb-1 flex-row">
        {DAYS.map((d) => (
          <View key={d} className="flex-1 items-center py-1">
            <Text className="text-[9px] uppercase tracking-wider text-muted-foreground">{d}</Text>
          </View>
        ))}
      </View>
      <View className="flex-row flex-wrap">
        {cells.map((d, i) => {
          if (!d) return <View key={i} style={{ width: `${100 / 7}%` }} className="aspect-square p-0.5" />;
          const dayIso = iso(d);
          const dayEvents = eventsByDate[dayIso] ?? [];
          const isToday = dayIso === todayIso;
          const dots = dayEvents.slice(0, 3);

          const cellContent = (
            <View className="flex-1 items-center justify-start rounded-xl py-1">
              <Text
                className={`text-xs font-semibold ${
                  isToday ? "text-primary-foreground" : "text-foreground"
                }`}
              >
                {d.getDate()}
              </Text>
              <View className="mt-1 flex-row flex-wrap justify-center gap-0.5">
                {dots.map((e) => (
                  <View key={e.id} className={`h-1 w-1 rounded-full ${typeColor(e.type)}`} />
                ))}
              </View>
            </View>
          );

          return (
            <View key={i} style={{ width: `${100 / 7}%` }} className="aspect-square p-0.5">
              {isToday ? (
                <Pressable onPress={() => onSelect(d)} className="flex-1 overflow-hidden rounded-xl">
                  <GradientView tone="luxe" className="flex-1">
                    {cellContent}
                  </GradientView>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => onSelect(d)}
                  className={`flex-1 rounded-xl ${
                    dayEvents.length > 0 ? "bg-secondary" : "border border-border bg-card"
                  }`}
                >
                  {cellContent}
                </Pressable>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
