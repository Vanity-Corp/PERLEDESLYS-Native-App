import { Link } from "expo-router";
import { Bell, CalendarDays, ChevronRight, Palette, Radio, Sparkles } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { events } from "@/lib/mock-data";
import type { AppEvent } from "@/types/content";

// Web source: kitchen-haven-club/src/components/MiniCalendar.tsx

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function startOfWeek(d: Date) {
  const day = (d.getDay() + 6) % 7; // lundi=0
  const r = new Date(d);
  r.setDate(d.getDate() - day);
  r.setHours(0, 0, 0, 0);
  return r;
}

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function typeIcon(t: AppEvent["type"]) {
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

function MiniCalendar() {
  const today = new Date();
  const start = startOfWeek(today);
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
  const todayIso = iso(today);

  const eventsByDate = events.reduce<Record<string, AppEvent[]>>((acc, e) => {
    (acc[e.date] ||= []).push(e);
    return acc;
  }, {});

  const weekEvents = week.flatMap((d) => eventsByDate[iso(d)] ?? []).slice(0, 3);

  return (
    <Link href="/app/calendar" asChild>
      <Pressable className="mx-5 mt-3 rounded-3xl border border-border bg-card p-4 shadow-sm shadow-black/5">
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <GradientView tone="luxe" className="h-9 w-9 items-center justify-center rounded-xl">
              <Icon as={CalendarDays} size={16} className="text-primary-foreground" />
            </GradientView>
            <View>
              <Text className="font-display text-lg leading-none text-foreground">Ma semaine</Text>
              <Text className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                Lives & ateliers
              </Text>
            </View>
          </View>
          <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
        </View>

        <View className="flex-row gap-1">
          {week.map((d, i) => {
            const dayIso = iso(d);
            const isToday = dayIso === todayIso;
            const has = (eventsByDate[dayIso] ?? []).length > 0;

            const cellClassName = cn(
              "flex-1 flex-col items-center rounded-xl py-2",
              !isToday && has && "bg-secondary",
            );
            const textClassName = cn(isToday && "text-primary-foreground");
            const dotClassName = cn(
              "mt-1 h-1 w-1 rounded-full",
              has ? (isToday ? "bg-background" : "bg-primary") : "bg-transparent",
            );

            const content = (
              <>
                <Text className={cn("text-[9px] uppercase tracking-wider opacity-80", textClassName)}>
                  {DAYS[i]}
                </Text>
                <Text className={cn("mt-0.5 text-sm font-semibold", textClassName)}>{d.getDate()}</Text>
                <View className={dotClassName} />
              </>
            );

            return isToday ? (
              <GradientView key={dayIso} tone="luxe" className={cellClassName}>
                {content}
              </GradientView>
            ) : (
              <View key={dayIso} className={cellClassName}>
                {content}
              </View>
            );
          })}
        </View>

        {weekEvents.length > 0 && (
          <View className="mt-3 gap-1.5">
            {weekEvents.map((e) => (
              <View key={e.id} className="flex-row items-center gap-2">
                <Icon as={typeIcon(e.type)} size={12} className="text-primary" />
                <Text className="flex-1 text-[11px] text-foreground/80" numberOfLines={1}>
                  {e.title}
                </Text>
                <Text className="text-[11px] text-muted-foreground">{e.time}</Text>
              </View>
            ))}
          </View>
        )}
      </Pressable>
    </Link>
  );
}

export { MiniCalendar };
