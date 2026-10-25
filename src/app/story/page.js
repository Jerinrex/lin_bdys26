"use client";

import dynamic from "next/dynamic";
import { ROUTES } from "@/config/site";
import useUnlockGuard from "@/hooks/useUnlockGuard";
import PageTransition from "@/components/common/PageTransition";
import SectionHeading from "@/components/common/SectionHeading";
import Button from "@/components/common/Button";
import GoldenBird from "@/components/bird/GoldenBird";

// The flipbook (react-pageflip + pdf.js) is heavy: load it only here, only in the browser.
const FlipBook = dynamic(() => import("@/components/story/FlipBook"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center py-16">
      <GoldenBird mode="fly" size={96} />
    </div>
  ),
});

function Story() {
  return (
    <PageTransition className="flex flex-col items-center px-4 pb-14 pt-16">
      <SectionHeading title="Our Story" subtitle="Every page, a little piece of us" className="mb-6" />
      <div className="w-full max-w-5xl">
        <FlipBook />
      </div>
      <div className="mt-8">
        <Button href={ROUTES.gallery}>Our Memories 📸</Button>
      </div>
    </PageTransition>
  );
}

export default function StoryPage() {
  const allowed = useUnlockGuard();
  if (!allowed) return null;
  return <Story />;
}
