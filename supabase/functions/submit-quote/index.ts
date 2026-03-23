import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  createCORSHeaders,
  checkMultiTierRateLimit,
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
  endpoint: "submit-quote",
};

interface DimensionItem {
  width?: number | null;
  height?: number | null;
  depth?: number | null;
}

interface SelectedProjectPayload {
  project_id: string;
  wood_type?: string | null;
  finish?: string | null;
  pose_sur_site?: boolean;
  additional_notes?: string | null;
  dimensions?: { items?: DimensionItem[] } | null;
}

interface SubmitQuotePayload {
  contact: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
  };
  projects: SelectedProjectPayload[];
}

function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== "string") return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

function sanitizeString(input: unknown, maxLength: number): string | null {
  if (input === null || input === undefined) return null;
  let str = typeof input === "string" ? input : String(input);
  str = str.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
  if (str.length === 0) return null;
  return str.slice(0, maxLength);
}

function sanitizeDimension(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = typeof value === "number" ? value : parseFloat(String(value));
  if (isNaN(num) || !isFinite(num) || num < 0 || num > 100000) return null;
  return Math.round(num * 100) / 100;
}

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

    const rateLimit = checkMultiTierRateLimit(clientIP, [
      { name: "minute", config: PER_MINUTE_CONFIG },
      { name: "hour", config: PER_HOUR_CONFIG },
    ]);

    const rateLimitHeaders = createRateLimitHeaders(rateLimit);

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ error: "Trop de demandes. Veuillez patienter avant de soumettre un nouveau devis." }),
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

    if (!rawPayload || typeof rawPayload !== "object" || Array.isArray(rawPayload)) {
      return createErrorResponse("Payload invalide", 400, corsHeaders);
    }

    const payload = rawPayload as Record<string, unknown>;

    if (!payload.contact || typeof payload.contact !== "object") {
      return createErrorResponse("Informations de contact manquantes", 400, corsHeaders);
    }

    if (!Array.isArray(payload.projects) || payload.projects.length === 0) {
      return createErrorResponse("Au moins un projet est requis", 400, corsHeaders);
    }

    if (payload.projects.length > 20) {
      return createErrorResponse("Trop de projets (maximum 20)", 400, corsHeaders);
    }

    const contactValidation = validateContact(payload.contact);
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
        JSON.stringify({ error: "Trop de demandes. Veuillez patienter avant de soumettre un nouveau devis." }),
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
      })
      .select()
      .maybeSingle();

    if (contactError || !contactData) {
      return createErrorResponse("Erreur lors de l'enregistrement du contact", 500, corsHeaders);
    }

    const projects = payload.projects as SelectedProjectPayload[];
    const quoteInserts = [];

    for (const sp of projects) {
      const projectId = sanitizeString(sp.project_id, 36);
      if (!projectId || !isValidUUID(projectId)) {
        return createErrorResponse("Identifiant de projet invalide", 400, corsHeaders);
      }

      const { data: projectExists } = await supabase
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .maybeSingle();

      if (!projectExists) {
        return createErrorResponse("Référence de projet invalide", 400, corsHeaders);
      }

      const woodType = sanitizeString(sp.wood_type, 100);
      const finish = sanitizeString(sp.finish, 100);
      const additionalNotes = sanitizeString(sp.additional_notes, 2000);
      const poseSurSite = typeof sp.pose_sur_site === "boolean" ? sp.pose_sur_site : false;

      const dimensionItems: DimensionItem[] = sp.dimensions?.items || [{}];

      for (const dim of dimensionItems) {
        quoteInserts.push({
          contact_id: contactData.id,
          project_id: projectId,
          wood_type: woodType,
          finish: finish,
          pose_sur_site: poseSurSite,
          additional_notes: additionalNotes,
          width: sanitizeDimension(dim.width),
          height: sanitizeDimension(dim.height),
          depth: sanitizeDimension(dim.depth),
          status: "pending",
        });
      }
    }

    const { error: quoteError } = await supabase
      .from("quote_requests")
      .insert(quoteInserts);

    if (quoteError) {
      return createErrorResponse("Erreur lors de l'enregistrement de la demande", 500, corsHeaders);
    }

    const anonymizedIP = anonymizeIP(clientIP);
    await supabase.from("activity_logs").insert({
      ip_address: anonymizedIP,
      action_type: "quote_request",
      page_name: "quote",
      element_name: "submit_quote_form",
      user_agent: req.headers.get("user-agent")?.slice(0, 500) || "unknown",
      metadata: { projects_count: quoteInserts.length },
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
