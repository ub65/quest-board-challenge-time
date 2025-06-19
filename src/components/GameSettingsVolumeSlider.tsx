
import React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useLocalization } from "@/contexts/LocalizationContext";
import { Volume, Volume1, Volume2, VolumeOff } from "lucide-react";

type Props = {
  volume: number;
  onVolumeChange: (v: number) => void;
  disabled?: boolean;
};

const GameSettingsVolumeSlider = ({ volume, onVolumeChange, disabled = false }: Props) => {
  const { t } = useLocalization();

  const getVolumeIcon = () => {
    if (disabled || volume === 0) return VolumeOff;
    if (volume < 0.33) return Volume;
    if (volume < 0.66) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();
  const displayVolume = Math.round(volume * 100);

  return (
    <div className={`flex flex-col gap-2 py-2 pointer-events-auto relative z-10 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <Label 
        htmlFor="volume-slider" 
        className="text-base font-semibold select-none flex justify-between items-center pointer-events-auto"
      >
        <div className="flex items-center gap-2">
          <VolumeIcon size={18} />
          <span>{t('settings.volume') || 'Volume'}</span>
        </div>
        <span className="text-primary">{displayVolume}%</span>
      </Label>
      <Slider
        id="volume-slider"
        min={0}
        max={1}
        step={0.01}
        value={[volume]}
        onValueChange={([val]) => onVolumeChange(val)}
        className="w-full pointer-events-auto relative z-10"
        disabled={disabled}
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1 pointer-events-none">
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>
  );
};

export default GameSettingsVolumeSlider;
