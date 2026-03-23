export interface ValidationResult {
  valid: boolean;
  sanitized?: string;
  error?: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const VALID_CATEGORIES = ['menuiserie', 'agencement', 'agencement-magasins', 'laquage'];

const CATEGORY_ID_MAP: Record<string, string> = {
  'menuiserie': 'a8863264-327f-414d-86ed-586bca12fdc3',
  'agencement': '51560d32-76d2-4215-94ac-e8da1f919f0b',
  'agencement-magasins': '8d91be24-826b-4c9b-a2a3-46a90117d0ad',
  'laquage': '9eb82e1c-d5af-4ab6-be98-f609aed51242'
};

export function parseNumber(value: string | number): number | null {
  if (typeof value === 'number') {
    return !isNaN(value) && isFinite(value) && value >= 0 ? value : null;
  }

  const num = parseFloat(value);
  return !isNaN(num) && isFinite(num) && num >= 0 && num <= 100000 ? num : null;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return false;

  const disposableDomains = [
    'temp-mail.org', 'guerrillamail.com', 'mailinator.com',
    '10minutemail.com', 'throwaway.email', 'tempmail.com',
    'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com',
    'grr.la', 'guerrillamail.info', 'guerrillamail.biz',
    'guerrillamail.de', 'guerrillamail.net', 'guerrillamail.org',
    'spam4.me', 'trashmail.com', 'trashmail.me', 'trashmail.net',
    'dispostable.com', 'spamgourmet.com', 'spamgourmet.net',
    'spamgourmet.org', 'spam.la', 'maildrop.cc', 'getairmail.com',
    'filzmail.com', 'discard.email', 'spamevader.net', 'fakeinbox.com',
    'mailnull.com', 'spamfree24.org', 'spamfree24.de', 'spamfree24.info',
    'wegwerfmail.de', 'wegwerfmail.net', 'wegwerfmail.org',
    'discardmail.com', 'discardmail.de', 'haltospam.com',
    'kurzepost.de', 'objectmail.com', 'proxymail.eu', 'rcpt.at',
    'trash-mail.at', 'trashdevil.com', 'trashdevil.de',
    'zehnminutenmail.de', 'spambox.us', 'mailtemp.info',
    'emailondeck.com', 'tempinbox.com',
  ];
  const domain = email.split('@')[1]?.toLowerCase();
  return !disposableDomains.includes(domain);
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/[\s\-().]/g, '');
  if (digits.startsWith('00')) {
    return '+' + digits.slice(2);
  }
  if (digits.startsWith('0') && !digits.startsWith('00')) {
    return '+33' + digits.slice(1);
  }
  return digits;
}

export function validatePhoneFR(phone: string): boolean {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return phoneRegex.test(phone);
}

export function sanitizeString(str: string, maxLength: number = 2000): string {
  if (!str) return '';
  return str.trim().slice(0, maxLength);
}

export function validateUUID(uuid: unknown): ValidationResult {
  if (!uuid || typeof uuid !== 'string') {
    return { valid: false, error: 'UUID must be a non-empty string' };
  }

  if (uuid.length !== 36) {
    return { valid: false, error: 'UUID must be 36 characters' };
  }

  if (!UUID_REGEX.test(uuid)) {
    return { valid: false, error: 'Invalid UUID format' };
  }

  return { valid: true, sanitized: uuid.toLowerCase() };
}

export function validateCategorySlug(slug: unknown): ValidationResult {
  if (!slug || typeof slug !== 'string') {
    return { valid: false, error: 'Category slug must be a non-empty string' };
  }

  const sanitized = slug.toLowerCase().trim();

  if (sanitized.length < 3 || sanitized.length > 50) {
    return { valid: false, error: 'Category slug must be 3-50 characters' };
  }

  if (!/^[a-z0-9-]+$/.test(sanitized)) {
    return { valid: false, error: 'Category slug must contain only lowercase letters, numbers, and hyphens' };
  }

  if (!VALID_CATEGORIES.includes(sanitized)) {
    return { valid: false, error: 'Unknown category' };
  }

  return { valid: true, sanitized };
}

export function getCategoryIdFromSlug(slug: string): string | null {
  const validation = validateCategorySlug(slug);
  if (!validation.valid || !validation.sanitized) {
    return null;
  }
  return CATEGORY_ID_MAP[validation.sanitized] || null;
}

export function validateSearchQuery(query: unknown): ValidationResult {
  if (!query || typeof query !== 'string') {
    return { valid: false, error: 'Search query must be a non-empty string' };
  }

  const sanitized = query.trim();

  if (sanitized.length < 2) {
    return { valid: false, error: 'Search query must be at least 2 characters' };
  }

  if (sanitized.length > 200) {
    return { valid: false, error: 'Search query must be at most 200 characters' };
  }

  const cleaned = sanitized.replace(/[<>()[\]{}\\]/g, '');

  return { valid: true, sanitized: cleaned };
}

export function validateFilter(filter: unknown, allowedValues: string[]): ValidationResult {
  if (!filter) {
    return { valid: true, sanitized: '' };
  }

  if (typeof filter !== 'string') {
    return { valid: false, error: 'Filter must be a string' };
  }

  const sanitized = filter.trim();

  if (sanitized.length > 100) {
    return { valid: false, error: 'Filter value too long' };
  }

  if (!allowedValues.includes(sanitized)) {
    return { valid: false, error: 'Invalid filter value' };
  }

  return { valid: true, sanitized };
}

export function validateNumericParam(param: unknown, min: number, max: number): ValidationResult {
  if (param === null || param === undefined || param === '') {
    return { valid: false, error: 'Parameter is required' };
  }

  const num = typeof param === 'number' ? param : parseFloat(String(param));

  if (isNaN(num) || !isFinite(num)) {
    return { valid: false, error: 'Parameter must be a valid number' };
  }

  if (num < min || num > max) {
    return { valid: false, error: `Parameter must be between ${min} and ${max}` };
  }

  return { valid: true, sanitized: String(num) };
}

export function validateEmailStrict(email: unknown): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email must be a non-empty string' };
  }

  const trimmed = email.trim().toLowerCase();

  if (trimmed.length < 3 || trimmed.length > 255) {
    return { valid: false, error: 'Email must be 3-255 characters' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid email format' };
  }

  const [localPart, domain] = trimmed.split('@');
  if (localPart.length > 64 || domain.length > 253) {
    return { valid: false, error: 'Email parts too long' };
  }

  if (/[<>()[\]\\,;:\s"]/.test(localPart)) {
    return { valid: false, error: 'Email contains invalid characters' };
  }

  return { valid: true, sanitized: trimmed };
}

export function validateName(name: unknown, fieldName: string = 'Name'): ValidationResult {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: `${fieldName} must be a non-empty string` };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2 || trimmed.length > 100) {
    return { valid: false, error: `${fieldName} must be 2-100 characters` };
  }

  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(trimmed)) {
    return { valid: false, error: `${fieldName} must contain only letters, spaces, hyphens, and apostrophes` };
  }

  return { valid: true, sanitized: trimmed };
}

export function validatePhone(phone: unknown): ValidationResult {
  if (!phone) {
    return { valid: true, sanitized: '' };
  }

  if (typeof phone !== 'string') {
    return { valid: false, error: 'Phone must be a string' };
  }

  const trimmed = phone.trim();

  if (trimmed.length < 10 || trimmed.length > 20) {
    return { valid: false, error: 'Phone must be 10-20 characters' };
  }

  if (!/^[0-9+\s\-().]+$/.test(trimmed)) {
    return { valid: false, error: 'Phone contains invalid characters' };
  }

  return { valid: true, sanitized: trimmed };
}

export function validateMessage(message: unknown, maxLength: number = 5000): ValidationResult {
  if (!message) {
    return { valid: true, sanitized: '' };
  }

  if (typeof message !== 'string') {
    return { valid: false, error: 'Message must be a string' };
  }

  const trimmed = message.trim();

  if (trimmed.length > maxLength) {
    return { valid: false, error: `Message must be at most ${maxLength} characters` };
  }

  const cleaned = trimmed.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

  return { valid: true, sanitized: cleaned };
}

export function sanitizeUrlParam(param: unknown): string {
  if (!param || typeof param !== 'string') {
    return '';
  }

  return param
    .trim()
    .replace(/[<>()[\]{}'"\\]/g, '')
    .slice(0, 200);
}

export function validateBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  return false;
}

export function rejectUnexpectedFields<T extends Record<string, unknown>>(
  data: T,
  allowedFields: (keyof T)[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const dataKeys = Object.keys(data) as (keyof T)[];

  for (const key of dataKeys) {
    if (!allowedFields.includes(key)) {
      errors.push(`Unexpected field: ${String(key)}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
