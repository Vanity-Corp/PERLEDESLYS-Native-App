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

export type UserStatus = "PENDING" | "ACTIVE" | "SUSPENDED";

const authUserSchema = z.object({
  id: z.string(),
  // Accounts are username-only now (privacy — WIRING_PLAN B1). name/email are
  // optional/nullable: absent for app sign-ups, present only for legacy/admin.
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  username: z.string(),
  role: z.enum(["MEMBER", "ADMIN"]),
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED"]),
  isActivated: z.boolean(),
  avatar: z.string().nullable().optional(),
  createdAt: z.string().optional(),
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
  username: string;
  password: string;
}

// Member self-service profile update. All fields optional (partial update).
export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  avatar?: string;
}

// Upload an image (member avatar) to the member-guarded endpoint. Multipart —
// the JSON `request()` helper can't do this. Returns the hosted URL.
export async function uploadImage(
  file: { uri: string; name: string; type: string },
  token: string,
): Promise<string> {
  if (!API_URL) {
    throw new ApiError("URL de l'API non configurée.", 0, "NO_API_URL");
  }
  const form = new FormData();
  // React Native FormData file shape.
  form.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as unknown as Blob);
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/uploads`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
  } catch {
    throw new ApiError("Impossible de joindre le serveur.", 0, "NETWORK");
  }
  const json = (await res.json().catch(() => null)) as
    | { url?: string; message?: string }
    | null;
  if (!res.ok || !json?.url) {
    throw new ApiError(json?.message ?? "Échec du téléversement.", res.status);
  }
  return json.url;
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

  updateProfile: (input: UpdateProfileInput, token: string) =>
    request("/auth/me", {
      method: "PATCH",
      body: input,
      token,
      schema: authUserSchema,
    }),

  // Always resolves (the backend never reveals whether the email exists).
  forgotPassword: (email: string) =>
    request("/auth/forgot-password", {
      method: "POST",
      body: { email },
      schema: z.object({ ok: z.literal(true) }),
    }),

  resetPassword: (token: string, password: string) =>
    request("/auth/reset-password", {
      method: "POST",
      body: { token, password },
      schema: z.object({ ok: z.literal(true) }),
    }),
};
