"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/config/site";

const INITIAL = { ready: false, done: false, days: 0, hours: 0, minutes: 0, seconds: 0 };

function compute(targetMs) {
  const diff = targetMs - Date.now();
  if (Number.isNaN(diff) || diff <= 0) {
    return { ready: true, done: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const total = Math.ceil(diff / 1000);
  return {
    ready: true,
    done: false,
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

// Counts down to an ISO date string or initial seconds. `ready` is false until mounted (avoids hydration mismatch).
export default function useCountdown(targetISO, { disabled = false } = {}) {
  const [state, setState] = useState(INITIAL);

  useEffect(() => {
    if (disabled) {
      setState({ ready: true, done: true, days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }
    const target = SITE.countdownSeconds
      ? Date.now() + SITE.countdownSeconds * 1000
      : new Date(targetISO).getTime();

    const tick = () => setState(compute(target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetISO, disabled]);

  return state;
}
