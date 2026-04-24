import LocomotiveScroll from 'locomotive-scroll'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import 'locomotive-scroll/dist/locomotive-scroll.css'

gsap.registerPlugin(ScrollTrigger)

// ── 1. Init Locomotive Scroll ────────────────────────────────────────────────
// Locomotive wraps the native scroll and produces smooth, inertia-based
// scrolling. We point it at [data-scroll-container] in the HTML.
const locoScroll = new LocomotiveScroll({
  el: document.querySelector('[data-scroll-container]'),
  smooth: true,
  multiplier: 0.9,       // scroll speed feel (1 = default)
  lerp: 0.08,            // interpolation — lower = smoother/slower catch-up
})

// ── 2. Sync Locomotive → ScrollTrigger ──────────────────────────────────────
// GSAP's ScrollTrigger listens to the browser's native scroll position.
// Locomotive overrides that with its own virtual position, so we must
// manually tell ScrollTrigger where Locomotive thinks we are on each tick.
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
  // Locomotive uses CSS transforms for smooth scroll, not actual page scroll.
  // pinType tells ScrollTrigger to use transforms too so pinned elements stay aligned.
  pinType: document.querySelector('[data-scroll-container]').style.transform
    ? 'transform'
    : 'fixed',
})

// ── 3. Parallax on each hero image ──────────────────────────────────────────
// Each .parallax-img gets its own ScrollTrigger. As the trigger element
// enters/exits the viewport, GSAP animates the inner <img> on the Y axis —
// moving it in the opposite direction of scroll creates the parallax illusion.
document.querySelectorAll('.parallax-img').forEach((wrapper) => {
  const img = wrapper.querySelector('img')

  gsap.fromTo(
    img,
    { yPercent: -15 },   // image starts 15% above its natural position
    {
      yPercent: 15,       // ends 15% below — total 30% travel across the scroll window
      ease: 'none',       // linear so it feels tied to your finger/wheel
      scrollTrigger: {
        trigger: wrapper,
        scroller: '[data-scroll-container]',  // must match Locomotive's element
        scrub: true,       // ties animation directly to scroll position (not time-based)
        start: 'top bottom',
        end: 'bottom top',
      },
    }
  )
})

// ── 4. Refresh both libraries after all images load ──────────────────────────
// Images affect page height. If ScrollTrigger calculates positions before
// images have loaded, pin points and trigger offsets will be wrong.
ScrollTrigger.addEventListener('refresh', () => locoScroll.update())
ScrollTrigger.refresh()
