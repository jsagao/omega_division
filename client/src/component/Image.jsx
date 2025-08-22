// Image.jsx
export default function Image({
    src,
    alt = "",
    className = "",
    width,
    height,
    loading = "lazy",
    ...rest
  }) {
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