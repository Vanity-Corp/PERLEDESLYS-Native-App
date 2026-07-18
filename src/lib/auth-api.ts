import { z } from "zod";

// Client for the PERLEDESLYS backend auth API (perledeslys-backend, NestJS).
// Base URL comes from EXPO_PUBLIC_API_URL (.env) — set it to the backend's
// reachable address. On a real device that must be the machine's LAN IP
// (e.g. http://192.168.1.20:3000), NOT localhost. Routes live under /api.
//
// See BACKEND_PLAN.md Phase 3. The auth flow is: register → PENDING (token
// issued) → activate with the global code → ACTIVE. Login succeeds for PENDING
// users too; the app routes them to the Activation screen.

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type UserStatus = "PENDING" | "ACTIVE";

const authUserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  username: z.string(),
  role: z.enum(["MEMBER", "ADMIN"]),
  status: z.enum(["PENDING", "ACTIVE"]),
  isActivated: z.boolean(),
});
export type AuthUser = z.infer<typeof authUserSchema>;

const authResultSchema = z.object({
  token: z.string(),
  user: authUserSchema,
});
export type AuthResult = z.infer<typeof authResultSchema>;

// Carries the HTTP status and the backend's machine-readable `code`
// (e.g. ACCOUNT_PENDING, INVALID_ACTIVATION_CODE) so screens can branch.
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
}

async function request<T>(
  path: string,
  options: { method: string; body?: unknown; token?: string; schema: z.ZodType<T> },
): Promise<T> {
  if (!API_URL) {
    throw new ApiError(
      "L'URL de l'API n'est pas configurée (EXPO_PUBLIC_API_URL).",
      0,
      "NO_API_URL",
    );
  }
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      method: options.method,
      headers: {
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Impossible de joindre le serveur. Vérifie ta connexion et réessaie.",
      0,
      "NETWORK",
    );
  }

  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const err = (json ?? {}) as { message?: string | string[]; code?: string };
    const message = Array.isArray(err.message)
      ? err.message.join(" ")
      : (err.message ?? "Une erreur est survenue.");
    throw new ApiError(message, res.status, err.code);
  }

  const parsed = options.schema.safeParse(json);
  if (!parsed.success) {
    throw new ApiError("Réponse inattendue du serveur.", res.status, "BAD_RESPONSE");
  }
  return parsed.data;
}

export const authApi = {
  register: (input: RegisterInput) =>
    request("/auth/register", { method: "POST", body: input, schema: authResultSchema }),

  login: (identifier: string, password: string) =>
    request("/auth/login", {
      method: "POST",
      body: { identifier, password },
      schema: authResultSchema,
    }),

  activate: (code: string, token: string) =>
    request("/auth/activate", {
      method: "POST",
      body: { code },
      token,
      schema: authResultSchema,
    }),

  me: (token: string) =>
    request("/auth/me", { method: "GET", token, schema: authUserSchema }),
};
