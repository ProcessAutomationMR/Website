import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  createCORSHeaders,
  checkRateLimit,
  checkDbRateLimit,
  getClientIP,
  anonymizeIP,
  createSupabaseClient,
  createErrorResponse,
  handleOPTIONS,
  createRateLimitHeaders,
  CORSConfig,
  RateLimitConfig,
  DbRateLimitConfig,
  RATE_LIMIT_PRESETS,
  RateLimitTier,
} from "../_shared/middleware.ts";
import {
  validateContact,
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

const perMinuteCache = new Map<string, number[]>();
const perHourCache = new Map<string, number[]>();

const PER_MINUTE_CONFIG: RateLimitConfig = {
  maxRequests: RATE_LIMIT_PRESETS[RateLimitTier.EXPENSIVE].maxRequests,
  windowMs: RATE_LIMIT_PRESETS[RateLimitTier.EXPENSIVE].windowMs,
  cache: perMinuteCache,
};

const PER_HOUR_CONFIG: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 3600000,
  cache: perHourCache,
};

const DB_HOUR_CONFIG: DbRateLimitConfig = {
  maxRequests: 10,
  windowMs: 3600000,
  endpoint: "submit-contact",
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

    const rateLimit = checkRateLimit(`minute:${clientIP}`, PER_MINUTE_CONFIG);
    const hourRateLimit = checkRateLimit(`hour:${clientIP}`, PER_HOUR_CONFIG);

    const rateLimitHeaders = createRateLimitHeaders(rateLimit);

    if (!rateLimit.allowed || !hourRateLimit.allowed) {
      return new Response(
        JSON.stringify({ error: "Trop de demandes. Veuillez patienter avant d'envoyer un nouveau message." }),
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

    let rawPayload: unknown;
    try {
      rawPayload = await req.json();
    } catch {
      return createErrorResponse("Format JSON invalide", 400, corsHeaders);
    }

    const contactValidation = validateContact(rawPayload);
    if (!contactValidation.valid) {
      const errorResponse = createValidationErrorResponse(contactValidation.errors!);
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const contact = contactValidation.data!;
    const supabase = createSupabaseClient();

    const dbRateLimit = await checkDbRateLimit(clientIP, DB_HOUR_CONFIG, supabase);
    if (!dbRateLimit.allowed) {
      return new Response(
        JSON.stringify({ error: "Trop de demandes. Veuillez patienter avant d'envoyer un nouveau message." }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            ...createRateLimitHeaders(dbRateLimit),
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { data: contactData, error: contactError } = await supabase
      .from("contacts")
      .insert({
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
        phone: contact.phone || null,
        category_id: Deno.env.get("CONTACT_CATEGORY_ID") || null,
      })
      .select()
      .maybeSingle();

    if (contactError || !contactData) {
      return createErrorResponse("Erreur lors de l'enregistrement du contact", 500, corsHeaders);
    }

    const { error: descriptionError } = await supabase
      .from("project_description_requests")
      .insert({
        customer_first_name: contact.first_name,
        customer_last_name: contact.last_name,
        customer_email: contact.email,
        customer_phone: contact.phone || null,
        Subject: contact.subject || null,
        project_description: contact.message || null,
        status: "pending",
      });

    if (descriptionError) {
      return createErrorResponse("Erreur lors de l'enregistrement du message", 500, corsHeaders);
    }

    const anonymizedIP = anonymizeIP(clientIP);
    await supabase.from("activity_logs").insert({
      ip_address: anonymizedIP,
      action_type: "contact_form",
      page_name: "contact",
      element_name: "submit_contact_form",
      user_agent: req.headers.get("user-agent")?.slice(0, 500) || "unknown",
      metadata: { has_message: !!contact.message },
    }).then(() => {});

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
    return createErrorResponse("Erreur interne du serveur", 500, corsHeaders);
  }
});
