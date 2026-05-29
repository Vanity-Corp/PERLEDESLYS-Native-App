import { useColorScheme } from 'react-native';
import { useStore } from '@/hooks/use-store';
import { uiStore } from '@/store/ui.store';
import { Colors } from '@/constants/theme';
export function useTheme() { const system = useColorScheme(); const { theme } = useStore(uiStore); const scheme = theme === 'system' ? (system === 'dark' ? 'dark' : 'light') : theme; return { theme, scheme, colors: Colors[scheme], setTheme: uiStore.setTheme }; }
