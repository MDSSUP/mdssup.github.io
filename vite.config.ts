import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

import react from '@vitejs/plugin-react'
import { defineConfig, version as viteVersion } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Facts about this particular build, for the Info screen to show. Vite itself
// provides none of this — the only things it offers a finished build are
// import.meta.env.MODE and friends — so the four values below are worked out
// here, while the build is running, and written into the code as plain text by
// the "define" setting further down.
//
// Whoever is holding the phone can then read them out, which is the only
// reliable way to find out which version of the app they are actually running.

function versionOf(packageJsonPath: string): string {
  return JSON.parse(readFileSync(packageJsonPath, 'utf8')).version as string
}

const appVersion = versionOf('./package.json')

// The barcode reader — the part that actually reads the card, and so the one
// most worth knowing the version of when scanning goes wrong.
//
// This reads the version of the copy that is installed, rather than the one
// package.json asks for, because those are not always the same thing: a "^"
// in front of a version number means "this or anything newer".
//
// The library can also state its own version to the running app, but importing
// it for that pulls several kilobytes of the reader into the app for the sake
// of one short string, and this app is downloaded onto phones over event wifi.
const zxingVersion = versionOf('./node_modules/zxing-wasm/package.json')

// The commit this was built from. A copy of the source downloaded as a zip has
// no .git folder and so no commit to find — that is not a reason to fail the
// build, so it just says "unknown" instead.
function currentCommit(): string {
  try {
    return execSync('git rev-parse --short HEAD', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return 'unknown'
  }
}

// The app is served from the root of the society's GitHub Pages site, so
// there is no base path to set — Vite's default of '/' is correct.
//
// This would only need changing if the app moved into a sub-folder, which on
// GitHub Pages means a repository that isn't named <account>.github.io. In
// that case add  base: '/name-of-the-repository/'  below, or the app will
// work while you are developing it and fail once published.

export default defineConfig({
  server: {
    allowedHosts: ['localhost']
  },
  // Each name on the left is replaced by the text on the right everywhere it
  // appears in the app, as the app is built. They are declared for TypeScript
  // in src/vite-env.d.ts and read in src/lib/build.ts; nothing else uses them
  // directly. JSON.stringify is not optional — the replacement is literal, so
  // a bare string would come out as code rather than as words.
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __BUILD_COMMIT__: JSON.stringify(currentCommit()),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __VITE_VERSION__: JSON.stringify(viteVersion),
    __ZXING_VERSION__: JSON.stringify(zxingVersion),
  },
  plugins: [react(), VitePWA({
    // A new version takes over by itself the next time the app is opened,
    // so nobody has to be told to update anything.
    registerType: 'autoUpdate',
    devOptions: {
      // Off by default: it adds a service worker to "pnpm dev" that caches
      // things, which mostly shows up as edits not appearing. Turn it on
      // when you specifically want to test offline behaviour.
      enabled: false
    },
    // What the phone shows for the installed app: its name, its icon, and
    // the colours it opens with.
    manifest: {
      id: '/',
      // Which addresses count as "inside" the installed app. Both must match
      // `base` above if the app ever moves into a sub-folder.
      scope: '/',
      start_url: '/',
      name: 'Membership Scanner',
      short_name: 'Scanner',
      description:
        'Scans a student card and checks whether that person is a member.',
      // Both match --base in src/index.css, so there is no white flash
      // between tapping the icon and the app appearing.
      theme_color: '#17181a',
      background_color: '#17181a',
      display: 'standalone',
      // The card outline the app draws is portrait, so the app is too.
      orientation: 'portrait',
      // Generated from public/icon.svg by "pnpm icons".
      icons: [
        { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
        { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        {
          src: 'maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          // Android crops icons to its own shape; this one has a margin so
          // nothing important is cut off.
          purpose: 'maskable'
        }
      ]
    },
    workbox: {
      // The list of files kept on the device so the app works with no
      // signal. The barcode reader is a .wasm file, which is not included
      // unless it is named here.
      globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}'],
      // The barcode reader is just over 1 MB. Workbox refuses to save
      // anything above this and only warns while building, so leave room.
      maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
    },
  })],
})
