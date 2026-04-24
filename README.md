# Vinyl: Community Beyond the Algorithm

A scroll-driven journalism feature built for J222 Interactive Narratives at UC Berkeley Graduate School of Journalism.

**Live site:** https://imxavierzamora.github.io/Webpage/

---

## What it is

A longform feature page about vinyl record culture in the Bay Area. The hero section uses a layered parallax animation — a vinyl record rises like a sunrise from behind the San Francisco skyline as the reader scrolls, followed by an intro text block. The page then transitions into the body of the story.

---

## Stack

| Tool | Purpose |
|------|---------|
| [Vite](https://vitejs.dev/) | Bundler and dev server |
| [Locomotive Scroll v5](https://scroll.locomotive.ca/) | Smooth scroll with accessibility support |
| [GSAP + ScrollTrigger](https://gsap.com/) | Scroll-driven animations (parallax, pinning) |

Locomotive Scroll v5 uses [Lenis](https://lenis.darkroom.engineering/) internally. GSAP drives the animation loop via `initCustomTicker` so both libraries share one `requestAnimationFrame`.

---

## Local development

```bash
npm install
npm run dev
# → http://localhost:5173
```

## Build for production

```bash
npm run build
# output in dist/
```

## Deploy

Pushing to `main` triggers a GitHub Actions workflow that builds and deploys `dist/` to GitHub Pages automatically. See [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

---

## Project structure

```
index.html          # entry point
src/
  main.js           # Locomotive Scroll + GSAP animation logic
  style.css         # all styles
  assets/           # images (skyline, vinyl, map)
.github/
  workflows/
    deploy.yml      # GitHub Pages auto-deploy
vite.config.js      # sets base path for GitHub Pages
```

---

## Key animation values (src/main.js)

The sunrise effect is a GSAP timeline pinned to `.hero-scene`:

- `yPercent` start/end on `.layer-vinyl` — how far the record travels
- `duration` ratio between vinyl and intro text — controls when the text stops rising
- `end: '+=650%'` — how long the pin holds (in scroll distance)

All tunable without touching the HTML.
