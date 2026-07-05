import { QueryClient } from "@tanstack/react-query";

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
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 2,
    },
  },
});
