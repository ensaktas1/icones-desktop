# Icônes — Desktop

A native macOS icon browser for the [Iconify](https://iconify.design) ecosystem —
200,000+ open-source icons across 150+ icon sets, searchable and exportable from a
fast, keyboard-friendly desktop app.

Inspired by [icones](https://icones.js.org) ([antfu-collective/icones](https://github.com/antfu-collective/icones))
and the clean UX of native icon managers, rebuilt as a lightweight Tauri app.

## Download

Grab the latest `.dmg` from the
[**Releases**](https://github.com/ensaktas1/icones-desktop/releases/latest) page.

1. Open the `.dmg` and drag **Icônes** into your **Applications** folder.
2. The app isn't notarized yet, so on first launch macOS warns about an
   unidentified developer. Right-click the app → **Open** → **Open** (just once).
   Alternatively run `xattr -cr /Applications/Icônes.app` in Terminal.

> Currently **Apple Silicon (arm64)** only — Intel/universal builds coming later.

## Features

- **Browse by set** — icon collections grouped by category in a collapsible sidebar
- **Search everything** — full-text search across every Iconify collection
- **Filter by style** — all / monochrome / colored
- **Live export panel** — tweak size, padding, rotation, flip, and color; the preview
  matches the exported output exactly
- **Copy or download** as `SVG`, `JSX`, a full React component, or a `Data URL`
- **Dark & light themes**, native macOS window chrome

## Tech

- [Tauri 2](https://tauri.app) — native shell (Rust), tiny bundle, system WebView
- [React 19](https://react.dev) + [Vite](https://vite.dev) + TypeScript
- [`@iconify/react`](https://iconify.design/docs/icon-components/react/) for rendering
- [`@iconify/utils`](https://iconify.design/docs/libraries/utils/) for SVG generation

All icon data comes from the public [Iconify API](https://iconify.design/docs/api/).

## Development

```bash
pnpm install
pnpm tauri dev      # run the desktop app in dev mode
pnpm dev            # or just the web frontend on http://localhost:1420
```

## Build

```bash
pnpm tauri build    # produces a .app + .dmg in src-tauri/target/release/bundle
```

## Credits & licensing

- App code is MIT licensed — see [LICENSE](LICENSE).
- Icons are provided by [Iconify](https://iconify.design); each icon set keeps its
  own license (MIT, Apache-2.0, CC-BY, etc.). Check the individual set before use.
- Conceptually indebted to [icones](https://github.com/antfu-collective/icones) by
  [@antfu](https://github.com/antfu).
