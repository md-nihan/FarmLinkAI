// Phone number utilities for consistent E.164 formatting
// Default country code can be set via DEFAULT_COUNTRY_CODE (e.g., +91)

function cleanDigits(str) {
  return (str || '')
    .toString()
    .trim()
    .replace(/^whatsapp:/i, '')
    .replace(/[^0-9+]/g, '');
}

function normalizePhone(raw) {
  let s = cleanDigits(raw);
  const defaultCC = process.env.DEFAULT_COUNTRY_CODE || '+91';

  if (!s) return '';

  // Already in E.164
  if (s.startsWith('+')) {
    return s;
  }

  // Common local formats (e.g., 10-digit Indian numbers)
  // If it starts with leading 0, drop it
  if (s.startsWith('0')) {
    s = s.replace(/^0+/, '');
  }

  // If it starts with country code digits (e.g., 91XXXXXXXXXX), heuristically handle
  // Prefer explicit '+' but if length looks like CC + national, add '+'
  if (/^\d{11,15}$/.test(s)) {
    // If looks like 91 + 10 digits, convert to +91 + 10 digits
    if (s.length === 12 && s.startsWith('91')) {
      return `+${s}`;
    }
    // Otherwise, assume local national number if 10 digits
    if (s.length === 10) {
      return `${defaultCC}${s}`;
    }
    // Fallback: prefix '+'
    return `+${s}`;
  }

  // 10-digit local numbers
  if (/^\d{10}$/.test(s)) {
    return `${defaultCC}${s}`;
  }

  // Last resort: add '+' if missing
  if (!s.startsWith('+') && /^\d+$/.test(s)) {
    return `+${s}`;
  }

  return s;
}

function ensureWhatsAppAddress(raw) {
  const e164 = normalizePhone(raw);
  return e164 ? (e164.startsWith('whatsapp:') ? e164 : `whatsapp:${e164}`) : '';
}

module.exports = {
  normalizePhone,
  ensureWhatsAppAddress,
};
