import clsx from 'clsx';

interface AlbumCoverProps {
  /** Either a `gradient:c1,c2` sentinel (M1 mock) or an image URL (M6). */
  cover: string;
  alt: string;
  className?: string;
}

function gradientFor(cover: string): string | null {
  if (!cover.startsWith('gradient:')) return null;
  const [c1, c2] = cover.slice('gradient:'.length).split(',');
  return `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.28), transparent 55%), linear-gradient(135deg, ${c1}, ${c2})`;
}

/** Renders an album cover from a gradient sentinel or an image URL. */
export function AlbumCover({ cover, alt, className }: AlbumCoverProps) {
  const gradient = gradientFor(cover);
  if (gradient) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={clsx('bg-cover bg-center', className)}
        style={{ backgroundImage: gradient }}
      />
    );
  }
  return <img src={cover} alt={alt} className={clsx('object-cover', className)} />;
}
