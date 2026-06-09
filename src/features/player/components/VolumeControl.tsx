import { useTranslation } from 'react-i18next';
import { IconButton } from '@/components/IconButton';
import { VolumeIcon, VolumeMuteIcon } from '@/components/icons';
import { Slider } from '@/components/Slider';
import { usePlayerStore } from '@/store/usePlayerStore';

export function VolumeControl() {
  const { t } = useTranslation();
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);

  const effective = isMuted ? 0 : volume;

  return (
    <div className="flex items-center gap-2">
      <IconButton
        label={t(isMuted ? 'common.unmute' : 'common.mute')}
        pressed={isMuted}
        onClick={toggleMute}
        size="sm"
      >
        {effective === 0 ? <VolumeMuteIcon size={18} /> : <VolumeIcon size={18} />}
      </IconButton>
      <Slider
        className="w-24 sm:w-28"
        value={effective}
        max={1}
        step={0.01}
        onChange={setVolume}
        ariaLabel={t('common.volume')}
        ariaValueText={t('a11y.volumePercent', { percent: Math.round(effective * 100) })}
      />
    </div>
  );
}
