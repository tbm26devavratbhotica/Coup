import { describe, it, expect } from 'vitest';
import { validateName, validateChatMessage } from '@/server/ContentFilter';

describe('ContentFilter', () => {
  // ─── validateName ───

  describe('validateName', () => {
    it('accepts valid names', () => {
      const result = validateName('Alice');
      expect(result).toEqual({ valid: true, sanitized: 'Alice' });
    });

    it('trims whitespace', () => {
      const result = validateName('  Bob  ');
      expect(result).toEqual({ valid: true, sanitized: 'Bob' });
    });

    it('collapses internal whitespace', () => {
      const result = validateName('John    Doe');
      expect(result).toEqual({ valid: true, sanitized: 'John Doe' });
    });

    it('rejects empty string', () => {
      const result = validateName('');
      expect(result.valid).toBe(false);
    });

    it('rejects whitespace-only string', () => {
      const result = validateName('   ');
      expect(result.valid).toBe(false);
    });

    it('rejects name over 20 characters', () => {
      const result = validateName('A'.repeat(21));
      expect(result.valid).toBe(false);
    });

    it('accepts name at exactly 20 characters', () => {
      const result = validateName('A'.repeat(20));
      expect(result.valid).toBe(true);
    });

    it('rejects name with only special characters', () => {
      const result = validateName('!!!???');
      expect(result.valid).toBe(false);
    });

    it('accepts name with mix of alphanumeric and special chars', () => {
      const result = validateName('Pro_Player!');
      expect(result).toEqual({ valid: true, sanitized: 'Pro_Player!' });
    });

    it('rejects null/undefined', () => {
      expect(validateName(null as unknown as string).valid).toBe(false);
      expect(validateName(undefined as unknown as string).valid).toBe(false);
    });

    it('rejects non-string types', () => {
      expect(validateName(123 as unknown as string).valid).toBe(false);
    });

    it('strips zero-width characters', () => {
      const result = validateName('Te\u200Bst');
      expect(result).toEqual({ valid: true, sanitized: 'Test' });
    });

    it('strips control characters', () => {
      const result = validateName('Te\x00st');
      expect(result).toEqual({ valid: true, sanitized: 'Test' });
    });

    it('rejects name that becomes empty after sanitization', () => {
      const result = validateName('\u200B\u200C\u200D');
      expect(result.valid).toBe(false);
    });
  });

  // ─── Game Terms Allowed ───

  describe('game terms allowed', () => {
    const allowedNames = [
      'Assassin',
      'The Ambassador',
      'Coup Master',
      'Captain Hook',
      'Contessa',
      'Duke of Earl',
    ];

    for (const name of allowedNames) {
      it(`allows game term name: "${name}"`, () => {
        const result = validateName(name);
        expect(result.valid).toBe(true);
      });
    }

    const allowedMessages = [
      'I\'ll assassinate you!',
      'Block that assassination!',
      'Ambassador exchange time',
      'Time to steal your coins',
      'Pass the challenge',
      'I claim Assassin',
    ];

    for (const msg of allowedMessages) {
      it(`allows game message: "${msg}"`, () => {
        const result = validateChatMessage(msg);
        expect(result.valid).toBe(true);
      });
    }
  });

  // ─── Common Words With "ass" Substring Allowed ───

  describe('words with "ass" substring allowed', () => {
    const allowedWords = [
      'class',
      'classic',
      'grass',
      'mass',
      'pass',
      'bass',
      'brass',
      'compass',
      'bypass',
      'embassy',
      'embarrass',
      'trespass',
    ];

    for (const word of allowedWords) {
      it(`allows common word: "${word}"`, () => {
        const result = validateChatMessage(word);
        expect(result.valid).toBe(true);
      });
    }
  });

  // ─── Profanity Blocked ───

  describe('profanity blocked', () => {
    it('blocks direct profanity', () => {
      expect(validateName('fuck').valid).toBe(false);
      expect(validateChatMessage('what the shit').valid).toBe(false);
    });

    it('blocks l33t speak profanity', () => {
      expect(validateName('f@ck').valid).toBe(false);
      expect(validateName('$h1t').valid).toBe(false);
      expect(validateChatMessage('@$$hole').valid).toBe(false);
    });

    it('blocks separated profanity (dots)', () => {
      expect(validateChatMessage('f.u.c.k').valid).toBe(false);
    });

    it('blocks separated profanity (dashes)', () => {
      expect(validateChatMessage('f-u-c-k').valid).toBe(false);
    });

    it('blocks separated profanity (spaces)', () => {
      expect(validateChatMessage('f u c k').valid).toBe(false);
    });

    it('blocks repeated character profanity', () => {
      expect(validateChatMessage('fuuuck').valid).toBe(false);
      expect(validateChatMessage('shiiit').valid).toBe(false);
    });

    it('blocks profanity in mixed case', () => {
      expect(validateName('FuCk').valid).toBe(false);
    });

    it('blocks slurs', () => {
      expect(validateName('nigger').valid).toBe(false);
      expect(validateName('faggot').valid).toBe(false);
      expect(validateChatMessage('you retard').valid).toBe(false);
    });

    it('blocks compound ass words', () => {
      expect(validateChatMessage('asshole').valid).toBe(false);
      expect(validateChatMessage('jackass').valid).toBe(false);
      expect(validateChatMessage('dumbass').valid).toBe(false);
    });

    it('blocks profanity embedded in text', () => {
      expect(validateChatMessage('what the fuck is this').valid).toBe(false);
      expect(validateChatMessage('holy shit dude').valid).toBe(false);
    });
  });

  // ─── Mild Words Allowed ───

  describe('mild words allowed', () => {
    it('allows hell', () => {
      expect(validateChatMessage('what the hell').valid).toBe(true);
    });

    it('allows damn', () => {
      expect(validateChatMessage('damn that was close').valid).toBe(true);
    });

    it('allows crap', () => {
      expect(validateChatMessage('oh crap').valid).toBe(true);
    });
  });

  // ─── validateChatMessage ───

  describe('validateChatMessage', () => {
    it('accepts valid messages', () => {
      const result = validateChatMessage('Hello everyone!');
      expect(result).toEqual({ valid: true, sanitized: 'Hello everyone!' });
    });

    it('rejects empty message', () => {
      expect(validateChatMessage('').valid).toBe(false);
    });

    it('rejects message over 200 characters', () => {
      const result = validateChatMessage('A'.repeat(201));
      expect(result.valid).toBe(false);
    });

    it('accepts message at exactly 200 characters', () => {
      const result = validateChatMessage('A'.repeat(200));
      expect(result.valid).toBe(true);
    });

    it('sanitizes invisible characters', () => {
      const result = validateChatMessage('Hello\u200B world');
      expect(result).toEqual({ valid: true, sanitized: 'Hello world' });
    });

    it('rejects message that becomes empty after sanitization', () => {
      const result = validateChatMessage('\u200B\uFEFF');
      expect(result.valid).toBe(false);
    });

    it('does not require alphanumeric (unlike names)', () => {
      const result = validateChatMessage('!!!');
      expect(result).toEqual({ valid: true, sanitized: '!!!' });
    });
  });

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles very long profanity attempt', () => {
      const result = validateName('fuuuuuuuuuuck');
      expect(result.valid).toBe(false);
    });

    it('handles name with numbers', () => {
      const result = validateName('Player123');
      expect(result).toEqual({ valid: true, sanitized: 'Player123' });
    });

    it('handles emoji in names', () => {
      // Emojis are fine as long as there's also an alphanumeric char
      const result = validateName('Cool 😎');
      expect(result.valid).toBe(true);
    });

    it('allows normal gameplay chat', () => {
      const messages = [
        'gg',
        'nice move',
        'I don\'t believe you',
        'challenge!',
        'blocking with Contessa',
        'lol',
      ];
      for (const msg of messages) {
        expect(validateChatMessage(msg).valid).toBe(true);
      }
    });
  });
});
