# Play Store Release — Handoff Checklist

This is the single, ordered list of steps that **only you** can do to get
the app from this repo onto the Play Store. The codebase is otherwise
production-ready: typecheck passes, tests pass, error boundary is wired,
permissions are declared, privacy policy is in repo.

Estimated time: **~3 hours of human time** + 30–60 min of EAS build wait.

---

## Step 1 — One-time accounts ($25 + free)

- [ ] **Google Play Developer Console** — sign up at
      https://play.google.com/console (one-time **$25** fee, requires a
      credit card and ID verification, takes 1–2 days for ID verification).
- [ ] **Firebase project** — https://console.firebase.google.com → New
      project → enable **Authentication (Anonymous)** and **Firestore
      (production mode)**.
- [ ] **Google AdMob** account — https://admob.google.com → add an Android
      app → create one **banner** unit and one **interstitial** unit. Save
      both unit IDs.
- [ ] **RevenueCat** — https://app.revenuecat.com → new project → Android
      app with package `com.islamicdailywisdom.app` → connect Play Console
      via Service Account JSON.
- [ ] **Expo (EAS)** — https://expo.dev → free tier is fine for first
      build.

## Step 2 — Wire credentials into the repo

```bash
cp .env.example .env
```

Edit `.env`:

```
EXPO_PUBLIC_ADMOB_ANDROID_APP_ID=ca-app-pub-XXXX~XXXX
EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID=ca-app-pub-XXXX/XXXX
EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID=ca-app-pub-XXXX/XXXX
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_XXXXXXXX
EXPO_PUBLIC_FACEBOOK_APP_ID=                  # optional, only for IG Stories share
EAS_PROJECT_ID=                                # filled by `eas init` below
```

- [ ] Download `google-services.json` from Firebase Console → Project
      settings → Your apps → Android → save it as
      `android/google-services.json`. **Do not commit it** — it is
      gitignored.

## Step 3 — Seed the wisdom collection (optional but recommended)

```bash
# Firebase admin SDK to write seed data
npm install --save-dev firebase-admin

# Download a service account key from Firebase Console → Project Settings →
# Service accounts → Generate new private key → save as ./service-account.json

GOOGLE_APPLICATION_CREDENTIALS=./service-account.json \
  npm run seed:wisdom -- ./scripts/wisdom-seed.json
```

This writes 30 days of Quranic wisdom (2026-04-29 → 2026-05-28). Add
more entries to `scripts/wisdom-seed.json` and re-run any time.

## Step 4 — EAS init + first build

```bash
npm install -g eas-cli
eas login
eas init        # creates an EAS project; copy the printed project ID into .env
```

Production AAB build:

```bash
eas build -p android --profile production
```

Wait 15–30 min. EAS will print a URL to download the `.aab`.

> First build will prompt to generate a keystore. Accept the default
> (EAS-managed). Immediately back it up: `eas credentials → Android →
> Production → Download keystore`. **Losing this keystore means you can
> never publish updates to the same listing.**

## Step 5 — Replace placeholder assets (before public release)

Currently committed are placeholder PNGs and a stub azan mp3. Before
publicly listing the app, replace:

- [ ] `assets/images/icon.png` — 1024×1024 PNG, no transparency
- [ ] `assets/images/adaptive-icon.png` — 1024×1024 foreground (transparent
      OK)
- [ ] `assets/images/splash.png` — 1284×2778 PNG, content centered
- [ ] `assets/images/notification-icon.png` — 96×96 white-on-transparent
- [ ] `assets/sounds/azan_default.mp3` — a properly licensed azan mp3 (≤ 30s,
      ≤ 1 MB recommended)

After replacing, rebuild: `eas build -p android --profile production`.

## Step 6 — Play Console listing

In Play Console → All apps → **Create app**:

- **App name**: Islamic Daily Wisdom
- **Default language**: English (United States)
- **App or game**: App
- **Free or paid**: Free
- **Declarations**: tick all required boxes

### Store listing

- **Short description** (≤ 80 chars):
  > Daily Quranic wisdom, accurate prayer times, gentle Azan reminders.
- **Full description**: see `BUILD.md` for a starter — keep monetization
  framing utility-only (no "more spiritual rewards").
- **App icon**: 512×512 (Play Console will auto-derive)
- **Feature graphic**: 1024×500 PNG
- **Phone screenshots**: 2–8 PNGs at 1080×1920 or larger (capture from your
  device after the dev build).

### App content

- **Privacy policy URL**: host `PRIVACY.md` somewhere public (GitHub
  Pages, Firebase Hosting, or your domain) and paste the URL here.
- **App access**: All functionality available without signing in.
- **Ads**: **Yes**, app contains ads.
- **Content rating**: complete the questionnaire → choose Reference.
- **Target audience**: 13+
- **Data safety form**: declare:
  - Location (approximate + precise) — optional, on-device only
  - User-generated content (favorites, streak) — optional
  - App activity (analytics) — yes
  - Device IDs (ads) — yes
  - **Do not** declare name/email/phone — the app does not collect them.

### Subscriptions

In Play Console → Monetize → Subscriptions:

- [ ] Create subscription product: ID = `premium_monthly`, price = $0.99/month,
      base plan = monthly auto-renewing.
- [ ] In RevenueCat: add this product to the `default` offering, attach to
      the `premium` entitlement.

## Step 7 — Internal testing track upload

```bash
eas submit -p android --latest --track internal
```

Or manually: Play Console → Testing → Internal testing → Create new release
→ upload the `.aab` from Step 4.

- [ ] Add at least one tester email in the Internal testing tester list.
- [ ] Wait for review (usually < 1 hour for internal track).
- [ ] Install on your device via the opt-in link, work through the on-device
      checklist in `README.md` ("Verifying the build").

## Step 8 — Promote to production

When internal testing looks good:

- [ ] Play Console → Testing → Internal testing → click your release →
      **Promote release** → Production.
- [ ] Fill any remaining listing fields.
- [ ] Submit for review.

First-time review for a new app: typically 1–7 days.

## Step 9 — Post-launch

- [ ] Hide test AdMob unit IDs (the ones in `.env.example`) from production
      `.env`. Real units will start filling within a few hours of first
      install.
- [ ] In AdMob console → Apps → Settings → **Content filters**: exclude
      categories incompatible with the app's audience.
- [ ] Configure Firebase Analytics audiences/dashboards.
- [ ] Set up RevenueCat webhook → your backend (or Slack) for subscription
      events.

## Step 10 — Future updates

For every code change you ship:

```bash
# bump only one of these in app.config.ts
# - version: "1.0.1"  (user-visible)
# eas.json autoIncrement is on, so versionCode bumps automatically.
git commit -am "release: 1.0.1 — bug fixes"
eas build -p android --profile production
eas submit -p android --latest --track production
```

That's it.

---

## What's already done in the repo

- App scaffold, all 4 screens, all features (prayers/wisdom/streak/share/ads/IAP/auth)
- 30-day Quranic wisdom seed
- Offline fallback when Firebase is unavailable
- Error boundary at root
- "Delete my data" button (honors privacy policy section 6)
- Permissions including `SCHEDULE_EXACT_ALARM` for accurate prayer times
- Privacy policy template (`PRIVACY.md`)
- CI: typecheck + 28 unit tests on every PR
- EAS profiles for development / preview / production
