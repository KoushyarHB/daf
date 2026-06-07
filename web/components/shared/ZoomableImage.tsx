"use client";

import Image from "next/image";
import { useLightbox } from "./ImageLightbox";

type ZoomableImageProps = {
  src: string;
  alt: string;
  className?: string;
};

export default function ZoomableImage({
  src,
  alt,
  className = "",
}: ZoomableImageProps) {
  const { openLightbox } = useLightbox();

  return (
    <button
      type="button"
      className={`zoomable-image ${className}`.trim()}
      aria-label={alt}
      onClick={() => openLightbox(src, alt)}
    >
      <Image
        src={src}
        alt={alt}
        width={800}
        height={600}
        sizes="(max-width: 44rem) 100vw, 44rem"
        className="zoomable-image-img"
        style={{ width: "100%", height: "auto" }}
      />
    </button>
  );
}
