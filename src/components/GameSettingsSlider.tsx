
import React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useLocalization } from "@/contexts/LocalizationContext";

type Props = {
  id: string;
  labelKey: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onValueChange: (v: number) => void;
  suffix?: string;
  displayValue?: string;
  minLabelKey?: string;
  maxLabelKey?: string;
};

const GameSettingsSlider = ({
  id,
  labelKey,
  min,
  max,
  step,
  value,
  onValueChange,
  suffix,
  displayValue,
  minLabelKey,
  maxLabelKey,
}: Props) => {
  const { t } = useLocalization();

  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id} className="text-base font-semibold mb-1 select-none flex justify-between">
        <span>{t(labelKey)}</span>
        <span className="text-primary">{displayValue || value}{suffix ? ` ${suffix}` : ""}</span>
      </Label>
      <Slider
        id={id}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([val]) => onValueChange(val)}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{minLabelKey ? t(minLabelKey) : min}</span>
        <span>{maxLabelKey ? t(maxLabelKey) : max}</span>
      </div>
    </div>
  );
};

export default GameSettingsSlider;
