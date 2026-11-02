// How the app's icon files are generated from public/icon.svg.
// Run "pnpm icons" after changing the icon, and commit what it writes.

import {
  defineConfig,
  minimal2023Preset,
} from "@vite-pwa/assets-generator/config";

// The app's background colour, matching the one in src/index.css. Without
// this the generator puts the icon on a white square, which looks wrong on a
// dark app and shows as a white edge once a phone rounds the corners.
const BACKGROUND = "#17181a";

// No padding: public/icon.svg already leaves a margin around the card, and
// the generator's default would shrink the drawing to 70% of the icon, which
// looks small and blurry on a home screen. Phones add their own margin when
// they crop the icon to their own shape.
const FILL_THE_ICON = { padding: 0, resizeOptions: { background: BACKGROUND } };

export default defineConfig({
  headLinkOptions: { preset: "2023" },
  preset: {
    transparent: { ...minimal2023Preset.transparent, ...FILL_THE_ICON },
    maskable: { ...minimal2023Preset.maskable, ...FILL_THE_ICON },
    apple: { ...minimal2023Preset.apple, ...FILL_THE_ICON },
  },
  images: ["public/icon.svg"],
});
