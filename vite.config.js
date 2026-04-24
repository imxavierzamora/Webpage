import { defineConfig } from 'vite'

export default defineConfig({
  // Tells Vite that the site is served from https://imxavierzamora.github.io/Webpage/
  // Without this, asset paths like /assets/index.js resolve to the domain root
  // and 404 on GitHub Pages.
  base: '/Webpage/',
})
