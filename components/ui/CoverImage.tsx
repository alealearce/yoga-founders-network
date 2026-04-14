"use client";

import { useState } from "react";
import YogaSilhouette from "@/components/ui/YogaSilhouette";

interface CoverImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function CoverImage({ src, alt, className = "w-full h-full object-cover" }: CoverImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-surface-low">
        <YogaSilhouette pose="tree" size={64} color="#d0d0d0" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
