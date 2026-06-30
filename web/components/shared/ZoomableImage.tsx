"use client";

import Image from "next/image";
import { useLightbox } from "./ImageLightbox";

type ZoomableImageProps = {
  src: string;
  alt: string;
  className?: string;
};

const zoomableImageClass =
  "block max-w-full p-0 border-none bg-transparent cursor-zoom-in text-left hover:[&_img]:border-daf-head/45 hover:[&_img]:shadow-daf-ring-image";

const zoomableImageImgClass =
  "block max-w-full h-auto border border-daf-border rounded transition-[border-color,box-shadow] duration-150";

export default function ZoomableImage({
  src,
  alt,
  className = "",
}: ZoomableImageProps) {
  const { openLightbox } = useLightbox();

  return (
    <button
      type="button"
      className={`${zoomableImageClass} ${className}`.trim()}
      aria-label={alt}
      onClick={() => openLightbox(src, alt)}
    >
      <Image
        src={src}
        alt={alt}
        width={800}
        height={600}
        sizes="(max-width: 44rem) 100vw, 44rem"
        className={zoomableImageImgClass}
        style={{ width: "100%", height: "auto" }}
      />
    </button>
  );
}
