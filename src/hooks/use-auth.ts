import { useStore } from '@/hooks/use-store';
import { authStore } from '@/store/auth.store';
export function useAuth() { return useStore(authStore); }
