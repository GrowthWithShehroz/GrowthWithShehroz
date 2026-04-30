/**
 * Validates that all credentials and config files are wired up correctly
 * before triggering an EAS build. Reads only filesystem state — never echoes
 * secret values, only their presence and shape.
 *
 * Usage: npx tsx scripts/validate-credentials.ts
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const EXPECTED_PACKAGE = 'com.islamicdailywisdom.app';

type Check = { name: string; ok: boolean; detail: string };
const checks: Check[] = [];

function check(name: string, ok: boolean, detail: string): void {
  checks.push({ name, ok, detail });
}

function loadEnv(file: string): Record<string, string> {
  if (!existsSync(file)) return {};
  const raw = readFileSync(file, 'utf8');
  const out: Record<string, string> = {};
  for (const line of raw.split('\n')) {
    const m = /^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/.exec(line.trim());
    if (m && m[1] && m[2] !== undefined) out[m[1]] = m[2];
  }
  return out;
}

const root = resolve(__dirname, '..');
const env = loadEnv(resolve(root, '.env'));

// 1. .env presence
check('.env file exists', existsSync(resolve(root, '.env')), resolve(root, '.env'));

// 2. AdMob format
const admobApp = env['EXPO_PUBLIC_ADMOB_ANDROID_APP_ID'];
check(
  'AdMob app ID set and well-formed',
  !!admobApp && /^ca-app-pub-\d{16}~\d+$/.test(admobApp),
  admobApp ? `prefix ${admobApp.slice(0, 19)}…` : 'missing',
);

const admobBanner = env['EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID'];
check(
  'AdMob banner unit set and well-formed',
  !!admobBanner && /^ca-app-pub-\d{16}\/\d+$/.test(admobBanner),
  admobBanner ? `prefix ${admobBanner.slice(0, 19)}…` : 'missing',
);

const admobInter = env['EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID'];
check(
  'AdMob interstitial unit set and well-formed',
  !!admobInter && /^ca-app-pub-\d{16}\/\d+$/.test(admobInter),
  admobInter ? `prefix ${admobInter.slice(0, 19)}…` : 'missing',
);

// 3. AdMob publisher ID consistency (banner + interstitial should share publisher)
if (admobApp && admobBanner && admobInter) {
  const pub = (s: string): string | undefined => /^ca-app-pub-(\d{16})/.exec(s)?.[1];
  const a = pub(admobApp);
  const b = pub(admobBanner);
  const i = pub(admobInter);
  check(
    'AdMob publisher ID consistent across app/banner/interstitial',
    !!a && a === b && a === i,
    a ? `publisher ${a}` : 'unparseable',
  );
}

// 4. RevenueCat key shape
const rc = env['EXPO_PUBLIC_REVENUECAT_ANDROID_KEY'];
check(
  'RevenueCat Android key set and well-formed',
  !!rc && /^goog_[A-Za-z0-9]{20,}$/.test(rc),
  rc ? `prefix ${rc.slice(0, 5)}… (${rc.length} chars)` : 'missing',
);

// 5. EAS project ID is a UUID
const easId = env['EAS_PROJECT_ID'];
check(
  'EAS project ID set and a valid UUID',
  !!easId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(easId),
  easId ?? 'missing',
);

// 6. google-services.json
const gsPath = env['GOOGLE_SERVICES_JSON'] || './android/google-services.json';
const gsResolved = resolve(root, gsPath);
const gsExists = existsSync(gsResolved);
check('google-services.json exists at configured path', gsExists, gsResolved);

if (gsExists) {
  let gs: any;
  try {
    gs = JSON.parse(readFileSync(gsResolved, 'utf8'));
  } catch (e) {
    check('google-services.json is valid JSON', false, String(e));
  }
  if (gs) {
    check('google-services.json is valid JSON', true, 'parsed');
    const projectId = gs.project_info?.project_id;
    check('google-services.json has project_id', !!projectId, projectId ?? 'missing');
    const pkg = gs.client?.[0]?.client_info?.android_client_info?.package_name;
    check(
      `google-services.json package matches ${EXPECTED_PACKAGE}`,
      pkg === EXPECTED_PACKAGE,
      pkg ?? 'missing',
    );
    const apiKey = gs.client?.[0]?.api_key?.[0]?.current_key;
    check(
      'google-services.json has an API key',
      !!apiKey && apiKey.length > 20,
      apiKey ? `${apiKey.slice(0, 6)}… (${apiKey.length} chars)` : 'missing',
    );
  }
}

// 7. .gitignore covers secrets
const gi = readFileSync(resolve(root, '.gitignore'), 'utf8');
check('.env is gitignored', gi.includes('.env'), '.gitignore line found');
check(
  'android/google-services.json is gitignored',
  gi.includes('android/google-services.json'),
  '.gitignore line found',
);

// 8. Native config files
check(
  'app.config.ts exists',
  existsSync(resolve(root, 'app.config.ts')),
  'app.config.ts',
);
check(
  'eas.json exists',
  existsSync(resolve(root, 'eas.json')),
  'eas.json',
);

// 9. Wisdom seed has entries
const seedPath = resolve(root, 'scripts/wisdom-seed.json');
if (existsSync(seedPath)) {
  try {
    const seed = JSON.parse(readFileSync(seedPath, 'utf8'));
    check(
      'wisdom-seed.json has 7+ entries',
      Array.isArray(seed) && seed.length >= 7,
      `${seed.length} entries`,
    );
  } catch (e) {
    check('wisdom-seed.json is valid JSON', false, String(e));
  }
}

// Report
let pass = 0;
let fail = 0;
for (const c of checks) {
  const mark = c.ok ? 'OK ' : 'FAIL';
  console.log(`${mark}  ${c.name.padEnd(50)} ${c.detail}`);
  if (c.ok) pass++;
  else fail++;
}
console.log('');
console.log(`Summary: ${pass} passed, ${fail} failed.`);
if (fail > 0) {
  console.log('\nFix the FAIL items above before running `eas build`.');
  process.exit(1);
}
console.log('\nAll credentials and config look valid. You are ready to build.');
console.log('Next: npx eas-cli build -p android --profile production');
