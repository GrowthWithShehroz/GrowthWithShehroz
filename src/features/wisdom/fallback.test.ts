import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { fallbackCardForDate, fallbackCards } from './fallback';

const REQUIRED_KEYS = [
  'id',
  'date',
  'surah',
  'surahNumber',
  'ayah',
  'arabic',
  'translationEn',
  'reflection',
  'source',
] as const;

describe('fallbackCardForDate', () => {
  it('returns a complete card', () => {
    const card = fallbackCardForDate('2026-04-30');
    for (const k of REQUIRED_KEYS) {
      assert.ok(card[k] !== undefined && card[k] !== '', `missing field: ${k}`);
    }
  });

  it('is deterministic for the same date', () => {
    const a = fallbackCardForDate('2026-04-30');
    const b = fallbackCardForDate('2026-04-30');
    assert.deepEqual(a, b);
  });

  it('produces variation across different dates', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 14; i++) {
      const date = `2026-05-${String(i + 1).padStart(2, '0')}`;
      seen.add(`${fallbackCardForDate(date).surah}-${fallbackCardForDate(date).ayah}`);
    }
    // Across 14 different dates, expect at least 2 distinct verses to surface.
    assert.ok(seen.size >= 2, `expected variation, got ${seen.size}`);
  });

  it('uses the supplied date as the id', () => {
    const card = fallbackCardForDate('2026-01-15');
    assert.equal(card.id, '2026-01-15');
    assert.equal(card.date, '2026-01-15');
  });
});

describe('fallbackCards', () => {
  it('returns a non-empty list of valid cards', () => {
    const cards = fallbackCards();
    assert.ok(cards.length > 0);
    for (const c of cards) {
      for (const k of REQUIRED_KEYS) {
        assert.ok(c[k] !== undefined && c[k] !== '', `missing ${k} on ${c.date}`);
      }
      assert.match(c.date, /^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('returns dates in descending order from today', () => {
    const cards = fallbackCards();
    for (let i = 1; i < cards.length; i++) {
      assert.ok(
        cards[i - 1]!.date > cards[i]!.date,
        `expected descending: ${cards[i - 1]!.date} > ${cards[i]!.date}`,
      );
    }
  });
});
