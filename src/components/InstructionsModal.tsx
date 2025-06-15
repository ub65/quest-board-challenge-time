
import React from "react";
import { useLocalization } from "@/contexts/LocalizationContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Info } from "lucide-react";

type InstructionsModalProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

const InstructionsModal: React.FC<InstructionsModalProps> = ({ open, onOpenChange }) => {
  const { t, language } = useLocalization();

  const content = t("instructions.content")
    .split("\n")
    .map((line, idx) =>
      line.trim() === "" ? <br key={idx} /> : <p key={idx} className="mb-1">{line}</p>
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-lg animate-fade-in"
        style={{ direction: language === "he" ? "rtl" : "ltr" }}
      >
        <DialogHeader className="flex flex-row gap-2 items-center">
          <Info className="text-blue-600 shrink-0" size={28} />
          <DialogTitle>{t("instructions.title")}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="mt-2 text-base whitespace-pre-line">
          {content}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default InstructionsModal;
