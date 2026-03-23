import { logger } from './logger.utils';

export function stripHtmlTags(html: string): string {
  if (!html || typeof html !== 'string') return '';

  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || doc.body.innerText || '';
  } catch (error) {
    logger.error('Error parsing HTML', error);
    return html.replace(/<[^>]*>/g, '');
  }
}

export function escapeHtml(text: string): string {
  if (!text || typeof text !== 'string') return '';

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';

  const trimmed = url.trim();

  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('file:')
  ) {
    return '';
  }

  return trimmed;
}
