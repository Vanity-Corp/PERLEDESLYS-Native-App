import type { ReactNode } from "react";
import { Pressable, type PressableProps } from "react-native";

import { GradientView, type GradientTone } from "@/components/ui/gradient-view";
import { TextClassContext } from "@/components/ui/text";
import { cn } from "@/lib/utils";

// RNR's Button only supports solid `bg-*` variants — no gradient-aware
// equivalent exists for the web's `bg-gradient-luxe` CTA buttons (Landing's
// primary CTA, Login's submit button, and more later per the migration
// report). Composes the same way Button does internally (Pressable +
// TextClassContext.Provider so nested <Text>/<Icon> pick up the right
// color automatically) so it slots into the same usage patterns.
//
// `children` is narrowed to a plain ReactNode (Pressable's own type also
// allows a press-state render-prop function, but GradientView only accepts
// plain nodes, and no usage here needs the render-prop form).
type GradientButtonProps = Omit<PressableProps, "children"> & {
  tone?: GradientTone;
  className?: string;
  children?: ReactNode;
};

function GradientButton({
  tone = "luxe",
  className,
  children,
  disabled,
  ...props
}: GradientButtonProps) {
  return (
    <TextClassContext.Provider value="text-primary-foreground font-medium">
      <Pressable role="button" disabled={disabled} {...props}>
        <GradientView
          tone={tone}
          className={cn(
            "flex-row items-center justify-center gap-2 rounded-2xl px-6 py-4",
            disabled && "opacity-50",
            className,
          )}
        >
          {children}
        </GradientView>
      </Pressable>
    </TextClassContext.Provider>
  );
}

export { GradientButton };
export type { GradientButtonProps };
