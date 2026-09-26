// Everything you'll want to tweak (or later expose as UI controls) lives here.
// Themes, picked from the swatches at the bottom left. The first is the default.
// Each sets the wall, the text colour and font, and the fin colour. They alternate dark and
// light; every text colour is at least 6.5:1 against its wall, and fins at least 3:1.
// The logo, icons and selected/focused outlines derive from the text colour in index.css,
// shaded away from the wall (`mode`): lighter on dark themes, darker on light ones.
// `fins` recolours only the blue of the guppy's tail and fins; the body keeps its colours.
// It's the fins' average colour: the original blue averages #435985, so that keeps them as is.
export type Palette = {
  id: string
  label: string
  mode: 'dark' | 'light'
  background: string
  text: string
  fins: string
  font: string
}

export const PALETTES: Palette[] = [
  { id: 'plum', label: 'Plum', mode: 'dark', background: '#3d1a36', text: '#e7b8d8', fins: '#23958a', font: '/fonts/raizent.otf' },
  { id: 'sage', label: 'Sage', mode: 'light', background: '#c9d4a8', text: '#2f3a17', fins: '#9c3566', font: '/fonts/tbj-black-gold.ttf' },
  { id: 'indigo', label: 'Indigo', mode: 'dark', background: '#34347e', text: '#c5c7f2', fins: '#b669e2', font: '/fonts/barlow-bold.ttf' },
  { id: 'blush', label: 'Blush', mode: 'light', background: '#f6d6dc', text: '#6b1a33', fins: '#882849', font: '/fonts/the-globe.ttf' },
  { id: 'deep-sea', label: 'Deep sea', mode: 'dark', background: '#0f3f4d', text: '#cfe3e6', fins: '#e8704f', font: '/fonts/jpal-10.otf' },
]

// Background text: the default, and the limit for what visitors type in the text field.
export const TEXT = {
  default: 'MAKE WAVES',
  placeholder: 'Type Something..',
  maxLength: 24,
}

export const FISH = {
  url: '/guppy.glb',
  clip: 'Take 001', // the model's own swim animation
  // Model axes: the body runs along X with the head at +X, Y is up.
  headSign: 1 as 1 | -1, // flip if the fish swims backwards
  size: 7, // world-space length, tail included
  fullSizeWidth: 13, // visible width (world units) at which the fish is full size; narrower screens scale it down
  cameraTurn: 0.55, // radians the head turns toward the camera, so the tail sweep reads
}

export const SOCIALS = {
  linkedin: 'https://www.linkedin.com/in/salma-fouad-ali/',
  github: 'https://github.com/salma-al',
  email: 'salma_fouad@outlook.com',
}
