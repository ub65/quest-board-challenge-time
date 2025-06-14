
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal } from "lucide-react";

type GameSettingsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  soundEnabled: boolean;
  onSoundChange: (value: boolean) => void;
  boardSize: number;
  onBoardSizeChange: (v: number) => void;
  questionTime: number;
  onQuestionTimeChange: (v: number) => void;
};

const GameSettingsModal = ({
  open,
  onOpenChange,
  soundEnabled,
  onSoundChange,
  boardSize,
  onBoardSizeChange,
  questionTime,
  onQuestionTimeChange,
}: GameSettingsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-background to-secondary p-8 shadow-2xl rounded-2xl border-0 max-w-[420px]">
        <DialogHeader>
          <div className="flex flex-col items-center gap-1 mb-2">
            <SlidersHorizontal size={32} className="text-primary" />
            <DialogTitle className="text-2xl font-bold tracking-tight">
              Game Settings
            </DialogTitle>
            <DialogDescription className="mb-0 text-center">
              Adjust your preferences for sound, board size, and timer.
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="py-2 flex flex-col gap-7">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between gap-4 px-1">
            <Label htmlFor="sound-toggle" className="text-base cursor-pointer select-none">
              Sound Effects
            </Label>
            <Switch
              id="sound-toggle"
              checked={soundEnabled}
              onCheckedChange={onSoundChange}
              className="scale-110"
            />
          </div>
          {/* Board Size Slider */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="board-size-slider" className="text-base font-semibold mb-1 select-none flex justify-between">
              <span>Board Size</span>
              <span className="text-primary">{boardSize}x{boardSize}</span>
            </Label>
            <Slider
              id="board-size-slider"
              min={5}
              max={12}
              step={1}
              value={[boardSize]}
              onValueChange={([val]) => onBoardSizeChange(val)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5x5</span>
              <span>12x12</span>
            </div>
          </div>
          {/* Question Time Slider */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="question-time-slider" className="text-base font-semibold mb-1 select-none flex justify-between">
              <span>Question Time</span>
              <span className="text-primary">{questionTime} s</span>
            </Label>
            <Slider
              id="question-time-slider"
              min={6}
              max={40}
              step={1}
              value={[questionTime]}
              onValueChange={([val]) => onQuestionTimeChange(val)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>6s</span>
              <span>40s</span>
            </div>
          </div>
        </div>
        <DialogFooter className="pt-2">
          <DialogClose asChild>
            <button className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 font-semibold text-base transition-colors w-full shadow">
              Close
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GameSettingsModal;
