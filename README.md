# Kuyilu Birthday Website 🤍

A private, story-driven birthday surprise for Lincy ("Kuyilu"), built with Next.js, Tailwind and Framer Motion.
Black and gold, little golden bird, mobile-first.

**Journey:** music popup → countdown lock → welcome → "Things I Love About You" quiz (emailed to you) → Our Story flipbook → Catch the Hearts game → final letter with envelope, sparkle heart, confetti and birthday cake.

---

## 1. Run it

Requires Node 18+.

```bash
npm install
cp .env.example .env.local     # then fill it in (see section 3)
npm run dev                    # http://localhost:3000
```

**Test the whole journey without waiting for the countdown:** set `NEXT_PUBLIC_DEV_UNLOCK=true` in `.env.local` and restart `npm run dev`. Set it back to `false` before you deploy.

Production check: `npm run build && npm start`.

---

## 2. What to replace (all placeholders are marked)

| What | Where |
|---|---|
| Birthday date and time (IST) | `src/config/site.js` → `birthdayISO` (currently `2026-12-31T00:00:00+05:30`) |
| Background song | replace `public/music/background.mp3` (the included file is 3 seconds of silence) |
| Our Story PDF | replace `public/story/our-story.pdf` (the included file is a 6-page sample) |
| Quiz questions, options, sweet replies | `src/data/quizData.js` (the only place quiz content lives) |
| Final letter text | `src/data/letterText.js` |
| Welcome intro lines | `INTRO` array at the top of `src/app/welcome/page.js` |
| Names | `src/config/site.js` (never hardcoded elsewhere) |
| Photos | `public/images/gallery/` (not used by a page yet; placeholders included) |
| Link preview image | `public/images/og-image.jpg` (1200x630) |
| Game round length | `src/config/site.js` → `gameSeconds` |

Tips:
- **PDF:** any page size works; pages are drawn into the flipbook at their own aspect ratio. A portrait PDF (A5 or similar) looks best. If the PDF is missing or broken, she sees a friendly "Our story is still being written" card instead of an error.
- **Music:** use an MP3 under ~5 MB so it starts quickly on mobile data.
- **Quiz:** every option needs a matching key in `responses`. Add or remove questions freely; the hearts progress bar adapts. Keep 4 options per question for the best layout.

---

## 3. EmailJS setup (free plan, 200 emails/month)

The quiz sends **one** email when she finishes (not one per question).

1. Create an account at emailjs.com and add an **Email Service** (Gmail works well).
2. Create an **Email Template**. Set the **To email** to your own address. Use these variables:
   - Subject: `{{subject}}` (sends as "Kuyilu finished the quiz 💛")
   - Body, for example:
     ```html
     <p>Hi {{to_name}},</p>
     <p>{{her_name}} just finished the quiz at {{time}}.</p>
     <div style="white-space: pre-line">{{answers}}</div>
     ```
     The `white-space: pre-line` keeps each question on its own line.
   - Also available: `{{her_name}}`, `{{time}}`.
3. Put the three IDs in `.env.local`:

```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=
NEXT_PUBLIC_DEV_UNLOCK=false
```

4. **Protect the public key.** It is visible in the browser by design. In the EmailJS dashboard, go to *Account → Security* and restrict it to your site's domain (your Vercel domain and, while testing, `localhost`). Turn on the request limit too.

If sending fails, the site retries once silently and she never sees an error. If the env vars are missing, nothing is sent (a warning appears in the browser console only).

---

## 4. Deploy to Vercel

1. Push this folder to a GitHub repository (`.env.local` is git-ignored, so no secrets are committed).
2. On vercel.com choose **Add New → Project**, import the repo, keep the defaults (framework: Next.js).
3. Under **Environment Variables** add the four variables from section 3 (keep `NEXT_PUBLIC_DEV_UNLOCK` as `false`). Optionally add `NEXT_PUBLIC_SITE_URL` with your final `https://…` address so the link preview image resolves correctly.
4. Deploy. Open the link on a phone, and test once with `NEXT_PUBLIC_DEV_UNLOCK=true` in a **Preview** deployment if you want to check the full journey online.
5. Before her birthday, make sure `birthdayISO` is the exact moment you want it to unlock.

---

## 5. How it behaves

- **Music** starts only after she taps "Yes 🎵" (browsers require a tap). The choice is remembered for the session, a mute button is on every page, and music pauses when the tab is hidden.
- **Lock screen:** until `birthdayISO`, `/welcome`, `/quiz`, `/story`, `/game` and `/letter` send visitors back to `/`. At zero the bird flies away and **Open** appears. If the date has already passed, Open shows immediately.
- **Letter:** lines appear one by one at a reading pace; she taps "One more thing 🤍" to continue to the sparkle heart and the cake. The candle blows out with a tap (the microphone is optional).
- **Accessibility:** respects "reduce motion", 44px+ touch targets, no horizontal scroll at 360px.
- **Privacy:** `robots: noindex`, no analytics, no backend.

## 6. Project structure

```
src/
  app/            one folder per page (/, welcome, quiz, story, game, letter) + layout, theme.css, globals.css
  components/     common, music, effects, bird, lock, quiz, story, game, letter
  config/site.js  names, birthday, routes
  data/           quizData.js, letterText.js
  context/        MusicContext.js (Howler)
  hooks/          useCountdown.js, useUnlockGuard.js
  lib/emailjs.js  sendQuizResults()
public/           images, music, story PDF, pdf.worker.min.js
```

Notes:
- Fonts (Playfair Display, Great Vibes, Poppins) come from the `@fontsource` packages, so they are bundled with the site and need no request to Google.
- `public/pdf.worker.min.js` is the pdf.js worker, copied from `pdfjs-dist@3.11.174`. If you ever change that version, copy the matching worker file again from `node_modules/pdfjs-dist/build/`.
