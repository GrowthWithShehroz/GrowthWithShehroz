# Assets

This directory holds runtime assets bundled into the app.

## Required before first build

Replace the following placeholders with real assets before running `eas build`:

- `images/icon.png` — 1024×1024 app icon (PNG, no transparency on Android).
- `images/adaptive-icon.png` — 1024×1024 foreground for Android adaptive icon.
- `images/splash.png` — Splash screen (1284×2778 recommended).
- `images/notification-icon.png` — 96×96 monochrome PNG (Android system tints it).
- `sounds/azan-default.mp3` — Default Azan notification sound. Must be valid MP3 placed at this path.

Additional Azan sounds (premium feature):

- `sounds/azan-makkah.mp3`, `sounds/azan-medina.mp3`, etc. After adding files,
  list their IDs in `app/(tabs)/settings.tsx` SOUNDS array and in
  `app.config.ts` plugins.expo-notifications.sounds.

## Fonts

Optional. If you bundle Arabic-friendly fonts (e.g. Amiri), drop the `.ttf`
files in `fonts/` and load them via `expo-font` in `app/_layout.tsx`.

## Source guidance

- Avoid copyrighted Azan recordings; use a royalty-free recording or one for
  which you've secured rights.
- The notification icon must be a single-color silhouette per Android
  guidelines — color renders as white otherwise.
