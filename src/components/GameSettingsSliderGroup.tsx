
import React from "react";
import GameSettingsSlider from "./GameSettingsSlider";

type SliderConfig = {
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

type Props = {
  sliders: SliderConfig[];
};

const GameSettingsSliderGroup = ({ sliders }: Props) => {
  return (
    <div className="flex flex-col gap-7">
      {sliders.map((slider) => (
        <GameSettingsSlider key={slider.id} {...slider} />
      ))}
    </div>
  );
};

export default GameSettingsSliderGroup;
