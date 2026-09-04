import { format } from "date-fns";
import { Link } from "expo-router";
import {
  ArrowLeft,
  Bell,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
  Palette,
  Radio,
  Sparkles,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useEventsQuery, useHardRefresh } from "@/lib/content-queries";
import type { AppEvent } from "@/types/content";

// Web source: kitchen-haven-club/src/routes/app/calendar/index.tsx
// Task 15 built "mois" (month) view + view switcher + prev/next navigation.
// Task 16 completes "semaine"/"jour"/"année".
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

const iso = (d: Date) => format(d, "yyyy-MM-dd");

function typeColor(t: AppEvent["type"]) {
  return t === "live"
    ? "bg-primary"
    : t === "atelier"
      ? "bg-accent"
      : t === "publication"
        ? "bg-rose-deep"
        : "bg-gold";
}

function typeIcon(t: AppEvent["type"]): LucideIcon {
  switch (t) {
    case "live":
      return Radio;
    case "atelier":
      return Palette;
    case "publication":
      return Sparkles;
    default:
      return Bell;
  }
}

function weekStart(d: Date) {
  const day = (d.getDay() + 6) % 7;
  const r = new Date(d);
  r.setDate(d.getDate() - day);
  r.setHours(0, 0, 0, 0);
  return r;
}

export default function CalendarScreen() {
  const eventsQ = useEventsQuery();
  const events = eventsQ.data ?? [];
  const onRefresh = useHardRefresh([["events"]]);
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
      <ScrollView
        contentContainerClassName="pb-16"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={eventsQ.isFetching}
            onRefresh={onRefresh}
          />
        }
      >
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
          {view === "semaine" && <WeekList cursor={cursor} eventsByDate={eventsByDate} />}
          {view === "jour" && <DayList date={cursor} eventsByDate={eventsByDate} />}
          {view === "année" && (
            <YearGrid
              cursor={cursor}
              eventsByDate={eventsByDate}
              onSelect={(d) => {
                setCursor(d);
                setView("mois");
              }}
            />
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

function WeekList({
  cursor,
  eventsByDate,
}: {
  cursor: Date;
  eventsByDate: Record<string, AppEvent[]>;
}) {
  const start = weekStart(cursor);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  return (
    <View className="gap-2">
      {days.map((d, i) => {
        const list = eventsByDate[iso(d)] ?? [];
        return (
          <View key={i} className="rounded-2xl border border-border bg-card p-3">
            <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {DAYS[i]} {d.getDate()} {MONTHS[d.getMonth()].slice(0, 4)}.
            </Text>
            {list.length === 0 ? (
              <Text className="mt-1 text-xs text-muted-foreground">Aucun évènement</Text>
            ) : (
              <View className="mt-2 gap-1.5">
                {list.map((e) => (
                  <EventRow key={e.id} e={e} />
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

function DayList({
  date,
  eventsByDate,
}: {
  date: Date;
  eventsByDate: Record<string, AppEvent[]>;
}) {
  const list = eventsByDate[iso(date)] ?? [];
  if (list.length === 0) {
    return (
      <View className="items-center rounded-2xl border border-border bg-card p-8">
        <Text className="text-center text-sm text-muted-foreground">Pas d'évènement ce jour.</Text>
      </View>
    );
  }
  return (
    <View className="gap-2">
      {list.map((e) => (
        <EventRow key={e.id} e={e} big />
      ))}
    </View>
  );
}

function YearGrid({
  cursor,
  eventsByDate,
  onSelect,
}: {
  cursor: Date;
  eventsByDate: Record<string, AppEvent[]>;
  onSelect: (d: Date) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {MONTHS.map((m, idx) => {
        const count = Object.entries(eventsByDate).filter(([k]) => {
          const d = new Date(k);
          return d.getFullYear() === cursor.getFullYear() && d.getMonth() === idx;
        }).length;
        return (
          <Pressable
            key={m}
            onPress={() => onSelect(new Date(cursor.getFullYear(), idx, 1))}
            style={{ width: "31.5%" }}
            className="rounded-2xl border border-border bg-card p-3"
          >
            <Text className="font-display text-sm text-foreground">{m}</Text>
            <Text className="mt-1 text-[10px] text-muted-foreground">
              {count} évènement{count !== 1 ? "s" : ""}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function EventRow({ e, big }: { e: AppEvent; big?: boolean }) {
  const content = (
    <View
      className={`flex-row items-start gap-2 ${
        big ? "rounded-2xl border border-border bg-card p-4" : ""
      }`}
    >
      <View
        className={`h-8 w-8 items-center justify-center rounded-lg ${typeColor(e.type)}`}
      >
        <Icon as={typeIcon(e.type)} size={16} className="text-primary-foreground" />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-medium leading-tight text-foreground">{e.title}</Text>
        <Text className="mt-0.5 text-[11px] text-muted-foreground">
          {e.time}
          {e.description ? ` · ${e.description}` : ""}
        </Text>
      </View>
    </View>
  );

  // Live-linked events (created from a Live) open the live/replay player.
  if (e.liveId) {
    return (
      <Link
        href={{ pathname: "/app/lives/[liveId]", params: { liveId: e.liveId } }}
        asChild
      >
        <Pressable>{content}</Pressable>
      </Link>
    );
  }
  return content;
}
