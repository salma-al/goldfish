# Goldfish — Planning

## Goal
A one-screen portfolio piece that shows off web 3D skills: a guppy swimming
in empty space (no sea or water), casting a shadow onto big text behind it. The look
follows a reference image, but with our own colors.

## Decisions
| Decision | Choice | Why |
|---|---|---|
| Stack | Vite + React + React Three Fiber + drei (TypeScript) | Upcoming features are UI state that drives the 3D scene, which R3F handles cleanly. Also shows React + three.js together. |
| Model | Rigged guppy with its own 5s swim clip (`Take 001`) → `app/public/guppy.glb` (0.56MB). Its eye texture was recoloured from red to black with a grey ring; the untouched original is in `model-sources/` | Picked 2026-09-26 over three static models (Shiny, Comet, Betta): an artist-made swim looks the most natural, and the file is tiny |
| Swim motion | The model's own skeleton animation, plus a lazy figure-eight path; the fish faces its direction of travel, turned 0.55 rad toward the camera | The earlier vertex-shader bend was dropped with the static models |
| Background text | 3D text in the scene. Visitors change it in the text field at the bottom centre (max 24 characters, uppercased, not kept in the URL, so a refresh restores `TEXT.default` and the empty field). One word takes one line; more words split into two lines at the most even space. Lines shrink to fit the visible wall width, which also works on phones | Real shadows land on the letters, like the reference |
| Themes | Five themes in `PALETTES` (`config.ts`), picked from swatches at the bottom left (also `?palette=<id>`). They alternate dark and light: Plum (dark, Raizent, teal fins), Sage (light, TBJ, magenta), Sand (dark, Barlow Bold, indigo-violet), Blush (light pink, The Globe, vista blue), Deep sea (dark teal, JPAL 10, coral). Text is at least 8:1 against the wall. Each sets the wall, the text colour and font, and the fin colour; colours ease over about 0.5s | The user's order and colours, 2026-09-26. Terracotta was dropped |
| Exact colours | Wall and text use flat unlit materials with no tone mapping, so they show the exact hex. A transparent `shadowMaterial` plane on top draws the fish's shadow over both (`SHADOW_OPACITY`) | Lit materials plus ACES tone mapping had shifted the colours (for example `#c26c32` rendered as `#d58442`) |
| Fin recolour | A fragment-shader hue shift of the texture's blue band (hue 0.42–0.76) toward the palette's `fins` colour. Saturation and brightness are scaled relative to the fins' average colour `#435985`, so the stripes and shading survive and the body is untouched | Driven by the palette, with no texture edits |
| Lighting | Directional light from the upper left, with shadow maps and an environment for reflections | Shadow falls down and to the right, like the reference. |
| Config | Colors, words and fish settings in `app/src/config.ts` | One place to tweak, and easy to expose as UI later. |
| Header | "Salma Ali" logo (Barlow Medium) top left; LinkedIn, email and GitHub icons top right (`SOCIALS` in config). Links open in a new tab; the email icon copies the address and shows an "Email Copied" toast at the top centre for 2s. The logo, the icons and the text field use `--ink`: the theme's text colour shaded 25% away from the wall (darker on light themes, lighter on dark ones). The selected swatch and focused field outlines use the text colour | The user's choices, 2026-09-26 |
| Dev URL | http://127.0.0.1:5173 | `localhost` can resolve to IPv6 and miss the server. |

## Current state
- Scene: `app/src/Fish.tsx`, `app/src/Scene.tsx`, `app/src/config.ts`.
- Guppy, 7 units long, over the default Plum theme (`#6b2d5c` wall, `#2e0f27` text in Raizent, teal fins), with 4 more themes.
- The project was renamed from `fish` to `goldfish`.

## To do
### Now
- [x] Fix the stiff fish: the wave used the wrong axis (X instead of Z) and the wrong space (the model's untransformed vertices).
- [x] Fix the frozen C-shaped bend: the loader-cached material kept an old compiled shader and a stale time value after hot reloads. The fish now clones its materials, and the shader's cache key comes from its source.
- [x] Make the swim visible from the side: a 3/4 turn toward the camera (`cameraTurn`), a bigger tail sweep (`swimAmp`), and an up/down fin flutter (`finFlutter`).
- [x] Pick a model: Guppy. The other models were deleted, and the menu and swim shader were removed.
- [x] Make the guppy bigger (`size: 7`) and recolour its red eye.
- [ ] Clean up console warnings: `THREE.Clock` is deprecated (use `THREE.Timer`), and `PCFSoftShadowMap` was removed.
- [ ] Tune the shadow softness and the swim path.

### Features
- [x] UI: text input that changes the background words.
- [x] New default text: "MAKE WAVES". The field's placeholder is "Type Something..", and the field and swatches have a 4px radius.
- [x] Phones: the fish and its sideways swing scale with the visible width (`FISH.fullSizeWidth`), so it stays on screen; desktop is unchanged.
- [x] UI: colour palettes (swatches) for the wall, text and fins.
- [x] Pair a font with each theme and reorder: Plum is the default, then Sage.

### Polish / performance
- [ ] Loading state while the model downloads.

## Setup notes
- Node v26 is in `/usr/local/bin`. If `npm` is not found, add
  `export PATH="/usr/local/bin:$PATH"` to `~/.zshrc`.
- Run: `cd app && npm run dev`.
- To let Claude see the page, install the Claude in Chrome extension and approve `127.0.0.1:5173`. Headless Chrome screenshots came out blank because the 18MB model hadn't loaded yet.
