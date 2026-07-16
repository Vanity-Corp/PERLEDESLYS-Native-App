import { Link } from "expo-router";
import { ArrowLeft, HelpCircle, Mail } from "lucide-react-native";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Icon } from "@/components/ui/icon";
import { GradientView } from "@/components/ui/gradient-view";
import { faqItems } from "@/lib/mock-data";

// Web source: kitchen-haven-club/src/routes/app/faq/index.tsx
//
// The web hand-rolls its own accordion (single-open via a `open: number | null`
// state, first item open by default). Per the plan (Task 29) this is a direct
// upgrade to RNR's `Accordion` with `type="single" collapsible` + a
// `defaultValue` of the first item — same single-open behavior, first item open.
//
// One known RNR-default deviation: RNR's AccordionTrigger hardcodes a
// muted-foreground chevron; the web's chevron is `text-primary`. Matching it
// exactly would mean editing the shared `ui/accordion.tsx` primitive, so the
// RNR default is kept as the "direct upgrade" the plan calls for.
export default function FaqScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerClassName="pb-16" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-3 px-5 pb-2 pt-6">
          <Link href="/app/profile" asChild>
            <Pressable className="-ml-2 rounded-full p-2">
              <Icon as={ArrowLeft} size={20} className="text-foreground" />
            </Pressable>
          </Link>
          <View>
            <Text className="font-display text-2xl font-medium tracking-tight text-foreground">
              Foire aux questions
            </Text>
            <Text className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Tout ce que vous voulez savoir
            </Text>
          </View>
        </View>

        <GradientView
          tone="luxe"
          className="mx-5 mt-4 flex-row items-center gap-3 rounded-3xl p-4 shadow-sm shadow-black/10"
        >
          <Icon as={HelpCircle} size={32} className="shrink-0 text-primary-foreground" />
          <View className="flex-1">
            <Text className="font-italiana text-lg leading-tight text-primary-foreground">
              Une question reste sans réponse ?
            </Text>
            <Text className="mt-0.5 text-[11px] text-primary-foreground opacity-90">
              Écrivez-moi directement, je vous réponds dans la journée.
            </Text>
          </View>
        </GradientView>

        <Accordion
          type="single"
          collapsible
          defaultValue="0"
          className="mt-5 px-5"
        >
          {faqItems.map((item, i) => (
            <AccordionItem
              key={i}
              value={String(i)}
              className="mb-2 overflow-hidden rounded-2xl border border-border bg-card px-4 shadow-sm shadow-black/5"
            >
              <AccordionTrigger>
                <Text className="pr-2 text-sm font-medium leading-snug text-foreground">
                  {item.q}
                </Text>
              </AccordionTrigger>
              <AccordionContent className="border-t border-border pt-3">
                <Text className="text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </Text>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Pressable
          onPress={() => Linking.openURL("mailto:contact@perledelys.fr")}
          className="mx-5 mt-6 flex-row items-center justify-center gap-2 rounded-2xl border border-border bg-card py-4 shadow-sm shadow-black/5"
        >
          <Icon as={Mail} size={16} className="text-primary" />
          <Text className="text-sm font-medium text-foreground">
            contact@perledelys.fr
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
