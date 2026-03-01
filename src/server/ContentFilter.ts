import { NAME_MAX_LENGTH, CHAT_MAX_MESSAGE_LENGTH } from '../shared/constants';

// ─── Result Types ───

type ValidResult = { valid: true; sanitized: string };
type InvalidResult = { valid: false; error: string };
type ValidationResult = ValidResult | InvalidResult;

// ─── Invisible / Control Character Stripping ───

// Zero-width and invisible Unicode characters
const INVISIBLE_CHARS = /[\u200B-\u200F\u2028-\u202F\u2060-\u206F\uFEFF\u00AD\u034F\u061C\u180E]/g;
// Control characters (C0/C1) except standard whitespace (tab, newline, carriage return)
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g;

function sanitizeText(raw: string): string {
  let text = raw;
  text = text.replace(INVISIBLE_CHARS, '');
  text = text.replace(CONTROL_CHARS, '');
  // Collapse all whitespace runs (including newlines) to single space, then trim
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

// ─── Game Term Whitelist ───

// These terms are blanked out (using word boundaries) before profanity checks
// to avoid false positives on game-related words
const GAME_TERMS = [
  'assassination',
  'assassinate',
  'assassin',
  'ambassador',
  'exchange',
  'contessa',
  'captain',
  'duke',
  'coup',
  'pass',
  'block',
  'challenge',
  'influence',
  'foreign',
  'income',
  'steal',
  'tax',
  'classic',
  'class',
  'grass',
  'mass',
  'bass',
  'brass',
  'compass',
  'bypass',
  'sass',
  'lasso',
  'trespass',
  'harass',
  'embassy',
  'embarrass',
];

// Pre-build game term regexes with word boundaries, sorted longest-first
const GAME_TERM_REGEXES = [...GAME_TERMS]
  .sort((a, b) => b.length - a.length)
  .map(term => ({ regex: new RegExp(`\\b${term}\\b`, 'gi'), length: term.length }));

function blankOutGameTerms(text: string): string {
  let result = text;
  for (const { regex, length } of GAME_TERM_REGEXES) {
    result = result.replace(regex, ' '.repeat(length));
  }
  return result;
}

// ─── Profanity Blocklist ───

// Each entry is a base word; the checker builds a regex with leet-speak character
// classes and repeated-char tolerance.
// Categories: slurs/hate speech, explicit sexual terms, strong profanity
const BLOCKED_WORDS = [
  // Strong profanity
  'fuck',
  'shit',
  'bitch',
  'cunt',
  'dick',
  'cock',
  'pussy',
  'twat',
  'wanker',
  'prick',
  // Compound forms (standalone "ass" is NOT blocked due to false positives)
  'asshole',
  'arsehole',
  'dumbass',
  'jackass',
  'fatass',
  'badass',
  'smartass',
  'kickass',
  'hardass',
  // Slurs and hate speech
  'nigger',
  'nigga',
  'faggot',
  'fag',
  'dyke',
  'tranny',
  'retard',
  'spic',
  'chink',
  'kike',
  'wetback',
  'beaner',
  'gook',
  'towelhead',
  'raghead',
  'coon',
  'darkie',
  'honky',
  'cracker',
  'gringo',
  'jigaboo',
  // Explicit sexual terms
  'blowjob',
  'handjob',
  'rimjob',
  'cumshot',
  'creampie',
  'bukkake',
  'dildo',
  'masturbat',
  'jerkoff',
  'jackoff',
  'orgasm',
  'erection',
  'penis',
  'vagina',
  'anus',
  'tits',
  'boobs',
  'whore',
  'slut',
  'hentai',
  'porn',
];

// For each letter, which leet-speak characters can represent it
const LEET_VARIANTS: Record<string, string[]> = {
  'a': ['@', '4'],
  'e': ['3'],
  'i': ['1', '!'],
  'o': ['0'],
  's': ['\\$', '5'],
  't': ['7', '\\+'],
  'u': ['@', 'v'],
};

// Characters to preserve when stripping (letters + leet chars)
const STRIP_REGEX = /[^a-z0-9@$!+]/g;

// Build regex with leet-speak character classes and repeated-char tolerance
// e.g., "fuck" → /f+[u@v]+c+k+/i
function buildBlockedRegex(word: string): RegExp {
  const pattern = word.split('').map(ch => {
    const variants = LEET_VARIANTS[ch];
    if (variants) {
      const escaped = ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return `[${escaped}${variants.join('')}]+`;
    }
    const escaped = ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return `${escaped}+`;
  }).join('');
  return new RegExp(pattern, 'i');
}

const BLOCKED_REGEXES = BLOCKED_WORDS.map(w => buildBlockedRegex(w));

function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase();

  // Blank game terms using word boundaries (before stripping, so boundaries exist)
  const blanked = blankOutGameTerms(lower);

  // Strip separators but keep letters, digits, and leet characters
  const stripped = blanked.replace(STRIP_REGEX, '');

  for (const regex of BLOCKED_REGEXES) {
    if (regex.test(stripped)) return true;
  }

  return false;
}

// ─── Public API ───

export function validateName(raw: string): ValidationResult {
  if (!raw || typeof raw !== 'string') {
    return { valid: false, error: 'Name is required' };
  }

  const sanitized = sanitizeText(raw);

  if (sanitized.length === 0) {
    return { valid: false, error: 'Name is required' };
  }

  if (sanitized.length > NAME_MAX_LENGTH) {
    return { valid: false, error: `Name must be ${NAME_MAX_LENGTH} characters or less` };
  }

  // Must contain at least one alphanumeric character
  if (!/[a-zA-Z0-9]/.test(sanitized)) {
    return { valid: false, error: 'Name must contain at least one letter or number' };
  }

  if (containsProfanity(sanitized)) {
    return { valid: false, error: 'Name contains inappropriate language' };
  }

  return { valid: true, sanitized };
}

export function validateChatMessage(raw: string): ValidationResult {
  if (!raw || typeof raw !== 'string') {
    return { valid: false, error: 'Message is required' };
  }

  const sanitized = sanitizeText(raw);

  if (sanitized.length === 0) {
    return { valid: false, error: 'Message is required' };
  }

  if (sanitized.length > CHAT_MAX_MESSAGE_LENGTH) {
    return { valid: false, error: `Message must be ${CHAT_MAX_MESSAGE_LENGTH} characters or less` };
  }

  if (containsProfanity(sanitized)) {
    return { valid: false, error: 'Message contains inappropriate language' };
  }

  return { valid: true, sanitized };
}
