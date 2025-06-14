
import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";

const GameSettingsModal = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Game Settings</DialogTitle>
          <DialogDescription>
            Adjust game settings below. (This is a placeholder, ask for more controls if you want!)
          </DialogDescription>
        </DialogHeader>
        {/* Settings controls go here */}
        <div className="py-6 flex flex-col gap-4 text-center text-gray-600">
          <span className="italic">Settings coming soon!</span>
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
