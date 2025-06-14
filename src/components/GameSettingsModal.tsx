
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
import { Input } from "@/components/ui/input";

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Game Settings</DialogTitle>
          <DialogDescription>
            Adjust game settings below.
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 flex flex-col gap-6 text-center text-gray-600">
          <div className="flex items-center justify-center gap-4">
            <Label htmlFor="sound-toggle" className="text-base cursor-pointer">
              Sound Effects
            </Label>
            <Switch
              id="sound-toggle"
              checked={soundEnabled}
              onCheckedChange={onSoundChange}
            />
          </div>
          <div className="flex items-center justify-center gap-4">
            <Label htmlFor="board-size" className="text-base cursor-pointer">
              Board Size
            </Label>
            <Input
              id="board-size"
              type="number"
              min={5}
              max={12}
              value={boardSize}
              onChange={e => onBoardSizeChange(Number(e.target.value))}
              className="w-20 text-center"
            />
            <span className="text-sm text-gray-400">(min 5, max 12)</span>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Label htmlFor="question-time" className="text-base cursor-pointer">
              Question Time (seconds)
            </Label>
            <Input
              id="question-time"
              type="number"
              min={6}
              max={40}
              value={questionTime}
              onChange={e => onQuestionTimeChange(Number(e.target.value))}
              className="w-20 text-center"
            />
            <span className="text-sm text-gray-400">(6-40s)</span>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <button className="bg-blue-500 rounded px-4 py-2 text-white hover:bg-blue-700 font-bold transition-colors">
              Close
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GameSettingsModal;

