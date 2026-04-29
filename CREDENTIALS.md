# Credentials Setup

The app boots and runs without any of these — services no-op gracefully and
log a warning in dev. **Real credentials are required for a production
release**, and recommended for a useful development build.

## 1. Firebase

1. Create a Firebase project at https://console.firebase.google.com.
2. Enable **Authentication → Anonymous**.
3. Enable **Firestore Database** (production mode is fine; rules below).
4. Add an Android app with package `com.islamicwisdom.app`.
5. Download `google-services.json` and save as `android/google-services.json`.
6. (Optional) Upload `firestore.rules` (in repo root) as the security rules.
7. (Optional) Pre-populate `wisdom/{YYYY-MM-DD}` documents:

   ```bash
   npm install --save-dev firebase-admin
   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json \
     npx tsx scripts/seed-wisdom.ts ./scripts/wisdom-seed.json
   ```

## 2. Google AdMob

1. Sign up at https://admob.google.com.
2. Create an Android app (mark it as not yet on the Play Store for testing).
3. Create one banner and one interstitial ad unit.
4. Set in `.env`:

   ```
   EXPO_PUBLIC_ADMOB_ANDROID_APP_ID=ca-app-pub-XXXX~XXXX
   EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID=ca-app-pub-XXXX/XXXX
   EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID=ca-app-pub-XXXX/XXXX
   ```

> **Use Google's test IDs in development.** Pointing real IDs at a test
> device repeatedly can get the AdMob account flagged. The values shipped in
> `.env.example` are Google's published test IDs.

## 3. RevenueCat

1. Sign up at https://app.revenuecat.com.
2. Create a project; add an Android app with the same package name.
3. Connect Google Play Console (Service Account JSON) so RevenueCat can
   validate receipts.
4. In the Play Console, create a subscription product (e.g., `premium_monthly`,
   $0.99/month).
5. In RevenueCat, create an offering and attach the product. Create an
   entitlement called `premium` (or change `EXPO_PUBLIC_REVENUECAT_PREMIUM_ENTITLEMENT`).
6. Set the public Android API key in `.env`:

   ```
   EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_XXXXXXXXXXXXXXXX
   ```

## 4. Instagram Stories share (optional)

Without this, "Share to Instagram Stories" falls back to the system share
sheet.

1. Register a Facebook App at https://developers.facebook.com.
2. Set `EXPO_PUBLIC_FACEBOOK_APP_ID=...` in `.env`.

## 5. EAS

```bash
eas init                                # writes EAS_PROJECT_ID — copy into .env
```

## File locations summary

| File                              | Purpose                            | Committed?     |
|-----------------------------------|------------------------------------|----------------|
| `.env`                            | Local credentials                  | ❌ (gitignored) |
| `.env.example`                    | Template / test IDs                | ✅              |
| `android/google-services.json`    | Firebase Android config            | ❌ (gitignored) |
| `firestore.rules`                 | Firestore security rules           | ✅              |
| `service-account.json`            | Admin SDK key for seed script      | ❌ (do not commit) |
