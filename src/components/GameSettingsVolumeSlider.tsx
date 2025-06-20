
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

  const handleVolumeChange = (values: number[]) => {
    console.log("Volume slider changed:", values[0]);
    onVolumeChange(values[0]);
  };

  return (
    <div className={`flex flex-col gap-3 py-2 ${disabled ? 'opacity-50' : ''}`}>
      <Label 
        htmlFor="volume-slider" 
        className="text-base font-medium select-none flex justify-between items-center"
      >
        <div className="flex items-center gap-2">
          <VolumeIcon size={18} />
          <span>{t('settings.volume') || 'Volume'}</span>
        </div>
        <span className="text-primary font-semibold">{displayVolume}%</span>
      </Label>
      <div className="w-full">
        <Slider
          id="volume-slider"
          min={0}
          max={1}
          step={0.01}
          value={[volume]}
          onValueChange={handleVolumeChange}
          className="w-full"
          disabled={disabled}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1 select-none">
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>
  );
};

export default GameSettingsVolumeSlider;
