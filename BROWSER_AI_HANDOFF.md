# Browser AI End-to-End Handoff Prompt

Copy the block below into a browser AI that has **computer use** capability
(Claude with Computer Use, Manus AI, OpenAI Operator). It will drive every
remaining web step end-to-end. You only intervene for logins, 2FA codes,
and final approval clicks.

Estimated total wall-clock time: **3–4 hours** (most of it waiting on EAS
build queue + Google review).

---

## Prompt

```
ROLE: You are an end-to-end build & release operator for an Android app.

GOAL: Get the "Islamic Daily Wisdom" app live on Google Play Store
internal testing track, then promote to production. The codebase is
already complete and pushed; all credentials are wired. You only need
to drive the web dashboards.

== ACCOUNTS & URLS ==

Repo:           https://github.com/GrowthWithShehroz/GrowthWithShehroz
Branch:         claude/islamic-wisdom-app-continue-6tip4
PR:             https://github.com/GrowthWithShehroz/GrowthWithShehroz/pull/2
Expo:           https://expo.dev/accounts/growthwithshehroz/projects/islamic-daily-wisdom
EAS Project ID: 1c5702a2-5c9e-4bff-909e-1dadda166f73
GitHub Actions: https://github.com/GrowthWithShehroz/GrowthWithShehroz/actions
Play Console:   https://play.google.com/console
Firebase:       https://console.firebase.google.com/project/islamic-daily-wisdom
Privacy URL:    https://growthwithshehroz.github.io/GrowthWithShehroz/privacy.html
Android pkg:    com.islamicdailywisdom.app
Owner login:    growthwithshehroz

== ARTIFACTS ALREADY IN REPO ==

assets/screenshots/01-home.png            (1080x1920) for Play Console
assets/screenshots/02-prayers.png         (1080x1920) for Play Console
assets/screenshots/03-archive.png         (1080x1920) for Play Console
assets/screenshots/04-settings-dark.png   (1080x1920) for Play Console
assets/screenshots/05-onboarding.png      (1080x1920) for Play Console
assets/images/icon.png                    (1024x1024) app icon for Play
assets/images/feature-graphic.png         (1024x500) Play feature graphic
PLAY_STORE_LISTING.md                     all listing copy en + ur
PRIVACY.md                                privacy policy text (already
                                          published as HTML at Privacy URL)

To download any of these locally so you can upload them:
  GET https://github.com/GrowthWithShehroz/GrowthWithShehroz/raw/claude/islamic-wisdom-app-continue-6tip4/<path>

== EXECUTION PLAN ==

Execute each phase in order. After each phase, post a short status
update before continuing.

------------------------------------------------------------------
PHASE A — Verify GitHub Pages is live
------------------------------------------------------------------
1. Open https://growthwithshehroz.github.io/GrowthWithShehroz/privacy.html
2. Confirm it loads, shows "Privacy Policy" heading, "Last updated" date.
3. If 404: open https://github.com/GrowthWithShehroz/GrowthWithShehroz/settings/pages
   - Source = "Deploy from a branch"
   - Branch = claude/islamic-wisdom-app-continue-6tip4
   - Folder = /docs
   - Save. Wait 2-3 min, retry the URL.
   IF you cannot access settings (login required), STOP and ask the
   human to enable Pages, then continue.

------------------------------------------------------------------
PHASE B — Trigger / verify the EAS production build
------------------------------------------------------------------
1. Open https://github.com/GrowthWithShehroz/GrowthWithShehroz/actions/workflows/eas-production-build.yml
   IF login required: STOP, ask the human to log into GitHub.
2. Check the most recent run.
   IF status is "in_progress" or "queued": wait until it completes.
   IF status is "success": go to step 3.
   IF status is "failure": click the latest run, expand the failed step,
     copy the FULL error message verbatim. STOP and post the error so
     a code fix can be pushed. Do NOT try to "fix" it yourself.
3. Click "Run workflow" button (right side), branch =
   claude/islamic-wisdom-app-continue-6tip4. Click green Run.
4. Wait for the run to reach the "Build Android production AAB" step
   and show "eas build" output. The CLI will queue the actual build
   on EAS cloud and return success quickly (because of --no-wait if
   present, otherwise the action will hold the runner for ~30 min).

------------------------------------------------------------------
PHASE C — Wait for EAS cloud build, download AAB
------------------------------------------------------------------
1. Open https://expo.dev/accounts/growthwithshehroz/projects/islamic-daily-wisdom/builds
   IF login required: STOP, ask the human to log into Expo.
2. Find the most recent Android production build at the top.
3. Wait until status = "Finished" (typically 15-30 min from queue,
   could be longer on free tier). Refresh every 2 min.
   IF status = "Errored" or "Canceled": click into the build, copy the
   tail of "Build logs" (last 50 lines), STOP and post them.
4. On the finished build page, find the "Download" button for the .aab
   file. Save it locally as `IslamicDailyWisdom-1.0.0.aab`.

------------------------------------------------------------------
PHASE D — Play Console: create app + upload AAB to internal testing
------------------------------------------------------------------
1. Open https://play.google.com/console
   IF login required: STOP, ask the human to log into Play Console.
2. If "Islamic Daily Wisdom" doesn't already exist: click "Create app".
   - App name: Islamic Daily Wisdom
   - Default language: English (United States)
   - App or game: App
   - Free or paid: Free
   - Confirm declarations (Developer Program Policies + US export laws)
   - Create app.
3. Side menu -> Testing -> Internal testing -> Create new release.
4. App signing: accept "Use Play App Signing" (default; Google manages
   the upload key indirectly). If prompted to upload an upload-key
   certificate, STOP — ask the human; this requires the EAS keystore
   credentials.
5. Click "Upload" and select IslamicDailyWisdom-1.0.0.aab.
   Wait for processing (2-5 min).
6. Release name: 1.0.0 (auto-filled from versionCode).
7. Release notes (en-US): paste this exactly:
   ```
   ✨ Introducing Islamic Daily Wisdom
   - Daily Quranic verse with reflection
   - 5-prayer schedule from your location
   - Gentle Azan notifications
   - Streak tracker
   - Light + dark mode, Urdu support
   - Beautiful share-to-image card
   - Premium: ad-free + wisdom archive
   ```
8. Save. (Don't roll out yet — listing must be filled first.)

------------------------------------------------------------------
PHASE E — Fill the Store listing
------------------------------------------------------------------
Side menu -> Grow -> Store presence -> Main store listing.

For each field, copy from the corresponding section of:
https://github.com/GrowthWithShehroz/GrowthWithShehroz/blob/claude/islamic-wisdom-app-continue-6tip4/PLAY_STORE_LISTING.md

5.1 App name: "Islamic Daily Wisdom"
5.2 Short description: from the "Short description" section in the file
5.3 Full description: from the "Full description" section
5.4 Graphics:
    - App icon: upload assets/images/icon.png
    - Feature graphic: upload assets/images/feature-graphic.png
    - Phone screenshots: upload all 5 PNGs from assets/screenshots/
      (01-home through 05-onboarding) in order
5.5 Save.
5.6 Click "Manage translations" -> Add Urdu (ur-PK), copy the Urdu
    sections from PLAY_STORE_LISTING.md into the same fields. Save.

------------------------------------------------------------------
PHASE F — Fill App content
------------------------------------------------------------------
Side menu -> Policy -> App content. Complete EVERY required item:

6.1 Privacy policy
    URL: https://growthwithshehroz.github.io/GrowthWithShehroz/privacy.html
6.2 App access: All functionality available without restrictions
6.3 Ads: Yes, my app contains ads
6.4 Content ratings:
    - Start questionnaire
    - Category: Reference, News, or Educational
    - Answer: no violence, no sexual content, no profanity, no drugs,
      no gambling, no UGC, no location-sharing, no PII collection
    - Save and apply
6.5 Target audience and content:
    - Target age: 13 and over (NOT children)
    - Appeals to children: No
6.6 News app: No
6.7 COVID-19 contact tracing: No
6.8 Data safety:
    - Does your app collect or share any of the required user data
      types? YES
    - Approximate location: optional, on-device only, not shared
    - Precise location: optional, on-device only, not shared
    - App interactions (App activity): collected, not shared, optional,
      analytics
    - Crash logs: collected, not shared, optional, diagnostics
    - Device or other IDs: collected, SHARED with AdMob, optional,
      advertising
    - Save.
    - Do NOT declare: name, email, phone, address, photos, contacts,
      messages, files, or any health/financial data.
6.9 Government apps: No
6.10 Financial features: No

------------------------------------------------------------------
PHASE G — Set up subscription product (one-time)
------------------------------------------------------------------
Side menu -> Monetize with Play -> Products -> Subscriptions.
1. Create subscription
   - Product ID: premium_monthly
   - Name: Premium Monthly
   - Description: Removes ads, unlocks wisdom archive, custom Azan
     sounds.
2. Add base plan
   - Base plan ID: monthly
   - Auto-renewing
   - Billing period: 1 month
   - Price: USD 0.99 (auto-converts to PKR ~280)
3. Save and activate.

------------------------------------------------------------------
PHASE H — Roll out to internal testing
------------------------------------------------------------------
1. Side menu -> Testing -> Internal testing -> click into the saved
   release from Phase D.
2. Review tab -> ensure no errors / warnings remain. If any errors,
   STOP and post them.
3. Click "Start rollout to Internal testing".
4. Confirm. Status becomes "Available to testers" within ~1 hour.
5. Testers tab -> Add tester emails (ask the human for emails to add).
6. Copy the "How testers join your test" opt-in URL. Paste it in your
   final summary.

------------------------------------------------------------------
PHASE I — Final summary
------------------------------------------------------------------
Post a single message containing:
- ✅/❌ for each phase
- The opt-in URL for internal testing
- Any errors that need a code fix
- Estimated time until production submission (after the human installs
  and verifies the internal-testing build on a real Android phone)

== RULES ==

- Never enter passwords, 2FA codes, or one-time tokens. Always stop
  and ask the human.
- Never click "Promote to Production" without explicit human approval —
  Phase I ends at internal testing.
- If a button is greyed out or a field is missing, screenshot the
  current page and ask the human.
- Don't refresh the same page faster than every 30 seconds.
- If a build fails, post the error verbatim — do not try to debug.
- For every phase you skip or fail, explain why.

Begin Phase A.
```

---

## Notes for the human (you)

1. **Login moments** — be near your phone for 2FA codes when the AI hits:
   - GitHub login
   - Expo login
   - Play Console login
   - Possibly Firebase / RevenueCat (only if it has to re-verify)

2. **Build failure recovery** — if the EAS build fails, the AI will
   stop and paste the error. Send that error back to me and I'll push
   a fix to the repo. Then re-trigger the workflow and continue from
   Phase B.

3. **Keystore prompt** — first build, EAS asks "Generate a new Android
   Keystore?" Answer **YES** (EAS-managed, default). After build,
   download a backup from `https://expo.dev/accounts/growthwithshehroz/projects/islamic-daily-wisdom/credentials`
   and save it offline. Losing this keystore = cannot ship updates ever.

4. **First production review** — Google takes 1–7 days for new apps.
   Don't push hourly updates during that window or you'll restart the
   review.
