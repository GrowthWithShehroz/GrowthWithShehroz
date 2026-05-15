import type { WisdomCard } from '@/types';

// Curated, attributed Sahih International translations. Replace by populating the
// `wisdom/{YYYY-MM-DD}` Firestore collection via scripts/seed-wisdom.ts.
const SEED: Omit<WisdomCard, 'id' | 'date'>[] = [
  {
    surah: 'Al-Baqarah',
    surahNumber: 2,
    ayah: 286,
    arabic: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    translationEn: 'Allah does not burden a soul beyond that it can bear.',
    reflection:
      'Whatever you face today, it has been measured for your strength. Take the next small step.',
    source: 'Quran 2:286 — Sahih International',
  },
  {
    surah: 'Ash-Sharh',
    surahNumber: 94,
    ayah: 6,
    arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    translationEn: 'Indeed, with hardship comes ease.',
    reflection: 'Difficulty and ease arrive together. Patience reveals what struggle conceals.',
    source: 'Quran 94:6 — Sahih International',
  },
  {
    surah: 'At-Talaq',
    surahNumber: 65,
    ayah: 3,
    arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
    translationEn: 'And whoever relies upon Allah — then He is sufficient for him.',
    reflection: 'Do your part with sincerity, then release the outcome.',
    source: 'Quran 65:3 — Sahih International',
  },
  {
    surah: 'Ar-Ra’d',
    surahNumber: 13,
    ayah: 28,
    arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    translationEn: 'Verily, in the remembrance of Allah do hearts find rest.',
    reflection: 'When the mind is loud, return to remembrance. Stillness follows.',
    source: 'Quran 13:28 — Sahih International',
  },
  {
    surah: 'Al-Mulk',
    surahNumber: 67,
    ayah: 2,
    arabic: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا',
    translationEn:
      '[He] who created death and life to test you [as to] which of you is best in deed.',
    reflection: 'Excellence over quantity. Choose the next action with care.',
    source: 'Quran 67:2 — Sahih International',
  },
  {
    surah: 'Al-Anfal',
    surahNumber: 8,
    ayah: 46,
    arabic: 'وَاصْبِرُوا ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
    translationEn: 'And be patient. Indeed, Allah is with the patient.',
    reflection: 'Patience is not silence. It is steady action without despair.',
    source: 'Quran 8:46 — Sahih International',
  },
  {
    surah: 'Al-Imran',
    surahNumber: 3,
    ayah: 159,
    arabic: 'فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ',
    translationEn: 'And when you have decided, then rely upon Allah.',
    reflection: 'Decide. Commit. Trust the path you walked toward with intention.',
    source: 'Quran 3:159 — Sahih International',
  },
];

function hashDate(date: string): number {
  let h = 0;
  for (let i = 0; i < date.length; i++) h = (h * 31 + date.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function fallbackCardForDate(date: string): WisdomCard {
  const idx = hashDate(date) % SEED.length;
  const seed = SEED[idx]!;
  return { id: date, date, ...seed };
}

export function fallbackCards(): WisdomCard[] {
  const today = new Date();
  return SEED.map((seed, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    return { id: date, date, ...seed };
  });
}
