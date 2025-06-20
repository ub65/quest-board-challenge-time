
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
    <>
      <GameSettingsSoundToggle 
        soundEnabled={soundEnabled} 
        onSoundChange={onSoundChange} 
      />
      <GameSettingsVolumeSlider 
        volume={volume} 
        onVolumeChange={onVolumeChange} 
        disabled={!soundEnabled}
      />
    </>
  );
};

export default SoundSettings;
