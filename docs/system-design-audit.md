# System design audit

Dream Home Builders is a single-page React + Vite marketing site. Production hosting is Azure Static Web Apps (`public/staticwebapp.config.json`; deploy notes in `src/components/layout/SmoothScroll.tsx`). There is no application server, database, or worker.

The standard in `.cursor/rules/system-design.mdc` says to scale depth to the project. CDN, caching, security, and monitoring matter here. Load balancing, database design, and message queues do not, until a backend exists. This audit does not change application code.

`.cursor/rules/dual-remote-push.mdc` is unchanged and stays in force. It does not contradict the nine areas. Both rules are `alwaysApply: true`. The process tension: that rule pushes finished work straight to GitHub `main` and GitLab `dh-builder-v1`, which skips the review and CI gate the reliability section recommends.

## Priority

| Priority | Fix | Why |
|---|---|---|
| High | Security headers on the static host | Public site posts lead data; no CSP, frame, or MIME headers in repo |
| High | Shrink and fingerprint the hero media | ~47 MB of MP4 plus a 444 KB logo are the first bottleneck |
| High | CI for lint, build, and `npm audit` | Nothing runs tests or audits on push; the form path is untested |
| Medium | Timeouts, error reporting, and Core Web Vitals | Form fetch can hang; no Sentry, uptime check, or RUM |
| Low | `.env.example` for Formspree URLs | Endpoints are public but hardcoded, so staging cannot swap them |

## 1. System architecture

**Applies:** lightly. The site is a client bundle plus static files, not a layered service.

**In place**

- UI sections live under `src/components/`; copy and config live in `src/data/content.ts` and `src/data/walkthrough.ts`.
- The only network call is isolated in `src/lib/formspree.ts`. Forms in `src/components/sections/Contact.tsx` and `Quote.tsx` call that helper.
- UI state (form status, scroll, tabs) stays in the browser. Nothing is stored as server process memory.
- `.gitignore` ignores `.env` and `.env.*`. No secrets are hardcoded. Phone, email, and Formspree URLs in `src/data/content.ts` are public site content.

**Gaps**

- No `.env.example`. Form endpoints are string literals, so a preview deploy cannot point at different forms without a code change.
- No public API, so versioning and boundary validation (zod and similar) do not apply. Browser `required` is the only check.

**Fixes**

- Low: add `.env.example` with `VITE_FORMSPREE_*` placeholders and read them in `siteConfig`. Keep the current URLs as fallbacks only if you want zero behavior change.
- Skip controllers, services, and data-access layers until there is a backend.

## 2. Load balancing

**Does not apply.** There is no app process to health-check, drain, or scale. Azure Static Web Apps terminates TLS and serves files. Sticky sessions, `X-Forwarded-*`, `/health`, and `/ready` would be empty endpoints on a static host.

**In place:** SPA fallback in `public/staticwebapp.config.json` (`navigationFallback` rewrites to `/index.html`).

**Fixes:** none until a custom server or API exists. Do not add a fake `/health` that always returns 200 with no dependencies behind it.

## 3. Caching

**Applies.**

**In place**

- Vite content-hashes built JS and CSS into `/assets/`. `vite.config.ts` splits `gsap`, `framer-motion`, and `lenis` into separate chunks so those libraries can cache independently.
- `public/staticwebapp.config.json` sets `Cache-Control: public, max-age=31536000, immutable` on `/assets/*`.
- Walkthrough videos get `public, max-age=604800` (7 days). Filenames in `src/data/walkthrough.ts` use a manual query (`?v=smooth4`) as a cache bump.

**Gaps**

- `index.html` has no explicit `no-cache`. A long platform default would pin users to an old shell.
- `/logo-dhb.png` (444 KB, `src/components/layout/Navbar.tsx`) and `favicon.svg` are unhashed files under `public/` and have no cache header.
- Video cache busting depends on someone editing the query string. A new encode with the same `?v=` stays stale for up to 7 days.
- No ETag configuration in repo. Acceptable: the host can generate validators; hashed assets do not need them.

**Fixes**

- High: set `cache-control: no-cache` on `/index.html` (and other HTML) in `staticwebapp.config.json`.
- Medium: content-hash video filenames (or bump `?v=` in the same commit as the file) so the 7-day cache is safe.
- Low: long-cache the logo only after it is hashed or renamed on change.

## 4. Database design

**Does not apply.** No database, ORM, or migrations. Portfolio, FAQ, and stats are compile-time arrays in `src/data/content.ts`.

**Fixes:** none. If leads later move into your own store, add migrations, indexes, and pagination then. Do not introduce a database for this brochure site.

## 5. Message queues

**Does not apply.** Contact and quote posts go straight to Formspree (`src/lib/formspree.ts`). That third party sends the email. There is no webhook, report job, or file pipeline of your own.

**In place:** submit buttons disable while `status === 'sending'`, which limits double posts from one click.

**Gaps:** the browser waits on Formspree. A hung request leaves the button disabled with no timeout (`fetch` in `formspree.ts` has no `AbortSignal`).

**Fixes**

- Medium: abort the Formspree `fetch` after a few seconds and show the existing error copy. That is a client timeout, not a queue.
- Skip BullMQ, SQS, or a 202 job API unless you replace Formspree with your own mailer.

## 6. CDN

**Applies.** This is the main delivery path.

**In place**

- Azure Static Web Apps is the CDN in front of the build. Hashed `/assets/*` are marked immutable (see caching).
- `ParallaxImage` defaults to `loading="lazy"` and `decoding="async"` (`src/components/shared/ParallaxImage.tsx`). Several section images set `loading="lazy"` (`CTA.tsx`, `Statistics.tsx`, `WhyUs.tsx`).
- `index.html` preconnects to Google Fonts and requests `display=swap`.
- Walkthrough preload is `adjacent`, not all seven files (`src/components/sections/Walkthrough.tsx`, `VideoScrollSequence.tsx`).
- `staticwebapp.config.json` sets MP4 and WebM MIME types.

**Gaps**

- Seven MP4s under `public/videos/` total about 47 MB (`07-balcony-garage.mp4` alone is 13 MB). No WebM/AVIF sibling, no adaptive streaming. Adjacent preload still pulls multi-megabyte files on first scroll.
- Photography is hotlinked JPEG from `images.unsplash.com` (`src/data/content.ts`, `CTA.tsx`, `Statistics.tsx`, `About.tsx`, `index.html` og:image). No `srcset`, no WebP/AVIF. CTA requests `w=2400`.
- Navbar logo is a 444 KB PNG displayed at 40px (`Navbar.tsx`). It is on the first screen.
- Fonts are a render-blocking stylesheet from `fonts.googleapis.com` (`index.html`), a second origin.
- Compression and HTTP/2 are platform defaults, not declared in the repo. Confirm brotli on the Azure response headers before treating them as done.

**Fixes**

- High: export a small WebP/AVIF (or SVG) logo and stop shipping 444 KB for a 40px mark.
- High: keep MP4s, add a lighter first-slide encode, and postpone later clips until the section is near the viewport. The adjacent strategy is a start; the bytes are still the bottleneck.
- Medium: self-host responsive images (WebP/AVIF + `srcset`) instead of full-size Unsplash URLs, or at least lower `w` and `q` on below-the-fold shots.
- Medium: self-host the two font families, or subset them, so first paint does not wait on Google.
- Low: poster images on `<video>` so the hero has a paint before the MP4 arrives.

## 7. Scalability

**Applies only as static-file scale.** Horizontal app instances, a shared cache, and a queue are not in this design, and they should not be added for current traffic. Azure serves the files. The first bottleneck is hero video weight, not CPU.

**In place**

- Stateless bundle. Formspree is the only outbound dependency.
- Chunk splitting in `vite.config.ts` keeps the animation libraries out of the main graph.

**Gaps**

- No rate limit in front of the three public forms. Abuse protection is whatever Formspree applies; the repo does not document it.
- No request timeout on `fetch` (see queues).
- No body-size limit on the contact textarea (`Contact.tsx`, `Quote.tsx`).

**Fixes**

- Medium: client timeout on Formspree; `maxlength` on text fields.
- Low: note Formspree’s plan limits in the README so a spam spike is an expected bottleneck, not a surprise.
- Skip app-level rate-limit middleware until there is a server. An Azure or Formspree control is enough.

## 8. Reliability and security

**Applies.** The risky surface is small: three lead forms and a public static host. Treat it as such.

**In place**

- Form errors are caught and replaced with a short message (`src/lib/formspree.ts`). Stack traces are not shown.
- HTML `required` / `type="email"` on contact and quote fields.
- Submit buttons disable while a request is in flight.
- `.gitignore` excludes env files. No auth, passwords, or cookies.
- `npm run lint` (oxlint) exists in `package.json`. `README.md` documents install and build.

**Gaps**

- `public/staticwebapp.config.json` sets cache and MIME only. No `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, or frame protection (`X-Frame-Options` or CSP `frame-ancestors`). The contact map is a Google iframe, so frame policy must allow that frame, not every origin framing you.
- No HSTS in repo. Azure may set it; confirm on the live response.
- No automated tests, no `ErrorBoundary`, no CI (no `.github/workflows`). `npm run lint` and `npm run build` are local only. Critical path is the lead form, and it is untested.
- No `npm audit` script and no Dependabot config.
- Formspree failure is a hard failure for the form. Phone and mailto links in the footer are the graceful path, and the error string points at them. Good enough.
- No backup story. Correct: there is no database. Formspree holds the submissions; export/retention is an account setting, not code.

**Fixes**

- High: add `globalHeaders` on the static web app for `nosniff`, a referrer policy, `frame-ancestors 'self'` (or equivalent), and a CSP that allows the script bundle, `formspree.io`, Google Fonts or self-hosted fonts, Unsplash, and the Maps iframe. Tighten it once fonts and images are self-hosted.
- High: GitHub Action that runs `npm ci`, `npm run lint`, `npm run build`, and `npm audit --audit-level=high` on pull requests. Add Dependabot for npm.
- Medium: a small test around `submitFormspree` (success, non-OK, network throw) and a React error boundary so a section crash does not blank the page.
- Low: document that lead retention lives in Formspree, not in this repo.

## 9. Monitoring

**Applies**, in the website sense. Structured server logs, queue depth, and DB health do not.

**In place:** nothing in the repo. No Sentry, analytics, web-vitals hook, or uptime config. `console` is not used as a logger.

**Gaps**

- No client error reporting. A broken walkthrough or a failed form is invisible.
- No Core Web Vitals (LCP, CLS, INP). LCP is likely the hero video or the navbar logo; CLS risk is the font swap and late images.
- No uptime check on `https://dreamhomebuildersnj.com`. A `/health` route is the wrong target (see load balancing); check the public homepage.
- No request id. There is no server log line to correlate. Formspree’s dashboard is the only submission log.

**Fixes**

- Medium: Sentry (or similar) on the React tree, plus a `web-vitals` beacon for LCP/CLS/INP.
- Medium: an external uptime check on the homepage and on a failed-form signal if the error tracker supports it.
- Low: skip pino/winston and RED metrics until a server exists.

## What not to build

A load balancer config, Redis, Postgres, or a job queue would add operational surface this site does not use. Revisit those sections only if leads, accounts, or uploads move into infrastructure you run.
