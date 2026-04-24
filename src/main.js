import LocomotiveScroll from 'locomotive-scroll'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import 'locomotive-scroll/dist/locomotive-scroll.css'

gsap.registerPlugin(ScrollTrigger)

// ── 1. Init Locomotive Scroll v5 with GSAP as the custom ticker ──────────────
// initCustomTicker/destroyCustomTicker are v5's official hooks for handing
// off the animation loop to an external system. GSAP drives every frame,
// so Lenis and ScrollTrigger share one loop and stay perfectly in sync.
const locoScroll = new LocomotiveScroll({
  lenisOptions: {
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  },
  initCustomTicker: (onRender) => gsap.ticker.add(onRender),
  destroyCustomTicker: (onRender) => gsap.ticker.remove(onRender),
})

// ── 2. Sync Locomotive's Lenis instance → ScrollTrigger ──────────────────────
// lenisInstance is a public property on the v5 class.
// Lenis updates window.scrollY each tick via GSAP, so ScrollTrigger reads
// the real scroll position — no scrollerProxy needed.
locoScroll.lenisInstance.on('scroll', ScrollTrigger.update)
gsap.ticker.lagSmoothing(0)

// ── 3. Sunrise parallax with pinning ─────────────────────────────────────────
// A single timeline drives both the vinyl and the intro text on one ScrollTrigger.
// Using a timeline lets each element travel a different distance — the text stops
// at duration 1 (halfway), the vinyl keeps going to duration 2 (full scroll).
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: '.hero-scene',
    pin: true,
    scrub: 0.5,
    start: 'top top',
    end: '+=650%',
  }
})

// Vinyl: travels the full timeline (duration 2)
tl.fromTo('.layer-vinyl',
  { yPercent: -10 },
  { yPercent: -325, ease: 'none', duration: 2 },
  0  // starts at position 0 in the timeline
)

// Intro text: rises with the vinyl but stops at duration 1 (halfway through scroll).
// ← tune duration to control when it stops relative to the vinyl's full travel.
tl.fromTo('.intro-text',
  { yPercent: 200 },
  { yPercent: 15, ease: 'none', duration: 1 },
  0  // also starts at position 0
)

// ── 4. Refresh after images load ─────────────────────────────────────────────
ScrollTrigger.addEventListener('refresh', () => locoScroll.resize())
ScrollTrigger.refresh()
