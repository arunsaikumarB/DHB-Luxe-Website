import { useEffect, useRef, useState, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronsDown } from 'lucide-react'
import { MagneticButton } from '@/components/shared/MagneticButton'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import type { WalkthroughSection } from '@/data/walkthrough'

gsap.registerPlugin(ScrollTrigger)

function hasDeepLinkHash() {
  const hash = window.location.hash.replace(/^#/, '')
  return Boolean(hash) && hash !== 'walkthrough' && hash !== 'top'
}

export type VideoScrollSequenceProps = {
  videos: WalkthroughSection[]
  scrollVhPerSection?: number
  objectFit?: 'cover' | 'contain'
  preloadStrategy?: 'all' | 'adjacent'
  className?: string
  onReady?: () => void
  onSectionChange?: (index: number) => void
}

function OverlayContent({
  section,
  fadeRef,
}: {
  section: WalkthroughSection
  fadeRef: RefObject<HTMLDivElement | null>
}) {
  return (
    <div
      ref={fadeRef}
      className="pointer-events-none absolute inset-0 z-10 flex items-end md:items-center will-change-[opacity]"
      style={{ opacity: 1 }}
    >
      <div className="pointer-events-auto mx-auto w-full max-w-[1600px] px-5 md:px-10 pb-20 md:pb-0">
        {section.variant === 'hero' && (
          <div className="max-w-4xl">
            <p className="mb-5 text-[11px] uppercase tracking-[0.35em] text-background/65">
              {section.label}
            </p>
            <p className="font-display text-[clamp(2.8rem,8vw,6.5rem)] leading-[0.95] text-background text-balance">
              {section.headline}
            </p>
            <p className="mt-7 max-w-xl text-base md:text-lg text-background/70 leading-relaxed">
              {section.description}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              {section.cta && (
                <MagneticButton as="a" href={section.cta.href} strength={0.45}>
                  <span className="inline-flex h-14 items-center bg-accent px-8 text-[12px] uppercase tracking-[0.22em] text-foreground transition-colors duration-500 hover:bg-background">
                    {section.cta.label}
                  </span>
                </MagneticButton>
              )}
              {section.secondaryCta && (
                <MagneticButton as="a" href={section.secondaryCta.href} strength={0.4}>
                  <span className="inline-flex h-14 items-center border border-background/35 px-8 text-[12px] uppercase tracking-[0.22em] text-background transition-colors duration-500 hover:border-accent hover:text-accent">
                    {section.secondaryCta.label}
                  </span>
                </MagneticButton>
              )}
            </div>
          </div>
        )}

        {section.variant === 'features' && (
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="max-w-2xl">
              <p className="mb-4 text-[11px] uppercase tracking-[0.35em] text-accent">{section.label}</p>
              <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] text-background leading-[1.02]">
                {section.title}
              </h2>
              <p className="mt-6 text-lg text-background/70 leading-relaxed max-w-xl">
                {section.description}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {section.features?.map((feature) => (
                <div
                  key={feature}
                  className="rounded-2xl border border-background/15 bg-black/40 px-5 py-4 text-background"
                >
                  <p className="text-sm md:text-base leading-snug">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {section.variant === 'editorial' && (
          <div className="max-w-3xl ml-auto text-right">
            <p className="mb-4 text-[11px] uppercase tracking-[0.35em] text-accent">{section.label}</p>
            <h2 className="font-display text-[clamp(2.8rem,7vw,5.5rem)] text-background leading-[1.02]">
              {section.title}
            </h2>
            <p className="mt-6 text-lg text-background/70 leading-relaxed ml-auto max-w-lg">
              {section.description}
            </p>
            <div className="mt-8 flex flex-wrap justify-end gap-3">
              {section.features?.map((feature) => (
                <span
                  key={feature}
                  className="rounded-full border border-background/15 bg-black/40 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-background/85"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {section.variant === 'cards' && (
          <div className="w-full max-w-6xl">
            <p className="mb-4 text-[11px] uppercase tracking-[0.35em] text-accent">{section.label}</p>
            <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] text-background mb-8">
              {section.title}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
              {section.features?.map((feature, i) => (
                <div
                  key={feature}
                  className="flex h-full min-h-[140px] flex-col justify-between rounded-2xl border border-background/15 bg-black/40 p-5 text-background"
                >
                  <p className="text-[10px] uppercase tracking-[0.25em] text-background/45">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <p className="font-display text-xl md:text-2xl leading-tight mt-6">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {section.variant === 'list' && (
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-4 text-[11px] uppercase tracking-[0.35em] text-accent">{section.label}</p>
              <h2 className="font-display text-[clamp(2.8rem,7vw,5.5rem)] text-background leading-[1.02]">
                {section.headline ?? section.title}
              </h2>
              <p className="mt-6 text-lg text-background/70 leading-relaxed max-w-lg">
                {section.description}
              </p>
            </div>
            <ul className="space-y-0 border-t border-background/15">
              {section.features?.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center justify-between border-b border-background/15 py-4 text-background"
                >
                  <span className="font-display text-2xl md:text-3xl">{feature}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                </li>
              ))}
            </ul>
          </div>
        )}

        {section.variant === 'experience' && (
          <div className="max-w-2xl">
            <div className="rounded-3xl border border-background/15 bg-black/45 p-8 md:p-10 text-background">
              <p className="mb-4 text-[11px] uppercase tracking-[0.35em] text-accent">{section.label}</p>
              <h2 className="font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.02]">
                {section.title}
              </h2>
              <p className="mt-6 text-background/70 leading-relaxed">{section.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {section.features?.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-full border border-background/20 px-4 py-2 text-[11px] uppercase tracking-[0.16em]"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {section.variant === 'finale' && (
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-5 text-[11px] uppercase tracking-[0.35em] text-accent">{section.label}</p>
            <h2 className="font-display text-[clamp(2.8rem,7vw,5.5rem)] text-background leading-[1.02] text-balance">
              {section.headline ?? section.title}
            </h2>
            <p className="mt-7 text-lg text-background/70 leading-relaxed mx-auto max-w-xl">
              {section.description}
            </p>
            {section.cta && (
              <div className="mt-10 flex justify-center">
                <MagneticButton as="a" href={section.cta.href} strength={0.45}>
                  <span className="inline-flex h-14 items-center bg-accent px-10 text-[12px] uppercase tracking-[0.22em] text-foreground transition-colors duration-500 hover:bg-background">
                    {section.cta.label}
                  </span>
                </MagneticButton>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function LoadingScreen({ progress, visible }: { progress: number; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0c0c0c] text-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }}
        >
          <p className="font-display text-3xl md:text-5xl tracking-tight">Dream Home Builders</p>
          <p className="mt-3 text-[11px] uppercase tracking-[0.35em] text-background/50">
            Preparing cinematic walkthrough
          </p>
          <div className="mt-12 h-px w-48 overflow-hidden bg-background/15">
            <div
              className="h-full origin-left bg-accent transition-transform duration-300 ease-out"
              style={{ transform: `scaleX(${Math.max(0.04, progress)})` }}
            />
          </div>
          <p className="mt-4 text-[11px] tracking-[0.2em] text-background/40">
            {Math.round(progress * 100)}%
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function applyOverlayFade(el: HTMLDivElement | null, local: number) {
  if (!el) return
  let opacity = 1
  if (local < 0.04) opacity = 0.55 + (local / 0.04) * 0.45
  else if (local > 0.92) opacity = Math.max(0.35, (1 - local) / 0.08)
  el.style.opacity = String(opacity)
}

function safeTime(duration: number, local: number) {
  if (!Number.isFinite(duration) || duration <= 0) return 0.001
  const max = Math.max(duration - 0.05, 0.001)
  return Math.min(Math.max(local, 0), 1) * max
}

async function unlockVideo(video: HTMLVideoElement) {
  video.muted = true
  video.playsInline = true
  try {
    await video.play()
  } catch {
    /* muted autoplay */
  }
  video.pause()
  try {
    if (!video.seeking) video.currentTime = 0.001
  } catch {
    /* ignore */
  }
  await new Promise<void>((resolve) => {
    if (video.readyState >= 2) {
      resolve()
      return
    }
    const done = () => resolve()
    video.addEventListener('loadeddata', done, { once: true })
    video.addEventListener('seeked', done, { once: true })
    window.setTimeout(done, 2500)
  })
}

const pendingSeek = new WeakMap<HTMLVideoElement, number>()

function flushPendingSeek(video: HTMLVideoElement) {
  const next = pendingSeek.get(video)
  if (next == null) return
  pendingSeek.delete(video)
  seekVideo(video, next, 0.02)
}

function ensureSeekListener(video: HTMLVideoElement) {
  if (video.dataset.seekHooked === '1') return
  video.dataset.seekHooked = '1'
  video.addEventListener('seeked', () => flushPendingSeek(video))
}

function seekVideo(video: HTMLVideoElement, time: number, minDelta = 0.04) {
  if (!Number.isFinite(video.duration) || video.duration <= 0) return
  if (video.readyState < 2) return
  const desired = Math.min(Math.max(time, 0.001), Math.max(video.duration - 0.05, 0.001))
  if (Math.abs(video.currentTime - desired) < minDelta) return
  ensureSeekListener(video)
  if (video.seeking) {
    pendingSeek.set(video, desired)
    return
  }
  try {
    video.currentTime = desired
  } catch {
    /* ignore */
  }
}

export function VideoScrollSequence({
  videos,
  scrollVhPerSection = 300,
  objectFit = 'cover',
  preloadStrategy = 'adjacent',
  className,
  onReady,
  onSectionChange,
}: VideoScrollSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const fadeRef = useRef<HTMLDivElement | null>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<ScrollTrigger | null>(null)

  /** Continuous 0→N timeline driven directly by ScrollTrigger progress */
  const unitRef = useRef(0)
  const activeIndexRef = useRef(0)
  const readyRef = useRef(false)
  const contentVisibleRef = useRef(false)
  const lastUiIndexRef = useRef(-1)
  const lastSeekMsRef = useRef(0)
  const overlayWrapRef = useRef<HTMLDivElement | null>(null)
  const warmedRef = useRef<Set<number>>(new Set())

  const [ready, setReady] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [contentVisible, setContentVisible] = useState(false)

  const reduced = usePrefersReducedMotion()

  const setVisibleVideo = (index: number) => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return
      const on = i === index
      video.style.opacity = on ? '1' : '0'
      video.style.zIndex = on ? '2' : '1'
    })
  }

  const syncUnit = (unit: number) => {
    const count = videos.length
    unitRef.current = Math.min(Math.max(unit, 0), count - 0.0001)
  }

  const applyUnitToVideos = (unitRaw: number, force = false) => {
    const count = videos.length
    const unit = Math.min(Math.max(unitRaw, 0), count - 0.0001)
    unitRef.current = unit
    const index = Math.min(Math.floor(unit), count - 1)
    const local = unit - index
    const video = videoRefs.current[index]

    if (index !== activeIndexRef.current) {
      const prev = activeIndexRef.current
      const prevVideo = videoRefs.current[prev]
      const nextVideo = videoRefs.current[index]

      if (nextVideo && Number.isFinite(nextVideo.duration)) {
        const seam = index > prev ? 0.001 : safeTime(nextVideo.duration, 0.999)
        seekVideo(nextVideo, seam, 0.02)
      }

      setVisibleVideo(index)
      if (prevVideo && prev !== index) prevVideo.style.opacity = '0'

      activeIndexRef.current = index
      if (lastUiIndexRef.current !== index) {
        lastUiIndexRef.current = index
        setActiveIndex(index)
        onSectionChange?.(index)
      }

      ;[index + 1, index - 1].forEach((neighbor) => {
        const clip = videoRefs.current[neighbor]
        if (!clip || warmedRef.current.has(neighbor)) return
        warmedRef.current.add(neighbor)
        clip.preload = 'auto'
        void unlockVideo(clip)
      })
    }

    // ~30fps seek cadence + queued seeks while decoder is busy
    const now = performance.now()
    if (video && (force || now - lastSeekMsRef.current > 32)) {
      lastSeekMsRef.current = now
      seekVideo(video, safeTime(video.duration || 1, local), 0.05)
    }

    applyOverlayFade(fadeRef.current, local)

    const overall = unit / count
    if (progressBarRef.current) progressBarRef.current.style.width = `${overall * 100}%`
    if (counterRef.current) {
      counterRef.current.textContent = `Scroll to explore · ${String(index + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}`
    }
  }

  const skipWalkthrough = () => {
    const count = videos.length
    syncUnit(count - 0.0001)
    applyUnitToVideos(count - 0.0001, true)

    const about = document.getElementById('about')
    if (about) {
      about.scrollIntoView({ behavior: 'smooth' })
      return
    }
    const st = triggerRef.current
    if (st) window.scrollTo({ top: st.end + 40, behavior: 'smooth' })
  }

  // Preload
  useEffect(() => {
    let cancelled = false
    const vids = videoRefs.current.filter(Boolean) as HTMLVideoElement[]
    if (!vids.length) return

    vids.forEach((video, i) => {
      video.muted = true
      video.playsInline = true
      video.preload = i === 0 ? 'auto' : 'metadata'
      video.pause()
    })

    const boot = async () => {
      setLoadProgress(0.2)
      const first = vids[0]
      if (first) {
        await new Promise<void>((resolve) => {
          if (first.readyState >= 2) resolve()
          else {
            first.addEventListener('loadeddata', () => resolve(), { once: true })
            first.addEventListener('canplay', () => resolve(), { once: true })
            window.setTimeout(() => resolve(), 8000)
          }
        })
        if (cancelled) return
        setLoadProgress(0.55)
        await unlockVideo(first)
        warmedRef.current.add(0)
        if (cancelled) return
        setVisibleVideo(0)
        setLoadProgress(0.85)
      }

      // Always begin the cinematic sequence at frame 0 / scroll 0
      unitRef.current = 0
      activeIndexRef.current = 0
      lastUiIndexRef.current = 0
      contentVisibleRef.current = false
      setContentVisible(false)
      setActiveIndex(0)
      setVisibleVideo(0)
      if (first) seekVideo(first, 0.001, 0)

      if (!hasDeepLinkHash()) {
        window.scrollTo(0, 0)
      }

      if (!readyRef.current) {
        readyRef.current = true
        setReady(true)
        setLoadProgress(1)
        onReady?.()
      }

      // Only warm the next clip — loading all 7 at once stalls scrubbing on Azure
      const second = vids[1]
      if (second) {
        window.setTimeout(() => {
          if (cancelled || warmedRef.current.has(1)) return
          warmedRef.current.add(1)
          void unlockVideo(second)
          second.style.opacity = '0'
        }, 400)
      }
    }

    void boot()

    const timeout = window.setTimeout(() => {
      if (cancelled || readyRef.current) return
      readyRef.current = true
      setReady(true)
      setLoadProgress(1)
      onReady?.()
      setVisibleVideo(0)
    }, 12000)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [videos, preloadStrategy, onReady])

  // ScrollTrigger scrub lag is the only smoother — no extra lerp lag
  useEffect(() => {
    if (!ready || !containerRef.current || !pinRef.current || reduced) return

    const count = videos.length

    unitRef.current = 0
    contentVisibleRef.current = false
    setContentVisible(false)
    setActiveIndex(0)
    setVisibleVideo(0)
    if (!hasDeepLinkHash()) {
      window.scrollTo(0, 0)
    }

    const applyProgress = (progress: number, forceSnap = false) => {
      const unit = progress * count

      const show = progress > 0.012
      if (contentVisibleRef.current !== show) {
        contentVisibleRef.current = show
        setContentVisible(show)
      }

      applyUnitToVideos(unit, forceSnap)
    }

    const ctx = gsap.context(() => {
      triggerRef.current = ScrollTrigger.create({
        id: 'walkthrough-sequence',
        trigger: containerRef.current,
        pin: pinRef.current,
        // Single smoothing source (~0.65s catch-up) — feels glued to the wheel
        scrub: 0.65,
        pinSpacing: true,
        start: 'top top',
        end: () => `+=${Math.round(count * window.innerHeight * (scrollVhPerSection / 100))}`,
        invalidateOnRefresh: true,
        fastScrollEnd: true,
        onUpdate: (self) => {
          applyProgress(self.progress)
        },
        onEnterBack: (self) => {
          applyProgress(self.progress, true)
        },
        onEnter: (self) => {
          applyProgress(self.progress, true)
        },
        onRefresh: (self) => {
          applyProgress(self.progress, true)
        },
      })
    }, containerRef)

    const refreshId = window.setTimeout(() => {
      if (!hasDeepLinkHash()) {
        window.scrollTo(0, 0)
        unitRef.current = 0
      }
      ScrollTrigger.refresh()
    }, 100)

    const lateRefreshIds = [300, 900, 1800].map((ms) =>
      window.setTimeout(() => ScrollTrigger.refresh(), ms),
    )

    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)

    return () => {
      window.clearTimeout(refreshId)
      lateRefreshIds.forEach((id) => window.clearTimeout(id))
      window.removeEventListener('load', onLoad)
      triggerRef.current = null
      ctx.revert()
    }
  }, [ready, videos.length, scrollVhPerSection, reduced, onSectionChange])

  useEffect(() => {
    if (!reduced || !ready) return
    contentVisibleRef.current = true
    setContentVisible(true)
    applyOverlayFade(fadeRef.current, 0.5)
  }, [reduced, ready])

  useEffect(() => {
    if (!ready || !contentVisible) return
    const wrap = overlayWrapRef.current
    if (wrap) {
      wrap.style.transition = 'none'
      wrap.style.opacity = '0'
      wrap.style.transform = 'translate3d(0, 12px, 0)'
      // Force reflow then ease in — cheaper than Framer AnimatePresence
      void wrap.offsetHeight
      wrap.style.transition =
        'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      wrap.style.opacity = '1'
      wrap.style.transform = 'translate3d(0, 0, 0)'
    }
    const id = window.requestAnimationFrame(() => applyOverlayFade(fadeRef.current, 0.3))
    return () => window.cancelAnimationFrame(id)
  }, [activeIndex, ready, contentVisible])

  return (
    <>
      <LoadingScreen progress={loadProgress} visible={!ready} />

      <section
        ref={containerRef}
        id="walkthrough"
        className={cn('relative bg-[#0c0c0c]', className)}
        aria-label="Cinematic home walkthrough"
      >
        <h1 className="sr-only">
          Dream Home Builders — custom home construction across New Jersey
        </h1>
        <div ref={pinRef} className="relative h-screen w-full overflow-hidden bg-[#0c0c0c]">
          <div className="absolute inset-0 bg-[#121212]">
            {videos.map((section, i) => (
              <video
                key={`${section.id}-smooth`}
                ref={(el) => {
                  videoRefs.current[i] = el
                }}
                src={section.src}
                className="absolute inset-0 h-full w-full will-change-[opacity]"
                style={{
                  objectFit,
                  opacity: i === 0 ? 1 : 0,
                  zIndex: i === 0 ? 2 : 1,
                  transform: 'translateZ(0)',
                  backgroundColor: '#121212',
                }}
                muted
                playsInline
                preload={i === 0 ? 'auto' : 'metadata'}
                disablePictureInPicture
                controls={false}
                tabIndex={-1}
                aria-hidden={i !== activeIndex}
              />
            ))}

            <div className="pointer-events-none absolute inset-0 z-[4] bg-gradient-to-b from-black/35 via-black/10 to-black/45" />
            <div className="pointer-events-none absolute inset-0 z-[4] bg-gradient-to-r from-black/25 via-transparent to-black/15" />
          </div>

          <div
            ref={overlayWrapRef}
            className="absolute inset-0 z-10 will-change-[opacity,transform]"
            style={{
              opacity: contentVisible ? 1 : 0,
              pointerEvents: contentVisible ? 'auto' : 'none',
              transform: 'translate3d(0, 0, 0)',
            }}
          >
            {videos[activeIndex] && (
              <OverlayContent section={videos[activeIndex]} fadeRef={fadeRef} />
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-20 h-[2px] bg-background/10">
            <div ref={progressBarRef} className="h-full w-0 bg-accent" />
          </div>

          <div className="absolute bottom-5 left-0 right-0 z-20 flex items-center justify-between gap-4 px-5 md:px-10">
            <div
              ref={counterRef}
              className="text-[10px] uppercase tracking-[0.28em] text-background/45"
            >
              Scroll to explore · 01 / {String(videos.length).padStart(2, '0')}
            </div>

            <button
              type="button"
              onClick={skipWalkthrough}
              className="group inline-flex items-center gap-2 border border-background/25 bg-background/10 px-4 py-2.5 text-[10px] uppercase tracking-[0.22em] text-background/85 backdrop-blur-md transition-all duration-500 hover:border-accent hover:bg-accent hover:text-foreground cursor-pointer"
            >
              Skip Scroll
              <ChevronsDown className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-y-0.5" />
            </button>
          </div>
        </div>

        {reduced && (
          <div className="relative z-10 bg-background px-5 py-24 md:px-10">
            {videos.map((section) => (
              <div key={section.id} className="mb-16 max-w-3xl">
                <p className="text-accent text-[11px] uppercase tracking-[0.3em] mb-3">{section.label}</p>
                <h2 className="font-display text-4xl">{section.title}</h2>
                <p className="mt-4 text-muted">{section.description}</p>
              </div>
            ))}
            <button
              type="button"
              onClick={skipWalkthrough}
              className="mt-4 text-sm uppercase tracking-[0.2em] text-accent"
            >
              Continue to site
            </button>
          </div>
        )}
      </section>
    </>
  )
}
