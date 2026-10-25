"use client";

import MusicPopup from "@/components/music/MusicPopup";
import Countdown from "@/components/lock/Countdown";
import PageTransition from "@/components/common/PageTransition";
import { useMusic } from "@/context/MusicContext";

// Step A: music popup (over the blurred lock screen). Step B: lock / countdown.
export default function LockPage() {
  const { choice, hydrated } = useMusic();
  const blurred = !hydrated || choice === null;

  return (
    <PageTransition>
      <div className={`transition-[filter] duration-700 ${blurred ? "blur-sm brightness-50" : ""}`}>
        <Countdown active={!blurred} />
      </div>
      <MusicPopup />
    </PageTransition>
  );
}
