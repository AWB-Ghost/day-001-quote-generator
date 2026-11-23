# Pixel Quotes

> Tune in a quote. Keep the good ones. Shred the rest.

**Pixel Quotes** is an 8-bit random quote generator styled like a midnight arcade. Quotes type out on a retro CRT monitor, the ones you like beam onto a pixel bookshelf, and the ones you don't get fed into the **SHRED-O-MATIC 8**, a shredder whose bin fills up as you go.

**Day 001** of my 100 Days Challenge.

---

## Features

- **75 curated quotes** across six categories (Motivation, Creativity, Happiness, Confidence, Relaxation and Humour) plus a **Random** channel.
- **Accurate attribution.** Every quote names its author. Sources such as books, letters and speeches are shown only where they're well documented, and common misattributions are avoided.
- **Retro CRT display.** Quotes type out character by character, with scanlines, a phosphor glow and an ambient light tinted by the category.
- **Like.** Saves the quote to **My Library**, beaming a glowing data packet onto the pixel bookshelf in the nav.
- **Next.** Changes channel with a burst of TV static.
- **Trash.** The quote glitches, shatters into pixel fragments in white and its category colour, and falls into the shredder.
- **Collection bin.** Holds 10 shredded quotes, with a capacity meter and an alarm when it's full. **Empty Trash** releases the fragments into the sky.
- **My Library.** Lists saved quotes, newest first. Copy or remove any of them.
- **Copy.** One click copies the quote, author and source.
- **8-bit sound effects.** Generated live with the Web Audio API (no audio files). Off by default, with an SFX switch in the nav.
- **Saved in your browser.** The library, bin and sound setting are stored in `localStorage`. No login, no database, no external API.
- **Responsive and accessible.** Works from 320px phones to wide desktops, is fully keyboard operable with visible focus, uses labelled controls and announces new quotes to screen readers. With reduced motion turned on, the animations are skipped.

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | [Next.js](https://nextjs.org) 16 (App Router, statically pre-rendered) |
| UI | [React](https://react.dev) 19, [TypeScript](https://www.typescriptlang.org) |
| Styling | [Tailwind CSS](https://tailwindcss.com) v4, custom CSS for the CRT, shredder and backdrop |
| Components | [8bitcn](https://www.8bitcn.com) (8-bit components for [shadcn/ui](https://ui.shadcn.com)), built on [Radix UI](https://www.radix-ui.com) |
| Toasts | [Sonner](https://sonner.emilkowal.ski) |
| Fonts | Press Start 2P and Pixelify Sans, self-hosted via `next/font` |
| Sound | Web Audio API, synthesised in the browser |
| Storage | `localStorage` |

## Getting started

**Requirements:** Node.js 20.9 or newer, and npm.

```bash
git clone <your-repo-url> pixel-quotes
cd pixel-quotes
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create an optimised production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

No environment variables are needed.

## Project structure

```
src/
├── app/
│   ├── layout.tsx          # Fonts, metadata, backdrop, toaster
│   ├── page.tsx            # Home page
│   ├── globals.css         # Theme tokens, CRT and shredder styles, animations
│   └── favicon.ico, icon.svg, apple-icon.png
├── components/
│   ├── quotes/
│   │   ├── quote-machine.tsx   # Main app: state, actions and animation sequences
│   │   ├── display-screen.tsx  # CRT monitor and typewriter
│   │   ├── shredder.tsx        # SHRED-O-MATIC 8, bin and capacity meter
│   │   ├── library-sheet.tsx   # My Library panel
│   │   ├── library-shelf.tsx   # Pixel bookshelf button
│   │   ├── nav-bar.tsx         # Top navigation and SFX switch
│   │   ├── retro-sky.tsx       # Starfield, circuits and falling pixel snow
│   │   └── categories.ts       # Category labels, colours and icons
│   ├── pixel/pixel.tsx         # Pixel-art renderer and icons
│   └── ui/                     # 8bitcn and shadcn/ui components
├── data/quotes.ts          # The quote collection
└── lib/                    # Sound engine, storage, clipboard and typewriter helpers
```

## Adding quotes

Quotes live in [`src/data/quotes.ts`](src/data/quotes.ts), grouped by category:

```ts
{ text: "Well done is better than well said.", author: "Benjamin Franklin", source: "Poor Richard's Almanack, 1737" },
```

Include a `source` only when you're confident of it. New quotes get stable IDs automatically.

## The 100 Days Challenge

Pixel Quotes is **Day 001** of my 100 Days Challenge: 100 days, 100 small projects, each built and published in public.

| Day | Project | Highlights |
| --- | --- | --- |
| 001 | Pixel Quotes | 8-bit quote generator, 8bitcn UI, Web Audio sound effects, animated shredder |

---

Quotes belong to their respective authors and are shared here with attribution.
