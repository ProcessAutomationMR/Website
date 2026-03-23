import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  createCORSHeaders,
  checkRateLimit,
  getClientIP,
  anonymizeIP,
  createSupabaseClient,
  createErrorResponse,
  createSuccessResponse,
  handleOPTIONS,
  createRateLimitHeaders,
  CORSConfig,
  RateLimitConfig,
  RATE_LIMIT_PRESETS,
  RateLimitTier,
} from "../_shared/middleware.ts";
import {
  validateActivityLog,
  createValidationErrorResponse,
} from "../_shared/validation.ts";

const PRODUCTION_ORIGINS = new Set([
  "https://gbm-menuiserie.fr",
  "https://www.gbm-menuiserie.fr",
]);

const DEV_ORIGINS = new Set([
  "http://localhost:5173",
  "http://localhost:4173",
]);

const IS_DEV = Deno.env.get("ENVIRONMENT") === "development";

const ALLOWED_ORIGINS = IS_DEV
  ? new Set([...PRODUCTION_ORIGINS, ...DEV_ORIGINS])
  : PRODUCTION_ORIGINS;

function isOriginAllowed(origin: string): boolean {
  if (ALLOWED_ORIGINS.has(origin)) return true;
  if (IS_DEV && origin.endsWith(".webcontainer-api.io")) return true;
  return false;
}

const CORS_CONFIG: CORSConfig = {
  allowedOrigins: [...ALLOWED_ORIGINS],
  allowedMethods: "POST, OPTIONS",
  allowedHeaders: "Content-Type, Authorization, X-Client-Info, Apikey, X-CSRF-Token",
  maxAge: "86400",
};

const rateLimitCache = new Map<string, number[]>();
const RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: RATE_LIMIT_PRESETS[RateLimitTier.MODERATE].maxRequests,
  windowMs: RATE_LIMIT_PRESETS[RateLimitTier.MODERATE].windowMs,
  cache: rateLimitCache,
};

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") || "";
  const corsHeaders = createCORSHeaders(origin, CORS_CONFIG);

  if (req.method === "OPTIONS") {
    return handleOPTIONS(corsHeaders);
  }

  if (req.method !== "POST") {
    return createErrorResponse("Method not allowed", 405, corsHeaders);
  }

  try {
    if (!isOriginAllowed(origin)) {
      return createErrorResponse("Origin not allowed", 403, corsHeaders);
    }

    const csrfToken = req.headers.get("X-CSRF-Token");
    if (!csrfToken || csrfToken.length < 32) {
      return createErrorResponse("Missing or invalid CSRF token", 403, corsHeaders);
    }

    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(clientIP, RATE_LIMIT_CONFIG);
    const rateLimitHeaders = createRateLimitHeaders(rateLimit);

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ error: "Trop de requêtes. Veuillez patienter." }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            ...rateLimitHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabase = createSupabaseClient();

    let rawPayload: unknown;
    try {
      rawPayload = await req.json();
    } catch {
      return createErrorResponse("Invalid JSON", 400, corsHeaders);
    }

    const validation = validateActivityLog(rawPayload);

    if (!validation.valid) {
      const errorResponse = createValidationErrorResponse(validation.errors!);
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const validatedData = validation.data!;

    const ipAddress = anonymizeIP(clientIP);
    const userAgent = req.headers.get("user-agent")?.slice(0, 500) || "unknown";

    const { error } = await supabase.from("activity_logs").insert({
      ip_address: ipAddress,
      action_type: validatedData.action_type,
      page_name: validatedData.page_name,
      element_name: validatedData.element_name,
      page_url: validatedData.page_url,
      user_agent: userAgent,
      project_id: validatedData.project_id,
      metadata: validatedData.metadata,
      session_id: validatedData.session_id,
    });

    if (error) {
      return createErrorResponse("Failed to log activity", 500, corsHeaders);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          ...rateLimitHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch {
    return createErrorResponse("Internal server error", 500, corsHeaders);
  }
});
