import clsx from 'clsx';
import { motion } from 'motion/react';
import { resolveAssetUrl } from '@/lib/resolveAssetUrl';

interface AlbumCoverProps {
  /** Either a `gradient:c1,c2` sentinel (M1 mock) or an image URL (M6). */
  cover: string;
  alt: string;
  className?: string;
  /** When set, the cover becomes a Motion shared-layout element (M5 grid↔disc morph). */
  layoutId?: string;
}

function gradientFor(cover: string): string | null {
  if (!cover.startsWith('gradient:')) return null;
  const [c1, c2] = cover.slice('gradient:'.length).split(',');
  return `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.28), transparent 55%), linear-gradient(135deg, ${c1}, ${c2})`;
}

/** Renders an album cover from a gradient sentinel or an image URL. With `layoutId`
 *  it becomes a shared-layout element so it can morph between the library grid and
 *  the turntable disc center. */
export function AlbumCover({ cover, alt, className, layoutId }: AlbumCoverProps) {
  const gradient = gradientFor(cover);
  if (gradient) {
    const style = { backgroundImage: gradient };
    return layoutId ? (
      <motion.div
        layoutId={layoutId}
        role="img"
        aria-label={alt}
        className={clsx('bg-cover bg-center', className)}
        style={style}
      />
    ) : (
      <div
        role="img"
        aria-label={alt}
        className={clsx('bg-cover bg-center', className)}
        style={style}
      />
    );
  }
  // An <img> is a replaced element: with `position:absolute` + `inset` it does NOT
  // stretch to the box the way the gradient <div> does, so it overflows and mis-aligns
  // (e.g. inside the disc's `inset-[34%]` label). Wrap it in the sized box and let the
  // image fill it with object-cover; the layoutId morph rides on the wrapper.
  const src = resolveAssetUrl(cover);
  const img = <img src={src} alt={alt} className="h-full w-full object-cover" />;
  return layoutId ? (
    <motion.div layoutId={layoutId} className={clsx('overflow-hidden', className)}>
      {img}
    </motion.div>
  ) : (
    <div className={clsx('overflow-hidden', className)}>{img}</div>
  );
}
