import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { StarRating } from "@/components/star-rating";
import { GradientButton } from "@/components/ui/gradient-button";
import { Icon } from "@/components/ui/icon";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitReview } from "@/lib/content-queries";

// Customer review submission (replaces the old non-functional "Send Feedback").
// A member gives a star rating + comment; the review is created PENDING and
// only appears publicly once the founder approves it in the dashboard.
const reviewSchema = z.object({
  rating: z.number().min(1, "Choisissez une note.").max(5),
  comment: z.string().trim().min(1, "Écrivez quelques mots."),
});
type ReviewValues = z.infer<typeof reviewSchema>;

export default function ReviewScreen() {
  const router = useRouter();
  const submitReview = useSubmitReview();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const { control, handleSubmit } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await submitReview.mutateAsync(values);
      setDone(true);
    } catch {
      setError("Impossible d'envoyer votre avis. Réessayez plus tard.");
    }
  });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        contentContainerClassName="px-5 pb-16"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center gap-3 pb-2 pt-2">
          <Link href="/app" asChild>
            <Pressable className="-ml-2 rounded-full p-2">
              <Icon as={ArrowLeft} size={20} className="text-foreground" />
            </Pressable>
          </Link>
          <Text className="font-display text-xl font-medium text-foreground">
            Donner mon avis
          </Text>
        </View>

        {done ? (
          <View className="mt-6 rounded-2xl border border-border bg-card p-6">
            <Text className="text-center font-display text-lg font-medium text-foreground">
              Merci pour votre avis&nbsp;! 💛
            </Text>
            <Text className="mt-2 text-center text-sm text-muted-foreground">
              Il sera visible dans l'application une fois validé par Ghania.
            </Text>
            <GradientButton
              tone="luxe"
              onPress={() => router.replace("/app")}
              className="mt-6"
            >
              <Text className="font-medium text-primary-foreground">
                Retour à l'accueil
              </Text>
            </GradientButton>
          </View>
        ) : (
          <>
            <Text className="mt-2 text-sm text-muted-foreground">
              Partagez votre expérience avec la communauté Perledeslys.
            </Text>

            <View className="mt-6 gap-2">
              <Text className="text-sm font-medium text-foreground">
                Votre note
              </Text>
              <Controller
                control={control}
                name="rating"
                render={({ field, fieldState }) => (
                  <View className="gap-1">
                    <StarRating value={field.value} onChange={field.onChange} />
                    {fieldState.error && (
                      <Text className="text-xs text-destructive">
                        {fieldState.error.message}
                      </Text>
                    )}
                  </View>
                )}
              />
            </View>

            <View className="mt-6 gap-2">
              <Text className="text-sm font-medium text-foreground">
                Votre commentaire
              </Text>
              <Controller
                control={control}
                name="comment"
                render={({ field, fieldState }) => (
                  <View className="gap-1">
                    <Textarea
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="Qu'avez-vous pensé de l'application, des recettes, des lives… ?"
                    />
                    {fieldState.error && (
                      <Text className="text-xs text-destructive">
                        {fieldState.error.message}
                      </Text>
                    )}
                  </View>
                )}
              />
            </View>

            {error && (
              <Text className="mt-4 text-center text-sm text-destructive">
                {error}
              </Text>
            )}

            <GradientButton
              tone="luxe"
              onPress={onSubmit}
              disabled={submitReview.isPending}
              className="mt-8"
            >
              {submitReview.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="font-medium text-primary-foreground">
                  Envoyer mon avis
                </Text>
              )}
            </GradientButton>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
