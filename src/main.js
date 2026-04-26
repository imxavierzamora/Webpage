import { interviews } from './interviews.js'
import LocomotiveScroll from 'locomotive-scroll'

// Let Vite process all assets so paths are correct in production builds
const assetModules = import.meta.glob('/src/assets/*.{png,jpg,jpeg}', { eager: true })
function assetUrl(filename) {
  const mod = assetModules[`/src/assets/${filename}`]
  return mod ? mod.default : `${import.meta.env.BASE_URL}src/assets/${filename}`
}
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import 'locomotive-scroll/dist/locomotive-scroll.css'

gsap.registerPlugin(ScrollTrigger)

// ── 1. Init Locomotive Scroll v5 with GSAP as the custom ticker ──────────────
const locoScroll = new LocomotiveScroll({
  lenisOptions: {
    duration: 0.7,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  },
  initCustomTicker: (onRender) => gsap.ticker.add(onRender),
  destroyCustomTicker: (onRender) => gsap.ticker.remove(onRender),
})

// ── 2. Sync Locomotive's Lenis instance → ScrollTrigger ──────────────────────
locoScroll.lenisInstance.on('scroll', ScrollTrigger.update)
gsap.ticker.lagSmoothing(0)

// ── 3. Hero animation — static skyline, vinyl + title rise from below ─────────
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: '.hero-scene',
    pin: true,
    anticipatePin: 1,
    scrub: 0.5,
    start: 'top top',
    end: '+=50%',
  }
})

// Vinyl: rises the full timeline
tl.fromTo('.layer-vinyl',
  { yPercent: -25 },
  { yPercent: -95, ease: 'none', duration: 2 },
  0
)

// Intro text: rises and stops at bay waterline halfway through
tl.fromTo('.intro-text',
  { yPercent: 200 },
  { yPercent: 15, ease: 'none', duration: 1 },
  0
)


// Hide title once skyline has scrolled up past it
ScrollTrigger.create({
  trigger: '.hero-scene',
  start: 'top -40%',
  onEnter: () => gsap.set('.hero-title', { autoAlpha: 0 }),
  onLeaveBack: () => gsap.set('.hero-title', { autoAlpha: 1 }),
})


// ── 4. Panel scrollytelling — crossfade through all six themes (desktop only) ─
const panels = gsap.utils.toArray('.horiz-panel')

gsap.matchMedia().add('(min-width: 769px)', () => {
  gsap.set(panels, { opacity: 0 })
  gsap.set(panels[0], { opacity: 1 })

  const panelTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.horiz-scroll-outer',
      pin: true,
      scrub: 1,
      start: 'top top',
      end: () => '+=' + (panels.length - 1) * window.innerHeight * 1.5,
    }
  })

  panelTl.to({}, { duration: 0.75 })
  panels.forEach((panel, i) => {
    if (i === 0) return
    panelTl.to(panels[i - 1], { opacity: 0, duration: 0.2 })
    panelTl.to(panels[i], { opacity: 1, duration: 0.2 }, '<0.05')
    panelTl.to({}, { duration: 0.75 })
  })
})

// ── 5. Refresh after images load ─────────────────────────────────────────────
ScrollTrigger.addEventListener('refresh', () => locoScroll.resize())
ScrollTrigger.refresh()

// ── 6. Build timeline nodes ───────────────────────────────────────────────────
const section = document.getElementById('timeline-section')

interviews.forEach((iv, i) => {
  const side = i % 2 === 0 ? 'left' : 'right'

  const thumbsHtml = iv.thumbs
    .map(t => `<img class="tl-thumb" src="${assetUrl(t)}" alt="${iv.names.join(' & ')}" />`)
    .join('')

  const mediaIcon = iv.mediaType === 'video' ? '▶' : iv.mediaType === 'audio' ? '♪' : '≡'
  const mediaLabel = iv.mediaType === 'video' ? 'Watch' : iv.mediaType === 'audio' ? 'Listen' : 'Read'

  const node = document.createElement('div')
  node.className = `tl-node tl-node--${side}`
  node.dataset.id = iv.id
  node.innerHTML = `
    <div class="tl-card">
      <div class="tl-thumbs">${thumbsHtml}</div>
      <div class="tl-info">
        <p class="tl-location">${iv.location}</p>
        <h3 class="tl-name">${iv.names.join(' & ')}</h3>
        <p class="tl-tagline">${iv.tagline}</p>
        <button class="tl-btn">${mediaIcon} ${mediaLabel}</button>
      </div>
    </div>
  `
  section.appendChild(node)
})

// ── 7. Drawer logic ───────────────────────────────────────────────────────────
const drawer = document.getElementById('interview-drawer')
const overlay = document.getElementById('drawer-overlay')
const drawerInner = document.getElementById('drawer-inner')

function openDrawer(id) {
  const iv = interviews.find(x => x.id === id)
  if (!iv) return

  const thumbsHtml = iv.thumbs
    .map(t => `<img class="drawer-thumb" src="${assetUrl(t)}" alt="${iv.names.join(' & ')}" />`)
    .join('')

  const isAudio = iv.mediaType === 'audio'
  const mediaHtml = iv.embedUrl
    ? `<div class="drawer-media">
        <iframe
          src="${iv.embedUrl}"
          class="${isAudio ? 'is-audio' : 'is-video'}"
          allow="autoplay"
          ${isAudio ? 'scrolling="no" frameborder="no"' : 'allowfullscreen'}
        ></iframe>
      </div>`
    : ''

  const textHtml = iv.paragraphs.map(p =>
    typeof p === 'string'
      ? `<p>${p}</p>`
      : `<img class="drawer-story-img" src="${assetUrl(p.src)}" alt="${p.alt}" />`
  ).join('')

  drawerInner.innerHTML = `
    <div class="drawer-header">
      <div class="drawer-thumbs">${thumbsHtml}</div>
      <div>
        <h2 class="drawer-name">${iv.names.join(' & ')}</h2>
        <p class="drawer-location">${iv.location}</p>
      </div>
    </div>
    ${mediaHtml}
    <div class="drawer-text">${textHtml}</div>
  `

  drawer.classList.add('is-open')
  drawer.setAttribute('aria-hidden', 'false')
  overlay.classList.add('is-visible')
  locoScroll.lenisInstance.stop()
}

function closeDrawer() {
  drawer.classList.remove('is-open')
  drawer.setAttribute('aria-hidden', 'true')
  overlay.classList.remove('is-visible')
  locoScroll.lenisInstance.start()
  setTimeout(() => { drawerInner.innerHTML = '' }, 350)
}

document.getElementById('timeline-section').addEventListener('click', e => {
  const btn = e.target.closest('.tl-btn')
  if (!btn) return
  const node = btn.closest('.tl-node')
  if (node) openDrawer(node.dataset.id)
})

document.getElementById('drawer-close').addEventListener('click', closeDrawer)
overlay.addEventListener('click', closeDrawer)
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer() })

// Intercept wheel events on the drawer so Lenis doesn't swallow them
drawer.addEventListener('wheel', (e) => {
  if (!drawer.classList.contains('is-open')) return
  e.stopPropagation()
  e.preventDefault()
  drawer.scrollBy(0, e.deltaY)
}, { passive: false })

// Intercept touch events so Lenis doesn't swallow mobile scroll inside the drawer
drawer.addEventListener('touchstart', (e) => {
  e.stopPropagation()
}, { passive: true })

drawer.addEventListener('touchmove', (e) => {
  e.stopPropagation()
}, { passive: true })
