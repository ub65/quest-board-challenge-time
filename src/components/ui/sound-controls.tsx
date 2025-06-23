import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useLocalization } from '@/contexts/LocalizationContext';
import { soundManager } from '@/lib/soundManager';

type SoundControlsProps = {
  soundEnabled: boolean;
  onSoundEnabledChange: (enabled: boolean) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
};

export const SoundControls: React.FC<SoundControlsProps> = ({
  soundEnabled,
  onSoundEnabledChange,
  volume,
  onVolumeChange,
}) => {
  const { t } = useLocalization();

  const handleSoundToggle = (enabled: boolean) => {
    console.log('Sound toggle clicked:', enabled);
    onSoundEnabledChange(enabled);
  };

  const handleVolumeChange = (newVolume: number) => {
    console.log('Volume changed:', newVolume);
    onVolumeChange(newVolume);
  };

  const testSound = () => {
    console.log('Testing sound...');
    soundManager.test();
  };

  return (
    <div className="flex flex-col gap-4">

      <div className="flex items-center justify-between">
        <Label htmlFor="sound-enabled" className="text-base font-semibold flex items-center gap-2">
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          {t('settings.sound')}
        </Label>
       
          <Switch
            id="sound-enabled"
            checked={soundEnabled}
            onCheckedChange={handleSoundToggle}
          />
        </div>
      {soundEnabled && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="volume-slider" className="text-base font-semibold flex justify-between">
            <span>{t('settings.volume')}</span>
            <span className="text-primary">{Math.round(volume * 100)}%</span>
          </Label>
          <Slider
            id="volume-slider"
            min={0}
            max={1}
            step={0.1}
            value={[volume]}
            onValueChange={([val]) => handleVolumeChange(val)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{t('settings.volumeMin')}</span>
            <span>{t('settings.volumeMax')}</span>
          </div>
        </div>
      )}
    </div>
  );
};