# Build & Release Guide

## Prerequisites

- Node.js 20+, npm or yarn
- An Expo account (`https://expo.dev`) — free tier works for dev/preview builds.
- An Android device for testing (the dev client requires installing an APK).
- Real Firebase / AdMob / RevenueCat credentials (see `CREDENTIALS.md`) before
  shipping a production build. Test IDs are wired in for development.

## One-time setup

```bash
npm install
npm install -g eas-cli                 # if you don't already have it
eas login
eas init                                # creates an EAS project + writes EAS_PROJECT_ID
cp .env.example .env                    # then edit
```

Drop your Firebase config at `android/google-services.json`. (Not committed —
listed in `.gitignore`.)

## Development build (dev client APK, used for daily iteration)

```bash
eas build -p android --profile development
# downloads APK URL when complete; install on your Android device
npx expo start --dev-client
```

Why a dev client and not Expo Go: this app uses native modules
(`@react-native-firebase/*`, `react-native-google-mobile-ads`,
`react-native-purchases`) that Expo Go does not support.

## Internal preview build (APK for sideload)

```bash
eas build -p android --profile preview
```

Produces an `.apk`. Useful for distributing to testers before submitting to
the Play Store.

## Production build (AAB for Play Store)

```bash
eas build -p android --profile production
```

Produces an `.aab` (Android App Bundle). Upload to Google Play Console.

## Signing keys

EAS manages your Android keystore by default. **Back it up**:

```bash
eas credentials                         # interactive — choose Android → Production → Download
```

> Losing the keystore means you cannot publish updates to the same listing.
> Save the downloaded `.jks` somewhere safe and offline.

## Submitting to the Play Store

```bash
eas submit -p android --latest
```

Requires a Google Play service account JSON; see Expo's `eas submit` docs.

## Play Store listing

- **Title:** Islamic Daily Wisdom — Prayer Timer & Quranic Quotes
- **Short description:** Daily Quranic wisdom, accurate prayer times, and
  gentle Azan reminders.
- **Full description:** Get a beautiful, shareable Quranic verse every day.
  Receive Azan reminders for all five daily prayers based on your location.
  Track your daily streak. Optional Premium ($0.99/mo) removes ads, unlocks
  the wisdom archive, and adds custom Azan sounds.
- **Keywords:** Islamic, Prayer, Quran, Salah, Timer, Pakistan, Azan, Reminder
- **Category:** Lifestyle (or Books & Reference)
- **Content rating:** Everyone

### Data Safety form

The app collects/uses:

- **Location** — used on-device for prayer time calculation. Approximate
  location is sent to no third party. Optional reverse-geocoding through the
  device's location service for the displayed city label.
- **Notifications** — scheduled locally on the device.
- **Authentication** — Firebase anonymous auth (random UID, no PII).
- **App activity** — Firebase Analytics (anonymized).
- **Purchases** — RevenueCat for receipt validation.
- **Ads** — Google AdMob personalized/non-personalized based on UMP consent.

Declare each in the Data Safety form. Do not declare collection of name,
email, or phone — the app does not request them.

### Play Store policies — what to avoid

- Do **not** describe Premium as unlocking "more religious content" or
  "deeper spiritual rewards" — Play has rejected listings phrased this way.
  Frame it strictly as utility (ads, archive, sounds).
- Provide a privacy policy URL. A minimal compliant policy must mention
  Firebase, AdMob, RevenueCat, and location use.

## Troubleshooting

- `Failed to load module @react-native-firebase/app`: you're running in Expo
  Go. Switch to a dev client build (`eas build --profile development`).
- `Notifications not firing on Android`: ensure the device is not battery-
  optimizing the app (Settings → Apps → Battery → Unrestricted) and that
  POST_NOTIFICATIONS was granted.
- `AdMob banner is blank`: in dev, only Google test IDs are guaranteed to
  serve. Real units may take hours to start filling for a new app.
