# App Update Release Runbook

## Preflight

Run this before creating a TestFlight/App Store build:

```bash
npm run release:preflight
```

For smoke E2E on the local machine:

```bash
npm run test:e2e:smoke
```

Known non-blocking warnings:

- `react-hooks/exhaustive-deps` warnings remain in a few existing components.
- `duplicate:questions` reports exact duplicate candidates. It exits successfully so releases are not blocked, but the content should be cleaned up before a larger question-bank update.
- `build:ios` prints the standard Next.js static export warning because Capacitor uses a static web bundle.

## App Store Checks

- Confirm `ios/App/App/PrivacyInfo.xcprivacy` is included in the Xcode target resources.
- Confirm App Store Connect IAP prices match `lib/types/subscription.ts` and `ios/App/TakkenIAP.storekit`.
- Confirm subscription metadata shows price, period, auto-renewal wording, links to terms/privacy, and restore purchase.
- Confirm no iOS build loads web ad scripts or requests ATT on first launch without user context.

## TestFlight Pass

- Install the build on at least one iPhone and one iPad size.
- Walk through launch, login, free learning flow, premium screen, restore purchases, support, terms, and privacy pages.
- Verify App Review notes include a usable demo account if gated functionality requires login.

## Release Notes Seed

```text
This update improves App Store compliance, subscription display consistency, and release checks. It also stabilizes Firebase initialization and restores automated verification for the main login and home flows.
```
