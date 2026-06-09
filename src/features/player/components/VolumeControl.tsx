import { IconButton } from '@/components/IconButton';
import { VolumeIcon, VolumeMuteIcon } from '@/components/icons';
import { Slider } from '@/components/Slider';
import { usePlayerStore } from '@/store/usePlayerStore';

export function VolumeControl() {
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);

  const effective = isMuted ? 0 : volume;

  return (
    <div className="flex items-center gap-2">
      <IconButton
        label={isMuted ? 'Unmute' : 'Mute'}
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
        ariaLabel="Volume"
        ariaValueText={`${Math.round(effective * 100)} percent`}
      />
    </div>
  );
}
