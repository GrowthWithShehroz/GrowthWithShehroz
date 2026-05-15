/**
 * Seed Firestore with curated wisdom cards.
 *
 * Run with admin credentials:
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json \
 *   npx tsx scripts/seed-wisdom.ts ./scripts/wisdom-seed.json
 *
 * The JSON file should be an array of objects matching the WisdomCard shape,
 * each with a `date` (YYYY-MM-DD) used as the document ID.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface SeedCard {
  date: string;
  surah: string;
  surahNumber: number;
  ayah: number;
  arabic: string;
  translationEn: string;
  translationUr?: string;
  reflection: string;
  source: string;
}

async function main(): Promise<void> {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: tsx scripts/seed-wisdom.ts <path-to-seed.json>');
    process.exit(1);
  }
  const path = resolve(file);
  const cards = JSON.parse(readFileSync(path, 'utf8')) as SeedCard[];

  // Lazy-import firebase-admin so the script works even if it's not installed.
  let admin: typeof import('firebase-admin');
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    admin = require('firebase-admin');
  } catch {
    console.error(
      'firebase-admin is not installed. Run: npm install --save-dev firebase-admin',
    );
    process.exit(1);
  }

  if (admin.apps.length === 0) {
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
  }
  const db = admin.firestore();

  for (const c of cards) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(c.date)) {
      console.warn(`Skipping invalid date: ${c.date}`);
      continue;
    }
    await db.collection('wisdom').doc(c.date).set(c, { merge: true });
    console.log(`Seeded ${c.date} (${c.surah} ${c.surahNumber}:${c.ayah})`);
  }
  console.log(`\nDone. ${cards.length} cards processed.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
