  "use client";

import useUnlockGuard from "@/hooks/useUnlockGuard";
import PageTransition from "@/components/common/PageTransition";
import SectionHeading from "@/components/common/SectionHeading";
import PolaroidGallery from "@/components/gallery/PolaroidGallery";

function Game() {
  return (
    <PageTransition className="flex flex-col items-center px-4 pb-16 pt-16">
      <SectionHeading
        title="Our Memories"
        subtitle="A few of my favorite frames of us 🤍"
        className="mb-8"
      />
      <PolaroidGallery />
    </PageTransition>
  );
}

export default function GamePage() {
  const allowed = useUnlockGuard();
  if (!allowed) return null;
  return <Game />;
}
