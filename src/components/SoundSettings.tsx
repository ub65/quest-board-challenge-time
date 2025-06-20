
import React from "react";
import GameSettingsSoundToggle from "./GameSettingsSoundToggle";
import GameSettingsVolumeSlider from "./GameSettingsVolumeSlider";

type Props = {
  soundEnabled: boolean;
  onSoundChange: (value: boolean) => void;
  volume: number;
  onVolumeChange: (v: number) => void;
};

const SoundSettings = ({ soundEnabled, onSoundChange, volume, onVolumeChange }: Props) => {
  return (
    <div className="flex flex-col gap-4 pointer-events-auto">
      <GameSettingsSoundToggle 
        soundEnabled={soundEnabled} 
        onSoundChange={onSoundChange} 
      />
      <GameSettingsVolumeSlider 
        volume={volume} 
        onVolumeChange={onVolumeChange} 
        disabled={!soundEnabled}
      />
    </div>
  );
};

export default SoundSettings;
