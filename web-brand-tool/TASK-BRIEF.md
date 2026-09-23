# Task Brief — "Nodefield": a web-based brand-visual generator

> Build a browser tool where a user drops in images and gets a live, exportable
> **gravitational data-network** visual in the secondeight / Gray Matter style:
> a glowing core, a dense burst of spectrum filaments, the user's images riding the
> branches as "data points," and position-driven telemetry numbers. Real-time,
> parametric, exportable to PNG / video / embed.

This brief is self-contained and build-ready. It ports a working Blender prototype
(`../slideshow/network.blend`, built via geometry nodes) to the web. Treat the prototype
renders and the studio references as the visual source of truth.

**Source-of-truth assets (in this repo):**
- Aesthetic references: `../slideshow/reference/se-*.jpeg` (Gray Matter / Radial / FORM).
- Working-look prototype frames: `../slideshow/exports/preview_fibers.png`,
  `preview_wide.png`, `preview_datapoints.png`, `preview_network_spectrum.png`.
- The math + architecture are described below (already validated in Blender).

---

## 1. Product vision

A self-serve brand-asset generator. Non-designers upload a set of images (logos, product
shots, renders); the tool arranges them as the luminous endpoints of a procedural neural/data
network and lets them restyle, animate, and export it as a hero visual, loop, or social asset.
The differentiator is the *specific* secondeight aesthetic + the feeling that the brand's
assets are "live data."

**Primary user flow:** Upload images → auto-generates the network → tweak via a controls
panel (style/density/color/motion) → preview live → export PNG / MP4 / shareable link / embed.

---

## 2. The look (non-negotiable aesthetic rules — from the references)

- **Pure black field** (`#06070A`), heavy negative space, ONE hero system centered.
- **Emission + bloom is the lighting model.** Everything glows; brightness blooms into black.
- **Color is a pickable MODE:**
  - *Spectrum* (default): grade across magenta `#FD867B` → blue `#003CFF` → violet `#7A1FB0`.
  - *Nature + machine accent*: muted sage/rose/bone + orange `#E8702A` + violet nodes `#7B3FE4`.
  - *Single hue*: e.g. crimson `#E1101A`.
- **Three layers** (each independently toggleable — this is the core architecture):
  1. **Core** — a glowing nucleus at origin (icosphere / glass-like).
  2. **Points/fibers** — a dense burst of thin spectrum filaments from core → outer points,
     with glowing endpoint dots. Density (~300–800 fibers) is what sells the look.
  3. **Data numbers** — white **monospace** telemetry labels, **derived from each node's 3D
     position**, updating in real time (this was the hardest/most important part in the
     reference). Plus an optional green focus-readout number.
- **Images = the hero data points.** The user's uploads sit as billboarded cards terminating
  the *main* branches (distinct from the thin decorative fibers). They must be **legible**.
- **Texture:** subtle film grain (2–4%); optional halftone/dither mode.
- **Motion:** "biological calm with live data underneath" — the form moves slowly and weighted
  (no bounce); the telemetry numbers flicker/update fast.

---

## 3. Recommended stack (override if you have a reason)

| Concern | Choice | Why |
|---|---|---|
| Framework | **React + TypeScript + Vite** | Fast, typed, ecosystem. |
| 3D | **Three.js via react-three-fiber + drei** | Declarative scene, instancing, controls. |
| Post FX | **`postprocessing` (pmndrs)** — `EffectComposer` + `SelectiveBloom`/`BloomEffect`, `NoiseEffect`, `VignetteEffect` | UnrealBloom is the web equivalent of Blender's Fog Glow. |
| Text/numbers | **`troika-three-text`** (SDF text in-scene) OR DOM overlay via `Html`/projection | Position-driven labels; troika scales better, DOM is crisper. |
| State | **Zustand** | Simple global store for all params. |
| UI / controls | **Tailwind + Radix** (or Leva for a fast dev control panel) | Leva to prototype, custom panel for product. |
| Animation | **own `useFrame` loop** + a little **GSAP** for camera tweens | Deterministic, scrub-friendly. |
| Video export | **`MediaRecorder`** (canvas stream → WebM) for MVP; **`@ffmpeg/ffmpeg` (wasm)** to transcode → MP4 | Browser-native first; wasm for MP4 delivery. |
| Image export | `renderer.domElement.toBlob` at 2× DPR | Crisp PNG. |

---

## 4. Architecture & the validated math

### 4.1 Node placement — Fibonacci sphere (port verbatim from the Blender build)
For `i` in `0..N-1`, golden angle `GA = π·(3 − √5)`:
```
y      = 1 − 2·i/(N−1)
r      = sqrt(1 − y²)
θ      = GA · i
pos    = new Vector3(cos(θ)·r, y, sin(θ)·r).multiplyScalar(RADIUS)
```
Add small index-seeded jitter for an organic (non-lattice) feel.

### 4.2 Fibers (Layer 2) — dense burst
- One line/tube per outer point, from `core(0,0,0)` → `pos`.
- Render as **instanced** thin tubes (TubeGeometry is heavy at 300+; prefer instanced
  cylinders aligned core→point, or `LineSegments2`/`meshline` for fat lines with bloom).
- **Spectrum color** via per-instance attribute `t = i/(N−1)` → sampled from a gradient LUT.
- **Endpoint dots:** instanced emissive spheres at `pos`.
- **Traveling pulse:** in the tube shader, `pulse = smoothstep band of fract(uvAlongLength − time·speed + i·phase)` added to emissive — gives the "signal travels outward" read.
- **Optional curl** (the ribbon/drape frames): subdivide each fiber to ~8 points and offset
  midpoints by `noise(pos·freq + seed) · curl · sin(π·t)` (bell keeps endpoints anchored).

### 4.3 Image cards (Layer 2b — the hero data points)
- A subset of branches (one per uploaded image) ends in a **billboarded textured plane**.
- Plane aspect = image aspect (don't distort). Material: emissive-ish (so it reads on black)
  but faithful — `MeshBasicMaterial(map)` with a slight bloom, or emissive map at strength ~1.
- Billboard: face camera each frame (`quaternion.copy(camera.quaternion)` or sprite).
- **Distinct texture per card:** simplest = one mesh per image (≤~100 fine). For scale, use a
  **texture atlas** + per-instance UV offset, or a `DataArrayTexture` (WebGL2) indexed per instance.

### 4.4 Telemetry numbers (Layer 3 — signature)
- For a sampled set of nodes/fiber-ends, render a **monospace number derived from position**,
  e.g. `value = (pos.length()·K).toFixed(3)` or a hash of `(x,y,z)` → updates as nodes move.
- Implement via **troika-three-text** instances (billboarded) or **projected DOM labels**
  (project `pos` to screen, absolutely-position a `<span>`). Cap count (~60–120) + frustum cull.
- Fast flicker: re-roll the low digits every few frames for the "live data" feel.
- One **green focus number** near the focused card (see focus-cycle).

### 4.5 Post FX
- **Bloom** (SelectiveBloom on emissive layer), threshold ~0.8, intensity tuned to taste.
- **Film grain** (NoiseEffect, ~0.03), **Vignette**. Optional **halftone** shader pass.
- Color: keep linear→sRGB; consider an AgX/ACES tonemap (`ACESFilmicToneMapping`) — the
  Blender look used AgX, so a filmic tonemap gets closest.

### 4.6 Motion
- **Assembly:** fibers "draw out" (animate tube length / dash) + cards spring in (scale 0.9→1).
- **Living orbit:** rotate the whole field slowly + per-node `sin/cos` phase offset by index
  (nothing moves in unison). Slow, weighted, no bounce.
- **Focus-cycle:** `activeIndex = floor(t/period) % imageCount`; lerp that card toward the
  core + scale up (eased), recede the rest; camera optionally dives toward it. Cycles all images.
- Optional **force-directed** layout (spring to core + inverse-square repulsion between nodes)
  if you want true physics instead of fixed Fibonacci — nice-to-have, not MVP.

### 4.7 Export
- **PNG:** render at 2× DPR → `toBlob`.
- **Video:** `MediaRecorder` on `canvas.captureStream(30)` → WebM (MVP); `ffmpeg.wasm` → MP4
  (delivery). Offer 1080p; fixed-duration loop (e.g. 8–15s) or the full focus-cycle.
- **Shareable config:** serialize all params to URL hash / JSON; **embed** as an `<iframe>`
  or a copy-paste snippet that re-instantiates the scene from a config.

---

## 5. Controls panel (parametric — the product surface)

Group into: **Content** (upload/reorder/remove images), **Structure** (node count auto from
images, fiber count, radius, curl, jitter, spread mode: sphere/disc/spiral), **Style** (color
mode, accent color, core form/size, tube thickness, dot size, material: emissive/glass/halftone),
**FX** (bloom intensity/threshold, grain, vignette), **Data** (numbers on/off, density, decimals,
flicker), **Motion** (assembly on/off, orbit speed, focus-cycle on/off + duration, camera dive),
**Export** (PNG / video / copy embed / save preset).

Ship **3 presets** matching the reference modes: *Gray Matter (spectrum)*, *Radial (nature+orange,
restrained bloom, heavy halftone)*, *FORM (crimson, card-cloud emphasis)*.

---

## 6. Key technical risks & mitigations

| Risk | Mitigation |
|---|---|
| Per-card distinct textures at scale | Atlas / DataArrayTexture; or cap to ≤100 mesh cards (fine for a brand tool). |
| Many fibers perf | Instanced meshes / fat-line batching; LOD on count; cap dots. |
| Position-driven labels perf | Cap count, frustum-cull, throttle digit updates; SDF text not DOM if >150. |
| Bloom cost on mobile | Lower-res bloom buffer; quality toggle; disable on low-end. |
| Video export framerate/jank | Fixed timestep capture (CCapture-style) rather than realtime MediaRecorder for smooth MP4. |
| Large uploads | Downscale to ≤2048px on import; WebGL texture limits. |

---

## 7. Phased build (each phase = a shippable checkpoint, verify against the reference frames)

- **P0 — Scaffold:** Vite + React + TS + r3f + drei + Zustand + Tailwind. Black canvas, OrbitControls, render loop.
- **P1 — Core + node field:** Fibonacci placement, core mesh, instanced points. *AC: nodes match preview_wide layout.*
- **P2 — Fibers:** instanced tubes core→nodes, spectrum LUT, endpoint dots, pulse shader. *AC: matches preview_fibers density/feel.*
- **P3 — Image cards:** upload → textures → billboarded aspect-correct planes on main branches. *AC: images legible as data points (preview_datapoints).*
- **P4 — Telemetry numbers:** position-driven mono labels + green focus number. *AC: matches se-graymatter number overlay.*
- **P5 — Post FX:** bloom + grain + vignette + tonemap. *AC: matches reference glow.*
- **P6 — Motion + camera:** assembly, orbit, focus-cycle, camera dive. *AC: calm form + fast data feel.*
- **P7 — Controls + presets:** full panel + 3 presets + config save/load (URL/JSON).
- **P8 — Export:** PNG, video (WebM→MP4), embed snippet.
- **P9 — Polish:** perf passes, mobile/responsive, quality tiers, empty/error states.

MVP = **P0–P3 + P5 + basic export** (a static-but-styled, image-driven hero you can download).
Everything else is fast-follow.

---

## 8. Acceptance (overall)
A user with zero 3D skills uploads ~20 images and, within a minute, has an on-brand
Gray-Matter-style network they can restyle and export as a 1080p PNG and a short MP4 loop —
visually in the same family as `slideshow/reference/se-*.jpeg` and the prototype previews.

---

## 9. Decisions to confirm (assumptions made; change if needed)
1. **Stack** = React + r3f + Three. (Alt: vanilla Three for a lighter embed; Svelte.)
2. **Audience** = non-designer self-serve (drives the controls UX). (Alt: pro tool with deeper params.)
3. **MVP scope** = P0–P3 + P5 + PNG/video export. (Confirm or trim.)
4. **Who builds it** = hand this brief to a dev or a fresh Claude Code session in a new repo.
5. **Distinct-image strategy** = per-mesh for ≤100 images (simplest) vs atlas (scales). Default per-mesh.
6. **Monetization/auth/storage** — out of scope for this brief (add later if it's a SaaS).
