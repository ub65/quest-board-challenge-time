
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
    <div className="flex items-center justify-between gap-4 px-1">
      <Label htmlFor="sound-toggle" className="text-base cursor-pointer select-none">
        {t('settings.sound')}
      </Label>
      <Switch
        id="sound-toggle"
        checked={soundEnabled}
        onCheckedChange={onSoundChange}
        className="scale-110"
      />
    </div>
  );
};

export default GameSettingsSoundToggle;
