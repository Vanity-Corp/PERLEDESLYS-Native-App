import { useCallback, useRef, useState } from "react";
import { Platform, type NativeSyntheticEvent, type TextInputSelectionChangeEventData } from "react-native";

// react-native-web's controlled TextInput resets the cursor to its
// pre-keystroke position instead of keeping where the browser actually placed
// it after an edit — so typing a letter between two others silently lands it
// one position too early (visibly: type 'h' between 'b' and 'e' in "be" and
// the cursor ends up between 'b' and 'h' instead of between 'h' and 'e').
// Native iOS/Android don't have this bug, so this is a no-op there.
//
// Fix: track the last confirmed selection ourselves, compute where the
// cursor SHOULD land after each edit (accounting for a replaced selection,
// not just simple insertion), and re-assert it via a controlled `selection`
// prop for exactly one render — released back to `undefined` as soon as the
// browser's own onSelectionChange confirms it landed, so later clicks/arrow
// keys aren't fought by a stale forced position.
export function useTextInputCursorFix(
  value: string | undefined,
  onChangeText: ((text: string) => void) | undefined,
  onSelectionChangeProp?: (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => void,
) {
  const [selection, setSelection] = useState<{ start: number; end: number } | undefined>(undefined);
  const lastSelection = useRef({ start: 0, end: 0 });
  const lastValue = useRef(value ?? "");

  const handleChangeText = useCallback(
    (text: string) => {
      if (Platform.OS === "web") {
        const { start, end } = lastSelection.current;
        const insertedLength = text.length - lastValue.current.length + (end - start);
        const pos = Math.max(0, Math.min(text.length, start + insertedLength));
        lastSelection.current = { start: pos, end: pos };
        setSelection({ start: pos, end: pos });
      }
      lastValue.current = text;
      onChangeText?.(text);
    },
    [onChangeText],
  );

  const handleSelectionChange = useCallback(
    (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
      lastSelection.current = e.nativeEvent.selection;
      setSelection(undefined);
      onSelectionChangeProp?.(e);
    },
    [onSelectionChangeProp],
  );

  if (Platform.OS !== "web") {
    return { onChangeText, onSelectionChange: onSelectionChangeProp };
  }
  return { selection, onChangeText: handleChangeText, onSelectionChange: handleSelectionChange };
}
