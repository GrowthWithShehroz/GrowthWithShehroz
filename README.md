# Islamic Daily Wisdom

Android app: prayer-time notifications, daily Quranic wisdom cards (shareable), streak tracker,
dark mode, Firebase backend, AdMob ads, RevenueCat subscription.

> **This is the source scaffold.** To produce an installable APK you need to
> drop in your own Firebase / AdMob / RevenueCat credentials and run an EAS
> build on your machine — see `BUILD.md` and `CREDENTIALS.md`.

## Stack

- React Native 0.76 + Expo SDK 52, TypeScript, expo-router v4
- Zustand + AsyncStorage (state), TanStack Query (server state)
- `adhan` (prayer time math) + expo-location + expo-notifications
- `@react-native-firebase/{app,auth,firestore,analytics}` (anonymous auth, public-read wisdom collection, mirrored completions)
- `react-native-google-mobile-ads` (banner + interstitial-every-5-opens)
- `react-native-purchases` (RevenueCat, $0.99/mo `premium` entitlement)
- `react-native-view-shot` + `expo-sharing` (capture wisdom card → PNG → share to WhatsApp / Instagram / system)

## Quick start (development)

```bash
npm install
cp .env.example .env          # edit to add real keys (or leave blank to run in no-op mode)
npx tsc --noEmit              # passes
npx expo prebuild --platform android
eas login
eas build -p android --profile development
```

Install the resulting dev client APK on a physical Android device, then:

```bash
npx expo start --dev-client
```

## Architecture

```
app/                    expo-router screens
  _layout.tsx           bootstraps i18n, auth, IAP, ads, splash
  (tabs)/index.tsx      Home: countdown, daily wisdom card, share, streak
  (tabs)/prayers.tsx    5 prayers + notification toggles + completion ticks
  (tabs)/archive.tsx    Wisdom archive (premium-gated) + search + favorites
  (tabs)/settings.tsx   Location, calc method, sound, theme, language, premium

src/
  components/           UI primitives (WisdomCard, ShareSheet, PaywallSheet, …)
  features/             Domain logic — each feature is self-contained
    prayers/            adhan calc, completions, location
    wisdom/             Firestore reads + offline fallback + daily gate + favorites
    streak/             Timezone-aware streak math
    notifications/      Rolling 7-day window scheduler + permission handling
    share/              View-shot capture + WhatsApp / Instagram intents
    ads/                AdMob client + interstitial counter
    iap/                RevenueCat config + entitlement hydration
    auth/               Firebase anonymous sign-in
  services/             Cross-cutting wrappers (firebase, notifications, i18n, analytics)
  config/env.ts         Single source of truth for environment vars
  store/                Zustand stores (app, user)
  theme/                Islamic green + gold; light/dark
  locales/{en,ur}.json  i18n strings; English fully populated, Urdu populated
  types/                Shared TypeScript models
```

## Service wrappers and graceful degradation

The app boots and runs even when Firebase / AdMob / RevenueCat credentials
are absent — each wrapper logs a `console.warn` in dev and no-ops:

- `services/firebase.ts` returns `null` when the native module fails to load.
  `wisdom/api.ts` falls back to `wisdom/fallback.ts` (curated public-domain
  excerpts) so the daily card always renders.
- `features/ads/client.ts` skips initialization and `AdBanner` renders an
  empty view if the module is missing or the user is premium.
- `features/iap/client.ts` short-circuits when `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`
  is unset; the paywall surfaces a helpful error.

## Verifying the build

After `eas build -p android --profile development` and installing the dev
client, work through this checklist on-device:

- [ ] Settings → Location → Detect location succeeds; city label shows.
- [ ] Prayers tab renders all 5 prayers for today.
- [ ] Toggle Fajr notification → permission prompt → accept.
- [ ] `npx expo start` console prints no scheduling errors.
- [ ] Tick all 5 prayers → return to Home → streak shows 1.
- [ ] Tap "Share today's wisdom" → choose WhatsApp → caption + image attach.
- [ ] Toggle dark mode in Settings → instant theme switch + persists across restart.
- [ ] Banner ad renders (Google test ID); cold-start the app 5× → interstitial fires.
- [ ] Tap "Upgrade to Premium" → RevenueCat sandbox flow → ads disappear, Archive unlocks.

## Out of scope (v2)

- Home-screen widget (requires native Kotlin module + RemoteViews).
- Firebase Analytics dashboards (events are emitted; configure in Firebase console).
- iOS — Android-only as specified.

## Halal monetization

All monetization is utility-based: ad removal, archive access, custom Azan
sounds. No content gating that withholds religious knowledge. AdMob category
filters should be configured in the AdMob console to exclude non-halal
content categories. UMP consent is requested before the first ad request.
