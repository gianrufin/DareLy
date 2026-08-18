# DareLy — Daily Micro-Moments for Married Life

> A minimalist, daily micro-connection flashcard application crafted exclusively for spouses and married couples to cultivate spontaneous intimacy, playful laughter, and deep emotional connection in just 3–5 minutes a day.

---

## 📖 Overview

In the routine of busy workdays, household chores, and family commitments, intentional intimacy between spouses often gets pushed aside. 

**DareLy** solves this by delivering a daily, bite-sized ritual: **3 Curated Sparks Dealt Every Midnight**. Instead of demanding hours of planning, DareLy offers simple, high-impact micro-challenges and conversation starters designed to reignite closeness with zero friction.

---

## ✨ The "Daily 3 Sparks" System

Every day at midnight, a fresh set of 3 curated cards is dealt specifically for you and your spouse:

1. **Spark 1: Playful & Sensory Challenge**
   - *Purpose*: Inject spontaneous laughter, novelty, and fun.
   - *Examples*: 60-second compliment duels, pantry blind taste-tests, playful staring contests.
2. **Spark 2: Romance & Physical Touch**
   - *Purpose*: Release oxytocin and melt daily stress through intentional touch.
   - *Examples*: The 60-second slow dance, whispered confessions, unhurried shoulder massages.
3. **Spark 3: Deep Conversation & Intimacy**
   - *Purpose*: Foster emotional safety, mutual vulnerability, and undivided presence.
   - *Examples*: 30-second unbroken eye gazing, future dream sharing, vulnerability swaps.

---

## 🌟 Key Features

- **📱 Couple Onboarding Flow**:
  - Personalize the app with your first name, your spouse's name, relationship length, and your primary intimacy desire (*Romantic Touch*, *Playful Laughter*, *Deep Talks*, or *Cozy Unwinding*).
- **🎴 Gesture-Driven Card Carousel**:
  - Swipe horizontally or tap adjacent preview cards to navigate.
  - **3D Card Flip**: Tap anywhere on the card to flip over and reveal the guided conversation prompt.
- **🔊 Built-In Audio Narration**:
  - Tap the audio line button to listen to spoken dare narrations and conversation starters.
- **🔥 Daily Streak & Habit Tracker**:
  - Track consecutive days of intentional connection with your spouse.
- **📖 Sparks Journal**:
  - Saved log of completed moments, timestamps, and notes to look back on your shared journey.
- **✨ Bespoke AI Spark Generator**:
  - Generate custom, on-demand sparks tailored to your spouse's mood and tone anytime.
- **🎨 Minimalist Aesthetic & Line Icons**:
  - Warm sand canvas, clean typography, soft card framing, and pure vector line icons (no emojis).
- **🌐 100% Offline & Static Ready**:
  - Designed with graceful fallbacks to run smoothly on GitHub Pages and mobile browsers.

---

## 🚀 How to Use (Couples' Guide)

### 1. Initial Setup (First Launch)
1. Open the application.
2. Complete the 4-step onboarding:
   - Enter your name and your spouse's name.
   - Select how long you have been together.
   - Choose the primary spark you want to prioritize (Playful, Romantic, Deep, or Cozy).
3. Tap **"Deal Today's 3 Sparks"** to enter the daily deck.

### 2. Daily Routine
1. **Check Today's Cards**: Glance at your 3 daily cards in the `Today's 3` filter tab.
2. **Flip for Prompts**: Tap a card to flip it over and read the conversation starter prompt to ask your spouse.
3. **Audio Playback**: Tap the speaker icon to hear the prompt read aloud.
4. **Complete the Spark**: Tap the circular black checkmark button once you and your partner finish the moment.
5. **Watch the Midnight Countdown**: Keep track of when tomorrow's fresh sparks will be dealt.

### 3. Explore & Customize
- Use the category pills (`Romance`, `Playful`, `Deep`, `Cozy`, `Flirty`, `All`) to browse the full card library.
- Tap the **Sparkle icon** (`✨`) in the bottom dock to generate a bespoke AI card on demand.
- Tap the **Bookmark icon** to view your history of completed memories in the Sparks Journal.
- Tap the **Bell/Profile icon** in the top right to view your streak stats or reset the app to re-run the onboarding flow.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: React 19 with TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS (v4)
- **Animations**: `motion` (Framer Motion)
- **Icons**: Lucide React (`lucide-react` with thin line stroke styling)
- **Audio & Haptics**: Web Audio API PCM streaming + Web Speech synthesis fallback
- **Confetti**: `canvas-confetti`
- **Hosting**: GitHub Pages / Static hosting / Cloud Run

---

## 📦 Deployment to GitHub Pages

This repository is pre-configured with automated GitHub Pages deployment via GitHub Actions:

1. Push your repository to GitHub.
2. In your GitHub repository, navigate to **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. GitHub Actions will automatically build the application and deploy it to `https://<your-username>.github.io/<repo-name>/`.

---

## 🔒 Privacy & Local Storage

All names, relationship preferences, streak counts, and completed journal memories are stored **locally on your device** via secure browser storage (`localStorage`). No private relationship data or names are sent to external tracking servers.
