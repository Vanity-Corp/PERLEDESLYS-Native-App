import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/auth-api";
import { useAuth } from "@/lib/auth-store";

// If any authenticated request comes back 403 because the account is no longer
// ACTIVE (suspended, or reverted to pending), clear the session. The app-layout
// guard (src/app/app/_layout.tsx) then redirects to the landing screen. This is
// how a member suspended mid-session gets bounced out automatically.
function handleAuthError(error: unknown) {
  if (
    error instanceof ApiError &&
    error.status === 403 &&
    (error.code === "ACCOUNT_SUSPENDED" || error.code === "ACCOUNT_PENDING")
  ) {
    if (useAuth.getState().token) {
      useAuth.getState().logout();
    }
  }
}

/**
 * Single shared QueryClient for the whole app (mirrors the web app's
 * `getRouter()`, which creates one `QueryClient` and passes it down via
 * router context). Defaults are tuned for a mobile client rather than
 * react-query's desktop-browser defaults:
 *  - `staleTime` avoids refetching on every screen focus over a mobile
 *    connection; screens that need fresher data can override it per-query.
 *  - `retry: 2` is finite (react-query's own default) which is fine on
 *    web's fast reconnects, but worth keeping explicit here since mobile
 *    networks drop far more often — this is the value future query hooks
 *    should tune first if a particular endpoint needs different behavior.
 */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleAuthError }),
  mutationCache: new MutationCache({ onError: handleAuthError }),
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 2,
    },
  },
});
