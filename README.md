# Goldfish

An interactive 3D portfolio piece: a guppy swims in front of big words and casts a real shadow across them. Visitors can type their own words and switch between five colour themes, each with its own typeface and fin colour.

## Features

- **Swimming guppy.** A rigged model plays its own swim animation while following a figure-eight path, turning to face where it's going.
- **Real shadows.** The fish's shadow falls across the wall and the letters behind it.
- **Your words.** Type in the field at the bottom to replace the text. One word takes one line; longer phrases split evenly across two and shrink to fit.
- **Five themes.** Alternating dark and light palettes, each setting the wall, the text colour and font, and the fin colour. Colours fade between themes.
- **Fin recolouring.** A custom fragment shader re-hues only the blue of the tail and fins, keeping their stripes and shading, and leaves the body's colours untouched.
- **Exact colours.** The wall and text render unlit, so they show the palette's exact hex values, with a transparent shadow-catcher plane on top.
- **Responsive.** The text fits the screen width, and the fish scales down on phones.

## Built with

[React](https://react.dev), [TypeScript](https://www.typescriptlang.org), [Vite](https://vite.dev), [three.js](https://threejs.org), [React Three Fiber](https://r3f.docs.pmnd.rs) and [drei](https://drei.docs.pmnd.rs).

## Run it locally

Requires [Node.js](https://nodejs.org).

```sh
cd app
npm install
npm run dev
```

Then open the address Vite prints (usually http://localhost:5173).

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Type-check and build for production into `app/dist` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint with oxlint |

## Project structure

```
app/
  public/
    guppy.glb        the fish model
    fonts/           one typeface per theme
  src/
    config.ts        themes, text, fish and social settings
    Scene.tsx        lights, wall, background text, shadow catcher
    Fish.tsx         model loading, swim path, fin-recolour shader
    Header.tsx       name and social links
    App.tsx          canvas, text field, theme swatches, toast
PLANNING.md          decisions and to-do list
```

Most things you'd want to tweak (theme colours, fonts, the default text, fish size) live in `app/src/config.ts`.

## Credits

- ["Guppie Animated"](https://sketchfab.com/3d-models/guppie-animated-53abad43280a4b7ab26bd0e6b8dea62f) by [Comitre](https://sketchfab.com/Comitre), licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/). Changes: the eye texture was recoloured from red to black and grey, and the fins are re-hued at runtime by a shader.
- Typefaces: Raizent, TBJ Black Gold, The Globe and JPAL 10 from [FontSpace](https://www.fontspace.com), used for personal, non-commercial purposes. [Barlow](https://fonts.google.com/specimen/Barlow) is from Google Fonts under the SIL Open Font License.

## Contact

**Salma Ali** · [LinkedIn](https://www.linkedin.com/in/salma-fouad-ali/) · [GitHub](https://github.com/salma-al)
