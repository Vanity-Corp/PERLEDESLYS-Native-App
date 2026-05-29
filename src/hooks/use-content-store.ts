import { useStore } from '@/hooks/use-store';
import { contentStore } from '@/store/content.store';
export function useContentStore() { return useStore(contentStore); }
