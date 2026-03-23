import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2.57.4";

export interface SecurityHeaders {
  "Content-Security-Policy": string;
  "X-Content-Type-Options": string;
  "X-Frame-Options": string;
  "X-XSS-Protection": string;
  "Strict-Transport-Security": string;
  "Referrer-Policy": string;
  "Permissions-Policy": string;
}

export const SECURITY_HEADERS: SecurityHeaders = {
  "Content-Security-Policy": "default-src 'self'; script-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=(), payment=()",
};

export interface CORSConfig {
  allowedOrigins: string[];
  allowedMethods: string;
  allowedHeaders: string;
  maxAge?: string;
}

export function createCORSHeaders(
  origin: string,
  config: CORSConfig
): Record<string, string> {
  const isLocalDev = origin && (
    origin.endsWith(".webcontainer-api.io") ||
    origin.endsWith(".local-credentialless.webcontainer-api.io")
  );
  const isAllowed = origin && (config.allowedOrigins.includes(origin) || isLocalDev);
  const allowedOrigin = isAllowed ? origin : config.allowedOrigins[0];

  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": config.allowedMethods,
    "Access-Control-Allow-Headers": config.allowedHeaders,
    "Vary": "Origin",
  };

  if (config.maxAge) {
    headers["Access-Control-Max-Age"] = config.maxAge;
  }

  return headers;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  cache: Map<string, number[]>;
}

export enum RateLimitTier {
  STRICT = "strict",
  MODERATE = "moderate",
  RELAXED = "relaxed",
  EXPENSIVE = "expensive",
}

export const RATE_LIMIT_PRESETS: Record<RateLimitTier, { maxRequests: number; windowMs: number }> = {
  [RateLimitTier.STRICT]: {
    maxRequests: 5,
    windowMs: 60000,
  },
  [RateLimitTier.MODERATE]: {
    maxRequests: 20,
    windowMs: 60000,
  },
  [RateLimitTier.RELAXED]: {
    maxRequests: 100,
    windowMs: 60000,
  },
  [RateLimitTier.EXPENSIVE]: {
    maxRequests: 3,
    windowMs: 60000,
  },
};

export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
  remaining?: number;
  limit?: number;
  resetAt?: number;
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const requests = config.cache.get(identifier) || [];
  const recentRequests = requests.filter(
    (timestamp) => now - timestamp < config.windowMs
  );

  const remaining = Math.max(0, config.maxRequests - recentRequests.length);

  if (recentRequests.length >= config.maxRequests) {
    const oldestRequest = Math.min(...recentRequests);
    const retryAfter = Math.ceil((oldestRequest + config.windowMs - now) / 1000);
    const resetAt = oldestRequest + config.windowMs;

    return {
      allowed: false,
      retryAfter,
      remaining: 0,
      limit: config.maxRequests,
      resetAt
    };
  }

  config.cache.set(identifier, [...recentRequests, now]);

  if (Math.random() < 0.01) {
    for (const [id, timestamps] of config.cache.entries()) {
      const recent = timestamps.filter((t) => now - t < config.windowMs);
      if (recent.length === 0) {
        config.cache.delete(id);
      } else {
        config.cache.set(id, recent);
      }
    }
  }

  return {
    allowed: true,
    remaining: remaining - 1,
    limit: config.maxRequests,
    resetAt: now + config.windowMs
  };
}

export function checkMultiTierRateLimit(
  identifier: string,
  configs: { name: string; config: RateLimitConfig }[]
): RateLimitResult {
  for (const { name, config } of configs) {
    const result = checkRateLimit(`${name}:${identifier}`, config);
    if (!result.allowed) {
      return result;
    }
  }

  return { allowed: true };
}

export interface DbRateLimitConfig {
  maxRequests: number;
  windowMs: number;
  endpoint: string;
}

export async function checkDbRateLimit(
  identifier: string,
  config: DbRateLimitConfig,
  supabase: SupabaseClient
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = new Date(Math.floor(now / config.windowMs) * config.windowMs).toISOString();
  const key = `${config.endpoint}:${identifier}`;

  try {
    const { data, error } = await supabase.rpc("upsert_rate_limit", {
      p_identifier: key,
      p_window_start: windowStart,
      p_max_requests: config.maxRequests,
    });

    if (error || data === null) {
      return { allowed: true };
    }

    const count = data as number;
    const resetAt = Math.floor(now / config.windowMs) * config.windowMs + config.windowMs;

    if (count > config.maxRequests) {
      return {
        allowed: false,
        retryAfter: Math.ceil((resetAt - now) / 1000),
        remaining: 0,
        limit: config.maxRequests,
        resetAt,
      };
    }

    return {
      allowed: true,
      remaining: Math.max(0, config.maxRequests - count),
      limit: config.maxRequests,
      resetAt,
    };
  } catch {
    return { allowed: true };
  }
}

export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {};

  if (result.limit !== undefined) {
    headers["X-RateLimit-Limit"] = String(result.limit);
  }

  if (result.remaining !== undefined) {
    headers["X-RateLimit-Remaining"] = String(result.remaining);
  }

  if (result.resetAt !== undefined) {
    headers["X-RateLimit-Reset"] = String(Math.floor(result.resetAt / 1000));
  }

  if (result.retryAfter !== undefined) {
    headers["Retry-After"] = String(result.retryAfter);
  }

  return headers;
}

export function getClientIP(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  return "unknown";
}

export function anonymizeIP(ip: string): string {
  if (ip === "unknown") return "unknown";

  if (ip.includes(":")) {
    const parts = ip.split(":");
    return parts.slice(0, 4).join(":") + "::xxxx";
  } else {
    const parts = ip.split(".");
    if (parts.length === 4) {
      return parts.slice(0, 2).join(".") + ".xxx.xxx";
    }
    return "xxx.xxx.xxx.xxx";
  }
}

export interface AuthResult {
  authenticated: boolean;
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
  error?: string;
}

export async function validateJWT(
  req: Request,
  supabase: SupabaseClient
): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      authenticated: false,
      error: "Missing or invalid Authorization header",
    };
  }

  const token = authHeader.substring(7);

  if (!token || token.length < 10) {
    return {
      authenticated: false,
      error: "Invalid token format",
    };
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return {
        authenticated: false,
        error: error?.message || "Invalid token",
      };
    }

    return {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    return {
      authenticated: false,
      error: "Token validation failed",
    };
  }
}

export function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUUID(uuid: string): ValidationResult {
  if (!uuid || typeof uuid !== "string") {
    return { valid: false, error: "UUID must be a string" };
  }

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(uuid)) {
    return { valid: false, error: "Invalid UUID format" };
  }

  return { valid: true };
}

export function sanitizeString(
  input: unknown,
  maxLength: number
): string | null {
  if (!input) return null;

  if (typeof input !== "string") {
    input = String(input);
  }

  return (input as string).trim().slice(0, maxLength);
}

export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Email must be a string" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return { valid: false, error: "Invalid email format" };
  }

  if (email.length > 255) {
    return { valid: false, error: "Email too long" };
  }

  return { valid: true };
}

export function createErrorResponse(
  error: string,
  status: number,
  headers: Record<string, string>
): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: {
      ...headers,
      ...SECURITY_HEADERS,
      "Content-Type": "application/json",
    },
  });
}

export function createSuccessResponse(
  data: unknown,
  headers: Record<string, string>
): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      ...headers,
      ...SECURITY_HEADERS,
      "Content-Type": "application/json",
    },
  });
}

export function handleOPTIONS(headers: Record<string, string>): Response {
  return new Response(null, {
    status: 204,
    headers: {
      ...headers,
      ...SECURITY_HEADERS,
    },
  });
}
