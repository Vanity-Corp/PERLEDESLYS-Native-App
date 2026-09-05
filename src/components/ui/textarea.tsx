import { blockInsertKeyOverwriteMode, cn } from '@/lib/utils';
import { Platform, TextInput } from 'react-native';

function Textarea({
  className,
  multiline = true,
  numberOfLines = Platform.select({ web: 2, native: 8 }), // On web, numberOfLines also determines initial height. On native, it determines the maximum height.
  placeholderClassName,
  onKeyDown,
  ...props
}: React.ComponentProps<typeof TextInput> & React.RefAttributes<TextInput> & { onKeyDown?: (e: never) => void }) {
  return (
    <TextInput
      className={cn(
        'text-foreground border-input flex min-h-40 w-full flex-row rounded-md border bg-white px-3 py-2 text-base shadow-sm shadow-black/5 md:text-sm',
        Platform.select({
          web: 'placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive field-sizing-content resize-y outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:cursor-not-allowed',
        }),
        props.editable === false && 'opacity-50',
        className
      )}
      placeholderClassName={cn('text-muted-foreground', placeholderClassName)}
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical="top"
      {...props}
      {...(Platform.OS === 'web' ? { onKeyDown: blockInsertKeyOverwriteMode(onKeyDown) } : null)}
    />
  );
}

export { Textarea };
