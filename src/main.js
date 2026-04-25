import LocomotiveScroll from 'locomotive-scroll'
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
    end: '+=150%',
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

  panels.forEach((panel, i) => {
    if (i === 0) return
    panelTl.to(panels[i - 1], { opacity: 0, duration: 0.2 })
    panelTl.to(panels[i], { opacity: 1, duration: 0.2 }, '<0.05')
    if (i < panels.length - 1) {
      panelTl.to({}, { duration: 0.75 })
    }
  })
})

// ── 5. Refresh after images load ─────────────────────────────────────────────
ScrollTrigger.addEventListener('refresh', () => locoScroll.resize())
ScrollTrigger.refresh()
