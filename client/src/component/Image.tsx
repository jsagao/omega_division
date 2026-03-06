// Image.tsx
import React from "react";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  loading?: "lazy" | "eager";
  w?: string;
  h?: string;
}

export default function Image({
    src,
    alt = "",
    className = "",
    width,
    height,
    loading = "lazy",
    ...rest
  }: ImageProps): React.ReactElement {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        {...rest}
      />
    );
  }
