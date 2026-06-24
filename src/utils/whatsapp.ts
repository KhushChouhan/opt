export const WHATSAPP_PRIMARY = '';
export const WHATSAPP_STORE = '918526200444';

/**
 * Builds a sanitized, URL-encoded WhatsApp click-to-chat link.
 * Sanitization prevents XSS vulnerabilities and link breakage by fully encoding strings.
 *
 * @param message The raw message text
 * @param number The recipient phone number (defaults to WHATSAPP_PRIMARY)
 * @returns Sanitized WhatsApp URL string
 */
export function buildWhatsAppUrl(message: string, number: string = WHATSAPP_PRIMARY): string {
  const sanitizedMessage = message.replace(/<[^>]*>/g, ''); // Basic stripping of html-like elements
  return `https://wa.me/${number}?text=${encodeURIComponent(sanitizedMessage.trim())}`;
}
