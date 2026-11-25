# 🌱 BLOOM — Grow at your own pace

**Every time you take care of yourself, something grows.**

BLOOM is a mental-wellbeing web app where small acts of self-care — journaling, breathing, a walk, calling a friend, resting — plant something in a miniature 3D garden. Over time the garden becomes a personal, visual record of how you’ve looked after yourself.

It is deliberately **not** a farming game: no coins, no streaks, no watering, no leaderboards. Plants never wilt and nothing is ever taken away.

- 100% static — runs entirely in the browser, perfect for GitHub Pages
- No backend, no accounts, no API keys, no tracking
- All data is stored privately in the browser’s `localStorage`

---

## Features

| Area | What it does |
|---|---|
| **My Garden** | An interactive isometric 3D island (Three.js / React Three Fiber) with a stream, bridge, rocks and wildflowers. Drag to look around, zoom, tap any plant to see what grew it, when, and its growth stage. Journal trees link back to their entry. |
| **Activity → growth** | 19 activities across Reflection, Mindfulness, Movement, Connection, Recovery and Creativity. Each grows its own plant (see table below), with a planting celebration and a grow-in animation in the garden. |
| **Growth stages** | Sprout → Young → Mature. Returning to the same kind of activity helps your oldest still-growing plant of that kind mature. Growth is never tied to streaks and never reverses. |
| **Expanding garden** | Tile-based placement prevents overlap. When the island fills up it grows (6×6 → 8×8 → … → 20×20), automatically or via “Expand”. |
| **Focus** | Real interactions, not checkboxes: paced breathing (3 rhythms), guided meditation timer, 5-4-3-2-1 grounding, guided stretching sequence, gratitude, intentions, a doodle canvas, and gentle logging for walks, reading, connection and more. |
| **Journal** | Create, write, date, edit, search and delete entries, with optional prompts and auto-saved drafts. Each new entry plants a tree. Deleting an entry keeps its tree. |
| **Emotional check-in** | 10 feelings, intensity, optional note, a kind non-clinical reply and a suggested activity. |
| **Insights** | Stats, plain-language observations, a 7/30-day activity chart, category mix, feelings over the month, and a reflection calendar. No scores. |
| **Profile** | Name & avatar, garden overview, full activity history, motion preference, gentle daily reminder, privacy info, backup download/restore, and reset with confirmation. |
| **Accessibility** | Respects `prefers-reduced-motion` (plus an in-app override), keyboard-reachable controls, ARIA labels, live regions for timers. |

### Activity → plant mapping

| Activity | Grows |
|---|---|
| Journal entry | A tree (round leafy, cherry blossom, pine or tall slender) |
| Meditation | A flowering plant (bellflower) |
| Guided breathing | A small flower (daisy) |
| Gratitude | A flowering bush |
| Walking | A patch of greenery |
| Stretching / light exercise | A leafy plant |
| Friend / family / reaching out | Two interconnected trees |
| Reading | A small sapling |
| Intentional break / rest | A small lily pond |
| Creative activity | A one-of-a-kind flower (tinted by the colour you doodle with most) |
| Emotional check-in | A fern |
| Personal intentions | A tulip |
| Mindful pause | A mossy stone |
| Time outdoors | Wildflowers |

All 3D models are original, procedurally built low-poly forms (no external assets or image URLs).

---

## Run it locally

Requires **Node.js 20+** (22 recommended).

```bash
npm install
npm run dev       # start the dev server → open the printed URL
npm run build     # type-check and build to /dist
npm run preview   # serve the production build locally
```

Tip: after onboarding, **Profile → Add sample activity (demo)** fills the garden and insights so you can see everything in action. **Reset all BLOOM data** clears it again.

---

## Publish on GitHub Pages

The project ships with a ready-made workflow at `.github/workflows/deploy.yml`.

1. **Create a repository** on GitHub (for example `bloom`) and push this project to its `main` branch:
   ```bash
   git init
   git add .
   git commit -m "BLOOM"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
2. In the repository go to **Settings → Pages** and under **Build and deployment → Source** choose **GitHub Actions**.
3. The workflow runs automatically on every push to `main` (you can also start it from the **Actions** tab → *Deploy BLOOM to GitHub Pages* → *Run workflow*).
4. When it finishes, your app is live at
   `https://<your-username>.github.io/<your-repo>/`

### About the base path

- The workflow sets `BASE_PATH=/<your-repo-name>/` automatically, so **you don’t need to edit anything** for a normal project site.
- If you deploy to a **user site** (`<username>.github.io` repo) or a **custom domain**, change `BASE_PATH` in `deploy.yml` to `/`.
- To hardcode a path instead, edit the fallback in `vite.config.ts`:
  ```ts
  const base = process.env.BASE_PATH || '/bloom/';
  ```
- Without `BASE_PATH` the build uses a relative base (`./`), which also works from any sub-folder.

### Why refreshing never 404s

BLOOM uses `HashRouter`, so routes look like `…/bloom/#/journal`. GitHub Pages only ever serves `index.html`; the part after `#` is handled in the browser, so deep links and refreshes always work. A `.nojekyll` file is included so GitHub serves every asset untouched.

---

## Your data

- Everything lives in `localStorage` under the key `bloom.app.state` (versioned schema with safe parsing, defaults and a migration hook in `src/state/store.ts`).
- **Local storage is not a cloud backup.** It doesn’t sync between devices or browsers, and clearing site data erases it. Use **Profile → Download backup** and **Restore from backup** to move or keep your garden.
- Reminders use the browser Notification API and can only appear while BLOOM is open in a tab (a static site can’t send push notifications when closed).

BLOOM is a self-care companion, not a medical or diagnostic tool.

---

## Project structure

```
src/
  components/
    Activity/       PlantingCelebration, interaction flows (breathing, timer, grounding, steps, log, gratitude, intentions, doodle)
    CheckIn/        Emotional check-in
    Garden/         GardenScene (R3F canvas), Island, GardenPlant, PlantModels (3D library), PlantPreview, PlantInfoPanel
    Navigation/     Bottom nav (mobile) + sidebar (desktop)
    ui/             Shared UI primitives, error boundary
  data/             activities.ts, plants.ts, content.ts (prompts, emotions, copy)
  hooks/            reduced motion, countdown/chime, reminders
  pages/            Home, Focus, ActivityPage, Journal, JournalEntryPage, Insights, Profile, Onboarding
  state/            store.ts (persistence + all actions), ui.ts (celebration overlay)
  styles/           Tailwind v4 theme & components
  utils/            dates, garden tile placement
```

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS v4 · Three.js · React Three Fiber + drei · Framer Motion · Lucide · Recharts. Fonts (Manrope + Fraunces) are bundled locally via Fontsource — no external requests.

### Customising

- **Activities & rewards:** `src/data/activities.ts`
- **Plant names / descriptions:** `src/data/plants.ts`
- **3D models:** `src/components/Garden/PlantModels.tsx` (each plant is a small component built from shared low-poly parts)
- **Colours & fonts:** `@theme` block in `src/styles/index.css` and `C` in `src/components/Garden/materials.ts`
- **Growth pacing:** `NURTURES_FOR_STAGE` in `src/data/plants.ts`

## License

MIT
