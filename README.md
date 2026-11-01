# ⚡ NEON RUSH — High-Velocity Cyber Arcade Game

A complete, polished, browser-based indie arcade game built with **Next.js 14**, **React**, **TypeScript**, **Tailwind CSS**, and **HTML5 Canvas**.

Designed with a futuristic synthwave/cyberpunk aesthetic, crisp 60 FPS physics, jump buffering, coyote time, procedural obstacles, combo multipliers, near-miss mechanics, unlockable geometric skins, achievements, daily challenges, and a Web Audio API synth engine.

---

## 🎮 Features

### 🕹️ Core Gameplay
- **Fluid Movement & Physics**: Sub-frame input handling, jump buffering (130ms), and coyote time (80ms) for responsive jumping.
- **Mid-Air Double Jump**: Trigger a secondary thruster burst in mid-air to clear wide gaps or correct trajectories.
- **Dynamic Obstacle Course**:
  - Ground Spikes (single & double prisms)
  - Floating oscillating diamond hazards
  - Laser Gate Portals with safe corridors
- **Speed Progression**: Velocity surges every 15 seconds with audiovisual warp warnings (`WARP 1` through `WARP 5+`).
- **Fair Collision**: Sub-pixel precision hitboxes with forgiving inward margins.

### 🔥 Addictive Scoring & Progression
- **Combo Multiplier**: String together dodges and coin pickups to build up to a **5x MAX OVERDRIVE** multiplier with energetic visual effects.
- **Near-Miss Bonus**: Skimming past hazards within 22px triggers a `+50 NEAR MISS!` bonus, screen shake, and whoosh sound.
- **Neon Energy Cores**: Collect floating golden orbs to bank Neon Coins and boost scores.
- **Instant Restart**: Press `[Space]` or tap anywhere for instant replay.

### 🎨 Visual & Audio Polish
- **Retro 3D Perspective Grid**: Animated synthwave floor with horizon glow and starfield parallax.
- **Dynamic Particle Systems**: Floor friction sparks, jump bursts, coin explosions, and death shatter fragments.
- **Screen Shake Trauma**: Decaying trauma algorithm (`trauma^2`) for impactful collisions.
- **Web Audio API Synthesizer**: 100% royalty-free, zero-latency procedural sound effects and an 80s synthwave bassline & arpeggio music engine that runs entirely in code.

### 🏆 Reward System & Customization
- **Skin Locker**: Unlock 6 glowing geometric character cores:
  - *Cyber Cyan* (Default)
  - *Synth Pink*
  - *Matrix Lime*
  - *Solar Overdrive*
  - *Void Violet*
  - *Phantom Ghost*
- **Achievements**: 11 unlockable badges with coin rewards and progress tracking.
- **Daily Mission**: Procedural daily challenges with bonus coin payouts.
- **Persistent Data**: High score, coins, skins, achievements, settings, and daily streaks saved in `LocalStorage`.

### 📱 Mobile & Desktop Optimized
- Touch anywhere controls with ergonomic tap zones.
- Viewport lock to prevent accidental zooming or pull-to-refresh.
- High-DPI canvas rendering (`window.devicePixelRatio`).
- Tab visibility auto-pause.

---

## 🚀 Quick Start

### 1. Installation

```bash
# Clone or navigate to the directory
cd neon-rush

# Install dependencies
npm install
```

### 2. Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to play.

### 3. Production Build

```bash
npm run build
npm run start
```

---

## ☁️ Deployment to Vercel

The application is structured for instant zero-configuration deployment on **Vercel**:

### Option 1: GitHub & Vercel Dashboard
1. Push this project to a GitHub / GitLab / Bitbucket repository:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of Neon Rush arcade game"
   git branch -M main
   git remote add origin https://github.com/<your-username>/neon-rush.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your `neon-rush` repository.
4. Leave build settings as default (Framework: **Next.js**).
5. Click **"Deploy"**. Your live game URL will be ready in under 60 seconds!

### Option 2: Vercel CLI
```bash
npm install -g vercel
vercel
```

---

## 🌐 Multi-Platform Publishing Guide

A ready-to-upload standalone HTML5 bundle has been compiled to:
`neon-rush-html5.zip` (253 KB)

You can regenerate this package anytime by running:
```bash
npm run export-zip
```

### 1. Itch.io
1. Go to [itch.io/game/new](https://itch.io/game/new).
2. Set **Kind of project** to: **HTML**.
3. Under **Uploads**, click **Upload files** and select `neon-rush-html5.zip`.
4. Check the box: **"This file will be played in the browser"**.
5. Set Viewport dimensions: **960 x 540** (or tick "Automatically detect size").
6. Check **Mobile friendly** and **Fullscreen button**.
7. Set pricing (free with optional tips/donations) and click **Save & View Page**.

### 2. Newgrounds
1. Go to [newgrounds.com/projects/games/new](https://www.newgrounds.com/projects/games/new).
2. Under **File Upload**, choose **HTML5 Web Game (.zip)**.
3. Select `neon-rush-html5.zip`.
4. Set dimensions to **960 x 540**.
5. Add tags: `arcade`, `synthwave`, `runner`, `cyberpunk`, `neon`.

### 3. Game Jolt
1. Go to [gamejolt.com/dashboard/games/add](https://gamejolt.com/dashboard/games/add).
2. Choose **Browser / HTML5**.
3. Upload `neon-rush-html5.zip`.
4. Set display dimensions: **960 x 540**.

### 4. CrazyGames & Poki Developer Portals
- **CrazyGames**: Submit the live Vercel URL or the `neon-rush-html5.zip` at [developer.crazygames.com](https://developer.crazygames.com).
- **Poki**: Submit the game demo at [developers.poki.com](https://developers.poki.com).

---

## ⌨️ Controls Reference

| Action | Desktop | Mobile |
| :--- | :--- | :--- |
| **Jump / Double Jump** | `Spacebar`, `Arrow Up`, `W`, or Left Click | Tap anywhere on screen |
| **Pause / Resume** | `Escape` or `P` | Pause button in HUD |
| **Instant Restart** | `Spacebar` | Tap "PLAY AGAIN" |
| **Menu Shortcuts** | `Spacebar` to launch game | Tap "PLAY NOW" |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Game Engine**: HTML5 2D Canvas Context API
- **Icons**: Lucide React
- **Audio**: Web Audio API (Procedural Synthesis)
- **FX**: Canvas Confetti
- **Storage**: LocalStorage API
