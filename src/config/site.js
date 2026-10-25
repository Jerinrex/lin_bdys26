// Single source of truth for names, dates and routes.
// Never hardcode these in components: import { SITE } from "@/config/site".
export const SITE = {
  herName: "Lincy",
  petName: "Kuyilu", // "little bird" in Tamil
  petNames: ["Kuyilu", "my girl", "Mailu"],
  senderName: "Jerin",

  // PLACEHOLDER: set the real birthday date/time (IST)
  birthdayISO: "2026-12-31T00:00:00+05:30",
  timezone: "Asia/Kolkata",

  // Music playlist: plays in sequence and loops
  playlist: [
    "/music/Rathinamo (Female Version)(KoshalWorld.Com).mp3",
    "/music/The_Love_Bug_Has_Bitten_-_Anirudh_Ravichander.mp3",
    "/music/Happy_Birthday_-_Anirudh_Ravichander.mp3",
  ],
  musicSrc: "/music/Rathinamo (Female Version)(KoshalWorld.Com).mp3",
  storyPdf: "/story/our-story.pdf",
  pdfWorkerSrc: "/pdf.worker.min.js",

  // Mini game round length (seconds)
  gameSeconds: 40,

  // Set to a number (e.g. 5) to count down 5 -> 1 on page load. Set to null to use real birthdayISO.
  countdownSeconds: 5,

  // Testing only: set NEXT_PUBLIC_DEV_UNLOCK=true to skip the countdown
  devUnlock: process.env.NEXT_PUBLIC_DEV_UNLOCK === "true",
};

export const ROUTES = {
  lock: "/",
  welcome: "/welcome",
  quiz: "/quiz",
  story: "/story",
  gallery: "/gallery",
  game: "/gallery",
  letter: "/letter",
};
