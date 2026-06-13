# Handoff: Tennis Scheduler

A complete design-and-behavior spec for **Tennis Scheduler**, a responsive (desktop-first) web app for scheduling and finding tennis matches. This README is self-sufficient: a developer who was not part of the original design conversation should be able to build the app from this document alone.

The intended target is **SvelteKit**, and this README is written with that in mind (route map, load functions, stores, component breakdown). None of those choices are mandatory — adapt to whatever conventions the project settles on.

\---

## About the design files

The files in `reference/` are **design references created in HTML/React (JSX via in-browser Babel)**. They are a working prototype showing the intended look, layout, and behavior — **not production code to copy directly**. Your task is to **recreate these designs in a real SvelteKit project**, using idiomatic Svelte components, stores, and routing rather than porting the React code line-for-line.

Open `reference/Tennis Scheduler.html` in a browser to interact with the live prototype while you build. All styling lives in one `<style>` block inside that HTML file — it is the source of truth for tokens, and is framework-agnostic CSS you can lift directly.

### How to read the reference code

* `tennis-data.js` — plain JS. Mock data (locations, players, matches) + date/format helpers, all hung on `window.TS`. **Port this nearly verbatim** into a Svelte module (e.g. `src/lib/data.js`).
* `tennis-ui.jsx` — shared presentational components (buttons, avatars, badges, match card, top nav).
* `tennis-landing.jsx` — sign-in screen + the court SVG, with 3 layout variants.
* `tennis-screens.jsx` — Dashboard, Search, Match detail, My matches.
* `tennis-create.jsx` — the create-a-match form.
* `tennis-app.jsx` — root: routing, app state, the Tweaks panel wiring.
* `tweaks-panel.jsx` — a prototype-only dev panel (see "What to drop" below).

\---

## Fidelity

**High-fidelity.** Colors, typography, spacing, border radii, shadows, and interactions are all final. Recreate the UI pixel-accurately using the exact tokens listed below. The one piece of intentional flexibility is the three landing-page layout variants — pick one as the shipped default (recommendation: **Center court**) and treat the other two as optional.

### What to drop when productionizing

* **The Tweaks panel** (`tweaks-panel.jsx` + the `<TweaksPanel>` block in `tennis-app.jsx`). This is a prototyping affordance for comparing design options live — it is **not** an app feature. Pick final values from it (landing layout, court-line opacity, CTA color) and bake them in.
* **In-browser Babel / CDN React script tags.** SvelteKit compiles ahead of time.
* The `data-screen-label` / `data-comment-anchor` attributes — these are authoring aids, safe to omit.

\---

## Product overview

A signed-in player can:

1. Sign in or create an account (mock auth — any credentials succeed).
2. See a dashboard of their upcoming matches and open matches nearby.
3. Search/filter all open matches by type, location, and date.
4. Open a match to see its player slots (2 for singles, 4 for doubles) and **claim** an open slot or **leave** a slot they hold.
5. Schedule a new match: pick format, date/time, location, NTRP skill range, and either invite named players into slots or leave them open.
6. Review matches they're playing in vs. hosting under "My matches".

\---

## Design tokens

All tokens are defined as CSS custom properties on `:root` in `Tennis Scheduler.html`. Lift them into your global stylesheet (e.g. `src/app.css`).

### Colors

|Token|Hex|Use|
|-|-|-|
|`--blue`|`#4FB3E8`|Primary light blue — court surface, doubles badge, hero/detail banners|
|`--blue-deep`|`#1B6FA8`|Links, date-chip text, accents on pale blue|
|`--blue-pale`|`#E8F4FB`|Segmented-control track, date chip bg, selected location bg, count pills|
|`--ball`|`#DFF24B`|Tennis-ball yellow — **default CTA**, "you're in" badge, open-spot pill, ball accents|
|`--ball-deep`|`#9FB31F`|Ball outline, "you" slot card border|
|`--ink`|`#0C2233`|Primary text, dark buttons, night-mode court|
|`--ink-70`|`rgba(12,34,51,0.7)`|Secondary text|
|`--ink-50`|`rgba(12,34,51,0.5)`|Tertiary text, muted labels|
|`--line`|`rgba(12,34,51,0.12)`|Borders, dividers|
|`--bg`|`#F0F6F9`|App background|
|`--card`|`#FFFFFF`|Card surfaces|
|`--accent`|`var(--ball)`|**Themed CTA color** — driven by the Tweaks "CTA color"; ship as `--ball`|
|`--accent-text`|`var(--ink)`|Text on accent (ink on yellow; switch to `#FFFFFF` if accent becomes blue/ink)|

Error styling (create form): text `#B3261E`, bg `#FDEDEC`, border `#F5C6C2`.

Player avatar palette (assigned round-robin by index in `tennis-data.js`):
`#1B6FA8, #0C2233, #3E8E7E, #5B6ABF, #B07D2B, #7A4E8C, #2E86C1, #4A6B3A`. The signed-in user's avatar uses `--ball` bg with `--ink` text.

### Typography

* **Family:** `Archivo` (Google Fonts, weights 400–900, includes italic) with `"Helvetica Neue", Helvetica, sans-serif` fallback. Load via `@fontsource/archivo` or a `<link>`.
* **Display style** (`.disp`): weight **850, italic, UPPERCASE**, `letter-spacing: -0.015em`, `line-height: 0.96`, `text-wrap: balance`. Used for all headlines, section titles, page titles, the logo.
* **Body:** base `font-size: 15px`, `line-height: 1.45`.
* **Labels / eyebrows:** weight 800, UPPERCASE, `letter-spacing` \~`0.05–0.08em`, sizes 10.5–13px. Used on buttons, field labels, badges, nav links.
* Key sizes: sign-in title 44px · hero title `clamp(36px,4.5vw,56px)` · page title 38px · detail title `clamp(30px,4vw,46px)` · section title 22px · match-card location 17px · body labels 11–13px.

### Spacing, radius, shadow

* Spacing is informal but consistent: card padding 14–24px; page padding `32px 28px 80px`; gaps 10–16px in lists/grids.
* **Radii:** buttons 10px (sm 8px); cards `--radius: 14px`; banners/hero 20px; sign-in card 18px; pills/badges 999px; avatars 50%.
* **Shadows:** primary button `0 3px 0 rgba(12,34,51,0.28)` (a hard "stacked" offset, collapses to `0 1px 0` on `:active` with `translateY(2px)` — gives a tactile press); cards on hover `0 8px 20px rgba(12,34,51,0.1)`; sign-in card `0 24px 60px rgba(12,34,51,0.35)`; toast `0 12px 32px rgba(12,34,51,0.4)`; nav menu `0 10px 28px rgba(12,34,51,0.16)`.
* **Page max-width:** 1060px (narrow form pages 720px), centered.

\---

## The court SVG

A reusable component (`CourtSVG` in `tennis-landing.jsx`) renders a top-down tennis court and is used as the landing background, the dashboard/detail banner texture, and the location "map" thumbnail. Recreate as a Svelte component with these props:

* `surround` (outer color, default `#4FB3E8`), `court` (inner color, default `#5FBCEB`), `line` (line color, default `#fff`), `lineOp` (line opacity 0–1), `ball` (boolean — show the yellow ball, default true), plus `className`/`style` passthrough.
* viewBox `0 0 1560 960`, `preserveAspectRatio="xMidYMid slice"`. Outer rect fills the surround; inner court rect at `x=312 y=264 w=936 h=432`. Lines (service boxes, center line, baselines, sidelines) stroked at width 6. A dashed vertical **net** down the center (`x=780`, from y≈237 to 723) with small posts (circles) at each end. Optional ball at `cx=1000 cy=396 r=15` in `--ball` with two white seam curves.
* Banners use `lineOp ≈ 0.45–0.5` and `ball={false}`; the location thumbnail uses `lineOp ≈ 0.85`.

The default landing uses surround `#4FB3E8` / court `#5FBCEB`; the **Night match** variant uses surround `#0C2233`, court `#102E44`, lines in `--ball` at reduced opacity, no ball.

\---

## Screens / views

### 1\. Landing / sign-in  (shown when no user)

**Purpose:** authenticate (mock) and enter the app.

**Layout (default "Center court"):** full-viewport court SVG background; a single white **sign-in card** centered (width 400px, padding `36px 36px 28px`, radius 18px, big soft shadow).

**Sign-in card contents, top to bottom:**

* Logo: yellow ball glyph + "TENNIS SCHEDULER" (display style, 17px).
* Headline "Game on." (`.disp`, 44px).
* Sub "Schedule matches, find players, claim your court." (`--ink-70`).
* Segmented control: **Sign in / Create account**.
* Fields: Email, Password always; **Name** and **NTRP level** `<select>` (2.0–5.5) appear only in Create-account mode. NTRP field shows hint "Not sure? 3.0 is a solid recreational player."
* Primary full-width button: "Step on court" (sign in) / "Join the league" (create).
* Fine print: "Demo — any credentials work."

**Auth behavior:** no real validation. On submit, derive a display name (use the Name field, else title-case the email's local part, else "Ace Player"), default NTRP 3.5, and sign in. Persist the user (see State).

**Variants (pick one to ship; the rest are optional):**

* **Center court** — centered card over court (recommended default).
* **Sideline split** — two columns: left is a court panel with a bottom-anchored marketing headline ("Find your next match.") and a yellow underline accent; right is the bg-colored panel holding the sign-in card. Collapses to stacked under 900px.
* **Night match** — dark court (`#0C2233`), dark sign-in card variant (`.sign-card.dark`) with yellow title and yellow-tinted ring shadow.

### 2\. Dashboard / Home

**Purpose:** at-a-glance landing after sign-in.

**Layout:** sticky top nav, then centered page column. Sections top to bottom:

* **Hero banner** (`.card-blue`, radius 20px): faint court texture; "Game on, {FirstName}." headline; a sub line that names the user's next match ("Your next match is today at 6:30 PM — Riverside Park Courts.") with the date/time emphasized in italic yellow, or a fallback when empty; two buttons — primary "Schedule a match", white "Find a match".
* **Your matches** (only if the user is in any): section title + "See all" link → My matches; up to 3 **MatchCards**.
* **Open matches near you**: section title + "Browse all" link → Search; up to 4 MatchCards the user is **not** in that still have open slots.

### 3\. Find a match (Search)

**Purpose:** browse/filter all upcoming open matches.

**Layout:** page title "Find a match"; a **filter bar** card; a result-count eyebrow; a list of MatchCards (or empty state).

**Filter bar controls (flex, wraps):**

* Segmented: All / Singles / Doubles.
* Location `<select>`: "All locations" + each mock location.
* Date `<select>`: Any day / Today / Next 3 days / This week.
* Checkbox "Open slots only" (default **on**).

**Filtering logic:** upcoming matches (date ≥ today, sorted by date+time) filtered by type, location, date horizon (`{any:9999, today:0, three:3, week:7}` days from today), and — if checked — having at least one open slot. Empty state: "No matches found" with a "Schedule a match" CTA.

### 4\. Match detail

**Purpose:** see everything about one match and claim/leave a slot.

**Layout:** back link; **detail banner** (`.card-blue`) with type + NTRP badges (and a yellow "You're in" badge if applicable), title "{Date} · {Time}", sub "{Location} · Hosted by {host|you}". Then a two-column grid (`1.6fr / 1fr`, stacks under 860px):

* **Left — Players:** section title with a `{filled}/{total}` count pill; a **slot grid** (2 columns) of **SlotCards**; below it, a "From the host" notes card if notes exist.
* **Right — Location:** a card with a court-SVG thumbnail "map" header and the location's name, kind, area, court count, and surface.

**SlotCard:**

* *Filled:* side label ("Team A/B" for doubles, "Host side / Challenger" for singles), avatar (52px), name (+" (you)"), "NTRP x.x" (+" · Host" for the host). If it's the current user and they're not the host, show a ghost "Leave match" button.
* *Open:* dashed card, "+" avatar, "Open slot" muted; an ink "Claim slot" button that swaps to an inline **Confirm / Cancel** pair before committing.

**Rules:** a user may hold at most one slot per match — claiming is blocked if they're already in. The host's slot can't be left (they'd have to delete the match — out of scope).

### 5\. Schedule a match (Create)

**Purpose:** create and post a new match. Narrow page (720px). Five numbered step cards, each a `.card` with a circled step number:

1. **Format** — big segmented Singles (2 players) / Doubles (4). Live avatar preview row: the host (you) + remaining slots showing invited players or empty, with a "{n} open slots after invites" label.
2. **When** — Date `<input type="date">` (min today) + Start time `<select>` (07:00–21:00 in 30-min steps, displayed as 12-hour).
3. **Where** — a 2-col grid of selectable **location cards** (name, kind · area, "{courts} courts · {surface}"); selected card gets ink border + pale-blue fill.
4. **Level** — NTRP min + max `<select>`s (2.0–5.5).
5. **Players** — one `<select>` per non-host slot: "Leave open — anyone can claim" or a named player (already-chosen players are disabled in other slots). Plus an optional notes `<textarea>`.

**Validation (inline error card above the actions):** location required; date today-or-later; NTRP min ≤ max. On success, build the match (host slot = the current user, remaining slots = invited ids or null), add it to state, navigate to its detail page (back-target = My matches), and toast "Match posted — your slots are live."

### 6\. My matches

**Purpose:** the user's matches, split by role. Segmented tabs **Playing (n) / Hosting (n)**; each tab is a list of MatchCards (upcoming only) or an empty state with a relevant CTA. "Playing" = user is in a slot but not host; "Hosting" = user is the host.

\---

## Shared components

* **MatchCard** — the core list row. Grid: left **date chip** (pale-blue, DOW / big italic day / MON), middle body (type + NTRP badges, optional "You're in", location name 17px bold, meta line "{relative date} · {time} · {area}"), right side (overlapping avatar stack of all slots, then a pill: "{n} spots open" in yellow, or "Full" in muted blue). Whole card is a button; hover lifts 2px with a blue border + soft shadow. Collapses to 2-col under 760px (side info wraps full-width as a row).
* **TopNav** (signed-in only, sticky, 64px, white, bottom border): logo (→ home) · links Home / Find a match / My matches (active = ink text on pale-blue) · right side "+ New match" primary button + avatar; avatar opens a small menu showing name + NTRP and a "Sign out" item.
* **Avatar** — circle with initials; sizes vary (30 in stacks, 36 nav, 40 preview, 52 slot cards); open variant is a dashed "+"; "you" variant uses ball-yellow.
* **Badges** — `TypeBadge` (Singles = ink, Doubles = blue), `NtrpBadge` ("NTRP 3.5–4.5", outlined pill), "You're in" (yellow), open-spots pill.
* **Seg** — segmented control (active = ink fill, white text); `big` variant is full-width.
* **Btn** — kinds: `primary` (accent, stacked shadow, press animation), `ink` (dark), `white`, `ghost` (outline); `sm` size. All UPPERCASE, weight 800, letter-spacing 0.05em.
* **Toast** — bottom-center ink pill with a ball glyph; auto-dismiss \~2.6s; slide-up entrance.
* **EmptyState** — dashed bordered block: ball glyph, italic uppercase title, body, CTA.

\---

## Interactions \& behavior

* **Navigation** is in-app view switching (no full page loads in the prototype). In SvelteKit, map these to real routes (below). Every navigation scrolls to top.
* **Claim slot:** Claim → inline Confirm/Cancel → fills the user into that slot index; toast "You're in! See you on court."
* **Leave slot:** ghost button on the user's own non-host slot → empties it; toast "You left the match."
* **Create:** validates, prepends/append to match list, routes to the new match's detail; toast.
* **Primary button press:** `translateY(2px)` + shadow collapse on `:active` (\~80ms) — keep this; it's core to the tactile feel.
* **Card hover:** `translateY(-2px)`, blue border, shadow (100ms ease).
* **Toast entrance:** 0.25s ease slide-up + fade.
* **Responsive:** desktop-first. Breakpoints at 900 (split landing stacks), 860 (detail grid stacks), 760 (nav condenses, match card → 2-col), 640 (create form rows + location grid go single-col).

\---

## State management

Prototype state, and the suggested SvelteKit equivalent:

|Concern|Prototype|SvelteKit suggestion|
|-|-|-|
|Signed-in user `{name, ntrp}`|React state seeded from `localStorage\['ts\_user\_v1']`|a `user` writable store persisted to `localStorage`; gate routes on it|
|Matches list|React state seeded from `TS.seedMatches()`|a `matches` writable store (or server `load` + form actions once a backend exists)|
|Current route|React state object `{name, matchId?, from?}`|real file-based routes + `$page` params|
|Toast message|React state + timeout|a `toast` store + a single `<Toast>` in the layout|
|Tweaks|`useTweaks` store|**omit** — bake chosen values|

**Match shape** (keep this contract):

```
{
  id, type: 'singles'|'doubles', locationId, date: 'YYYY-MM-DD', time: 'HH:MM',
  ntrp: \[min, max], hostId, slots: \[playerId | 'me' | null, ...], notes
}
```

`'me'` is the sentinel for the signed-in user; `slots\[0]` is always the host. `getPlayer('me')` resolves to the live user object (ball-yellow avatar, `you: true`); other ids resolve via `TS.playerById`. Singles = 2 slots, doubles = 4.

### Suggested SvelteKit route map

```
src/routes/
  +layout.svelte            // nav (when authed) + toast host
  (auth)/signin/+page.svelte // landing — redirect here when no user
  +page.svelte              // dashboard (home)
  search/+page.svelte       // find a match
  create/+page.svelte       // schedule a match
  matches/\[id]/+page.svelte // match detail (claim/leave)
  mine/+page.svelte         // my matches
src/lib/
  data.js                   // port of tennis-data.js
  stores.js                 // user, matches, toast
  components/...             // MatchCard, SlotCard, TopNav, CourtSvg, Badge, Seg, Btn, Avatar, Toast, EmptyState
  styles/app.css            // tokens + base
```

\---

## Mock data (port from `tennis-data.js`)

* **8 locations** — mix of public parks and clubs, each `{id, name, kind, area, courts, surface}`. e.g. "Riverside Park Courts" (Public park, Riverside, 6, Hard), "Eastline Racquet Club" (Club, East End, 12, Clay), "The Meadowbrook Club" (Club, Meadowbrook, 10, Grass), etc.
* **12 players** — `{id, name, ntrp, color}` with NTRP 2.5–5.0.
* **8 seed matches** — span today through +6 days, mixing singles/doubles, some with the user (`'me'`) already slotted, varied open-slot counts, each with a host note.
* **Helpers:** `isoIn(days)`, `fmtDate` (relative "Today"/"Tomorrow"/"Wed, Jun 18"), `fmtTime` (12-hour), `dateParts` (for the date chip), `playerById`, `locById`, `NTRP\_LEVELS` (2.0–5.5). Port these as plain functions.

All data is in-memory; there is no backend. Created/joined matches reset on reload in the prototype — wiring real persistence is a follow-up task.

\---

## Assets

* **No external image assets.** Every visual is CSS or inline SVG (the court, the ball glyph, avatars from initials).
* **Font:** Archivo (Google Fonts).
* **Icons:** none beyond the inline ball SVG. If you add an icon set, match the bold athletic tone.

\---

## Screenshots

Reference captures of each screen live in `screenshots/` (desktop width \~910px):

|File|Screen|
|-|-|
|`01-landing-signin.png`|Landing / sign-in (Center court variant)|
|`02-dashboard.png`|Dashboard / Home|
|`03-search.png`|Find a match (filters + results)|
|`04-match-detail.png`|Match detail (player slots + location)|
|`05-create.png`|Schedule a match (form steps)|
|`06-my-matches.png`|My matches (Playing / Hosting tabs)|

These are static references — the live prototype in `reference/Tennis Scheduler.html` is the authoritative source for spacing and interaction.

\---

## Files in this bundle (`reference/`)

|File|What it is|
|-|-|
|`Tennis Scheduler.html`|Entry point + the complete stylesheet (token source of truth). Open this to view the live prototype.|
|`tennis-data.js`|Mock data + date/format helpers (`window.TS`). Port nearly verbatim.|
|`tennis-ui.jsx`|Shared components: Btn, Avatar, badges, Seg, Field, MatchCard, TopNav, EmptyState.|
|`tennis-landing.jsx`|Sign-in screen, `CourtSVG`, three landing variants.|
|`tennis-screens.jsx`|Dashboard, Search, MatchDetail, SlotCard, MyMatches.|
|`tennis-create.jsx`|The create-a-match form + validation.|
|`tennis-app.jsx`|Root: routing, state, claim/leave/create logic, toast, Tweaks wiring.|
|`tweaks-panel.jsx`|Prototype-only dev panel — **do not ship.** Use it to confirm final values.|

\---

## Suggested build order

0\. Tech stack should be based on sveltekit initialization questions (see dependencies required). Use Better Auth, and resend for email verification (create a screen for email verification later in the build). Add resend to .env and I will set its key, etc.

1. Scaffold SvelteKit, add `app.css` with the tokens above, load Archivo.
2. Port `tennis-data.js` → `src/lib/data.js`; create `user`/`matches`/`toast` stores.
3. Build atoms: Btn, Avatar, Badge, Seg, CourtSvg, Toast.
4. Sign-in route + auth gate.
5. MatchCard → Dashboard → Search.
6. Match detail + SlotCard (claim/leave).
7. Create form + validation.
8. My matches.
9. Polish: hover/press states, responsive breakpoints, toast timing.

