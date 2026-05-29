import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { useStore } from '@/hooks/use-store';
import { uiStore } from '@/store/ui.store';

export function useTheme() {
  const system = useColorScheme();
  const { theme } = useStore(uiStore);
  const scheme = theme === 'system' ? (system === 'dark' ? 'dark' : 'light') : theme;

  return useMemo(
    () => ({ theme, scheme, colors: Colors[scheme], setTheme: uiStore.setTheme }),
    [theme, scheme],
  );
}
