import LocomotiveScroll from 'locomotive-scroll'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import 'locomotive-scroll/dist/locomotive-scroll.css'

gsap.registerPlugin(ScrollTrigger)

// ── 1. Init Locomotive Scroll ────────────────────────────────────────────────
const locoScroll = new LocomotiveScroll({
  el: document.querySelector('[data-scroll-container]'),
  smooth: true,
  multiplier: 0.9,
  lerp: 0.08,
})

// ── 2. Sync Locomotive → ScrollTrigger ──────────────────────────────────────
locoScroll.on('scroll', ScrollTrigger.update)

ScrollTrigger.scrollerProxy('[data-scroll-container]', {
  scrollTop(value) {
    return arguments.length
      ? locoScroll.scrollTo(value, { duration: 0, disableLerp: true })
      : locoScroll.scroll.instance.scroll.y
  },
  getBoundingClientRect() {
    return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
  },
  pinType: document.querySelector('[data-scroll-container]').style.transform
    ? 'transform'
    : 'fixed',
})

// ── 3. Sunrise parallax ──────────────────────────────────────────────────────
// Both animations share the same ScrollTrigger window: the full height of
// .hero-scene while it's in the viewport (top-of-scene to bottom-of-scene
// reaching the top of the screen).
//
// The vinyl travels ~80% of its own height upward across that window.
// The skyline barely drifts (~8%). The 10:1 speed ratio is what creates
// the sunrise — vinyl punches up fast while the city barely moves.

const heroTrigger = {
  trigger: '.hero-scene',
  scroller: '[data-scroll-container]',
  scrub: 1.5,          // scrub > 1 adds a little lag, feels weightier
  start: 'top top',
  end: 'bottom top',
}

// Vinyl: starts pushed down (below the "horizon" / overflow boundary),
// rises well above the skyline by the time the scene exits.
gsap.fromTo(
  '.layer-vinyl',
  { yPercent: 55 },    // 55% of vinyl height below natural position → hidden
  { yPercent: -30, ease: 'none', scrollTrigger: heroTrigger }
)

// Skyline: nearly static — a slight downward drift gives the illusion of
// depth and makes the vinyl feel like it's genuinely coming from behind.
gsap.fromTo(
  '.layer-skyline',
  { yPercent: 0 },
  { yPercent: 8, ease: 'none', scrollTrigger: heroTrigger }
)

// ── 4. Refresh after images load ────────────────────────────────────────────
ScrollTrigger.addEventListener('refresh', () => locoScroll.update())
ScrollTrigger.refresh()
