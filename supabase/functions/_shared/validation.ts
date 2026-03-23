export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  errors?: ValidationError[];
}

export enum ActionType {
  VISITOR = "visitor",
  PAGE_VIEW = "page_view",
  PROJECT_VIEW = "project_view",
  BUTTON_CLICK = "button_click",
  NAVIGATION = "navigation",
  CATEGORY_VIEW = "category_view",
  ADD_TO_CART = "add_to_cart",
  REMOVE_FROM_CART = "remove_from_cart",
  QUOTE_REQUEST = "quote_request",
  CONTACT_FORM = "contact_form",
  SEARCH = "search",
  IMAGE_VIEW = "image_view",
  PROJECT_DESCRIPTION_REQUEST = "project_description_request",
  LOGO_CLICK = "logo_click",
  CTA_CLICK = "cta_click",
}

export interface ActivityLogPayload {
  action_type: string;
  page_name?: string | null;
  element_name?: string | null;
  page_url?: string | null;
  project_id?: string | null;
  metadata?: Record<string, unknown> | null;
  session_id?: string | null;
}

export interface ContactPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message?: string | null;
}

export interface QuoteRequestPayload {
  contact_id: string;
  project_id: string;
  wood_type?: string | null;
  finish?: string | null;
  pose_sur_site: boolean;
  additional_notes?: string | null;
  width?: number | null;
  height?: number | null;
  depth?: number | null;
}

export interface ProjectDescriptionPayload {
  project_id: string;
  email: string;
  message?: string | null;
}

function isValidURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  if (email.length < 3 || email.length > 255) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;

  const [localPart, domain] = email.split("@");
  if (localPart.length > 64 || domain.length > 253) return false;

  if (/[<>()[\]\\,;:\s@"]/.test(localPart)) return false;

  return true;
}

function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== "string") return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== "string") return false;
  if (phone.length < 10 || phone.length > 20) return false;

  const phoneRegex = /^[0-9+\s\-().]+$/;
  return phoneRegex.test(phone);
}

function sanitizeString(
  input: unknown,
  maxLength: number,
  allowedCharsRegex?: RegExp
): string | null {
  if (input === null || input === undefined) return null;

  let str = typeof input === "string" ? input : String(input);

  str = str.trim();

  if (str.length === 0) return null;

  if (allowedCharsRegex && !allowedCharsRegex.test(str)) {
    return null;
  }

  str = str.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

  return str.slice(0, maxLength);
}

function sanitizeNumber(
  input: unknown,
  min: number,
  max: number
): number | null {
  if (input === null || input === undefined) return null;

  const num = typeof input === "number" ? input : parseFloat(String(input));

  if (isNaN(num) || !isFinite(num)) return null;

  if (num < min || num > max) return null;

  return Math.round(num * 100) / 100;
}

function isValidActionType(actionType: string): boolean {
  const validTypes = Object.values(ActionType);
  return validTypes.includes(actionType as ActionType);
}

function sanitizeMetadata(
  metadata: unknown
): Record<string, unknown> | null {
  if (metadata === null || metadata === undefined) return null;

  if (typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  const sanitized: Record<string, unknown> = {};
  const maxKeys = 50;
  let keyCount = 0;

  for (const [key, value] of Object.entries(metadata)) {
    if (keyCount >= maxKeys) break;

    const sanitizedKey = sanitizeString(key, 100, /^[a-zA-Z0-9_-]+$/);
    if (!sanitizedKey) continue;

    if (
      value === null ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      if (typeof value === "string") {
        const sanitizedValue = sanitizeString(value, 1000);
        if (sanitizedValue !== null) {
          sanitized[sanitizedKey] = sanitizedValue;
          keyCount++;
        }
      } else {
        sanitized[sanitizedKey] = value;
        keyCount++;
      }
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : null;
}

export function validateActivityLog(
  payload: unknown
): ValidationResult<ActivityLogPayload> {
  const errors: ValidationError[] = [];

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      valid: false,
      errors: [{ field: "payload", message: "Invalid payload format" }],
    };
  }

  const data = payload as Record<string, unknown>;

  const actionType = sanitizeString(data.action_type, 100, /^[a-z_]+$/);
  if (!actionType) {
    errors.push({ field: "action_type", message: "Missing or invalid action_type" });
  } else if (!isValidActionType(actionType)) {
    errors.push({ field: "action_type", message: "Unknown action_type" });
  }

  const pageName = sanitizeString(data.page_name, 255);
  const elementName = sanitizeString(data.element_name, 255);
  const sessionId = sanitizeString(data.session_id, 255, /^[a-zA-Z0-9_-]+$/);

  let pageUrl: string | null = null;
  if (data.page_url) {
    const urlString = sanitizeString(data.page_url, 2048);
    if (urlString && isValidURL(urlString)) {
      pageUrl = urlString;
    }
  }

  let projectId: string | null = null;
  if (data.project_id) {
    const id = sanitizeString(data.project_id, 36);
    if (id && isValidUUID(id)) {
      projectId = id;
    } else if (id) {
      errors.push({ field: "project_id", message: "Invalid UUID format" });
    }
  }

  const metadata = sanitizeMetadata(data.metadata);

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      action_type: actionType!,
      page_name: pageName,
      element_name: elementName,
      page_url: pageUrl,
      project_id: projectId,
      metadata: metadata,
      session_id: sessionId,
    },
  };
}

export function validateContact(
  payload: unknown
): ValidationResult<ContactPayload> {
  const errors: ValidationError[] = [];

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      valid: false,
      errors: [{ field: "payload", message: "Invalid payload format" }],
    };
  }

  const data = payload as Record<string, unknown>;

  const allowedFields = ["first_name", "last_name", "email", "phone", "subject", "message"];
  for (const key of Object.keys(data)) {
    if (!allowedFields.includes(key)) {
      errors.push({ field: key, message: "Unexpected field" });
    }
  }

  const firstName = sanitizeString(data.first_name, 100, /^[a-zA-ZÀ-ÿ\s'-]+$/);
  if (!firstName || firstName.length < 2) {
    errors.push({
      field: "first_name",
      message: "First name required (2-100 chars, letters only)",
    });
  }

  const lastName = sanitizeString(data.last_name, 100, /^[a-zA-ZÀ-ÿ\s'-]+$/);
  if (!lastName || lastName.length < 2) {
    errors.push({
      field: "last_name",
      message: "Last name required (2-100 chars, letters only)",
    });
  }

  const emailRaw = sanitizeString(data.email, 255);
  if (!emailRaw || !isValidEmail(emailRaw)) {
    errors.push({
      field: "email",
      message: "Valid email required (max 255 chars)",
    });
  }
  const email = emailRaw ? emailRaw.toLowerCase() : "";

  let phone: string | null = null;
  if (data.phone) {
    const phoneRaw = sanitizeString(data.phone, 20);
    if (phoneRaw && !isValidPhone(phoneRaw)) {
      errors.push({
        field: "phone",
        message: "Invalid phone format (10-20 chars, digits and +- ().",
      });
    }
    phone = phoneRaw;
  }

  const subject = sanitizeString(data.subject, 255);
  const message = sanitizeString(data.message, 5000);

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      first_name: firstName!,
      last_name: lastName!,
      email: email!,
      phone: phone,
      subject: subject,
      message: message,
    },
  };
}

export function validateQuoteRequest(
  payload: unknown
): ValidationResult<QuoteRequestPayload> {
  const errors: ValidationError[] = [];

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      valid: false,
      errors: [{ field: "payload", message: "Invalid payload format" }],
    };
  }

  const data = payload as Record<string, unknown>;

  const allowedFields = [
    "contact_id",
    "project_id",
    "wood_type",
    "finish",
    "pose_sur_site",
    "additional_notes",
    "width",
    "height",
    "depth",
  ];
  for (const key of Object.keys(data)) {
    if (!allowedFields.includes(key)) {
      errors.push({ field: key, message: "Unexpected field" });
    }
  }

  const contactId = sanitizeString(data.contact_id, 36);
  if (!contactId || !isValidUUID(contactId)) {
    errors.push({
      field: "contact_id",
      message: "Valid contact_id UUID required",
    });
  }

  const projectId = sanitizeString(data.project_id, 36);
  if (!projectId || !isValidUUID(projectId)) {
    errors.push({
      field: "project_id",
      message: "Valid project_id UUID required",
    });
  }

  const woodType = sanitizeString(data.wood_type, 100);
  const finish = sanitizeString(data.finish, 100);
  const additionalNotes = sanitizeString(data.additional_notes, 2000);

  let poseSurSite = false;
  if (typeof data.pose_sur_site === "boolean") {
    poseSurSite = data.pose_sur_site;
  } else if (data.pose_sur_site) {
    poseSurSite = Boolean(data.pose_sur_site);
  }

  const width = sanitizeNumber(data.width, 0, 100000);
  const height = sanitizeNumber(data.height, 0, 100000);
  const depth = sanitizeNumber(data.depth, 0, 100000);

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      contact_id: contactId!,
      project_id: projectId!,
      wood_type: woodType,
      finish: finish,
      pose_sur_site: poseSurSite,
      additional_notes: additionalNotes,
      width: width,
      height: height,
      depth: depth,
    },
  };
}

export function validateProjectDescription(
  payload: unknown
): ValidationResult<ProjectDescriptionPayload> {
  const errors: ValidationError[] = [];

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      valid: false,
      errors: [{ field: "payload", message: "Invalid payload format" }],
    };
  }

  const data = payload as Record<string, unknown>;

  const allowedFields = ["project_id", "email", "message"];
  for (const key of Object.keys(data)) {
    if (!allowedFields.includes(key)) {
      errors.push({ field: key, message: "Unexpected field" });
    }
  }

  const projectId = sanitizeString(data.project_id, 36);
  if (!projectId || !isValidUUID(projectId)) {
    errors.push({
      field: "project_id",
      message: "Valid project_id UUID required",
    });
  }

  const emailRaw = sanitizeString(data.email, 255);
  if (!emailRaw || !isValidEmail(emailRaw)) {
    errors.push({
      field: "email",
      message: "Valid email required (max 255 chars)",
    });
  }
  const email = emailRaw ? emailRaw.toLowerCase() : "";

  const message = sanitizeString(data.message, 5000);

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      project_id: projectId!,
      email: email!,
      message: message,
    },
  };
}

export function validateSearchQuery(query: unknown): ValidationResult<string> {
  if (!query || typeof query !== "string") {
    return {
      valid: false,
      errors: [{ field: "query", message: "Search query must be a string" }],
    };
  }

  const sanitized = sanitizeString(query, 200);

  if (!sanitized || sanitized.length < 2) {
    return {
      valid: false,
      errors: [
        { field: "query", message: "Search query must be 2-200 characters" },
      ],
    };
  }

  return {
    valid: true,
    data: sanitized,
  };
}

export function validatePagination(
  page: unknown,
  limit: unknown
): ValidationResult<{ page: number; limit: number }> {
  const errors: ValidationError[] = [];

  const pageNum = sanitizeNumber(page, 1, 1000);
  if (!pageNum) {
    errors.push({
      field: "page",
      message: "Page must be a number between 1 and 1000",
    });
  }

  const limitNum = sanitizeNumber(limit, 1, 100);
  if (!limitNum) {
    errors.push({
      field: "limit",
      message: "Limit must be a number between 1 and 100",
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      page: pageNum || 1,
      limit: limitNum || 20,
    },
  };
}

export function rejectUnexpectedFields(
  payload: Record<string, unknown>,
  allowedFields: string[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const key of Object.keys(payload)) {
    if (!allowedFields.includes(key)) {
      errors.push({
        field: key,
        message: "Unexpected field - rejected for security",
      });
    }
  }

  return errors;
}

export function createValidationErrorResponse(
  errors: ValidationError[]
): { error: string; validation_errors: ValidationError[] } {
  return {
    error: "Validation failed",
    validation_errors: errors,
  };
}
