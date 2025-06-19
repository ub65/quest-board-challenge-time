
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLocalization } from "@/contexts/LocalizationContext";

type Props = {
  soundEnabled: boolean;
  onSoundChange: (value: boolean) => void;
};

const GameSettingsSoundToggle = ({ soundEnabled, onSoundChange }: Props) => {
  const { t } = useLocalization();
  
  return (
    <div className="flex items-center justify-between gap-4 px-1 py-2 pointer-events-auto">
      <Label 
        htmlFor="sound-toggle" 
        className="text-base cursor-pointer select-none pointer-events-auto"
      >
        {t('settings.sound')}
      </Label>
      <Switch
        id="sound-toggle"
        checked={soundEnabled}
        onCheckedChange={onSoundChange}
        className="scale-110 pointer-events-auto cursor-pointer relative z-10"
      />
    </div>
  );
};

export default GameSettingsSoundToggle;
