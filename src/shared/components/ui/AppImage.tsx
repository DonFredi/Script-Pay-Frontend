"use client";
import Image from "next/image";
import { useState } from "react";

type ImgProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fallback?: string;
};

export default function AppImage({
  src,
  alt,
  className,
  priority,
  fallback = "/images/fallback.png",
}: ImgProps) {
  const [imgSrc, setImageSrc] = useState(src);
  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      priority={priority}
      className={className}
      sizes="(max-width:768px) 100vw, 50vw"
      onError={() => setImageSrc(fallback)}
    />
  );
}
