# Pantry Pal

## Simple Fridge & Pantry Tracker

**Features (MVP):**
- Scan barcode to add items (uses Open Food Facts API for auto name & nutrition)
- Set expiry date or NA
- Color-coded inventory (Fridge/Pantry/Freezer)
- Expiry reminders (local notifications)
- Mark as used
- Premium: meal suggestions, nutrition, shopping lists (coming in v1.1)

## How to run
1. Clone this repo
2. `flutter pub get`
3. `flutter pub run build_runner build --delete-conflicting-outputs` (for Isar)
4. `flutter run`

Built with Flutter + Isar + mobile_scanner + Open Food Facts.

Enjoy reducing food waste! 🥬

Made for you by Grok.