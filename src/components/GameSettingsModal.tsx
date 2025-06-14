
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

type GameSettingsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  soundEnabled: boolean;
  onSoundChange: (value: boolean) => void;
};

const GameSettingsModal = ({
  open,
  onOpenChange,
  soundEnabled,
  onSoundChange,
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
        {/* Settings controls go here */}
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
