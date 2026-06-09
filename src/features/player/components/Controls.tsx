import { useTranslation } from 'react-i18next';
import { IconButton } from '@/components/IconButton';
import {
  NextIcon,
  PauseIcon,
  PlayIcon,
  PrevIcon,
  RepeatIcon,
  RepeatOneIcon,
  ShuffleIcon,
} from '@/components/icons';
import { usePlayerStore } from '@/store/usePlayerStore';

export function Controls() {
  const { t } = useTranslation();
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const repeat = usePlayerStore((s) => s.repeat);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat);

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <IconButton
        label={t('common.shuffle')}
        active={shuffle}
        pressed={shuffle}
        onClick={toggleShuffle}
        size="sm"
      >
        <ShuffleIcon size={18} />
      </IconButton>
      <IconButton label={t('common.previous')} onClick={prev}>
        <PrevIcon size={22} />
      </IconButton>
      <IconButton
        label={t(isPlaying ? 'common.pause' : 'common.play')}
        pressed={isPlaying}
        onClick={togglePlay}
        variant="primary"
        size="lg"
      >
        {isPlaying ? <PauseIcon size={26} /> : <PlayIcon size={26} />}
      </IconButton>
      <IconButton label={t('common.next')} onClick={next}>
        <NextIcon size={22} />
      </IconButton>
      <IconButton
        label={t(repeat === 'one' ? 'common.repeatOne' : 'common.repeat')}
        active={repeat !== 'off'}
        onClick={cycleRepeat}
        size="sm"
      >
        {repeat === 'one' ? <RepeatOneIcon size={18} /> : <RepeatIcon size={18} />}
      </IconButton>
    </div>
  );
}
