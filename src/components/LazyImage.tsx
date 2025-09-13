import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const LazyImage = ({
  src,
  alt,
  width,
  height,
  className,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}) => {
  return (
    <LazyLoadImage
      effect="blur"
      height={height}
      width={width}
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
};

export default LazyImage;
