
import React, { useState } from "react";
import LanguageSelector from "./LanguageSelector";
import QuestionTypeSelector from "./QuestionTypeSelector";
import { Settings, Info } from "lucide-react";
import InstructionsModal from "./InstructionsModal";

type WelcomeScreenProps = {
  playerName: string;
  setPlayerName: (name: string) => void;
  onStart: () => void;
  onSettings: () => void;
  questionType: "translate" | "math";
  setQuestionType: (q: "translate" | "math") => void;
  language: string;
  t: (k: string, params?: any) => string;
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  playerName,
  setPlayerName,
  onStart,
  onSettings,
  questionType,
  setQuestionType,
  language,
  t,
}) => {
  const [localName, setLocalName] = React.useState(playerName);
  const [showInstructions, setShowInstructions] = React.useState(false);

  React.useEffect(() => {
    setLocalName(playerName);
  }, [playerName]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-sky-100 via-blue-200 to-violet-100 px-4">
      <div className="w-full max-w-sm mx-auto bg-white/95 shadow-xl rounded-3xl p-7 flex flex-col gap-7 mt-10">
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-3xl font-extrabold text-center tracking-tight text-primary mb-2">
            {t("game.title")}
          </h1>
          <p className="text-gray-600 text-center">
            {t("welcome.desc") || "A math board game for fun and learning!"}
          </p>
        </div>
        <LanguageSelector />
        <QuestionTypeSelector
          value={questionType}
          onChange={setQuestionType}
          t={t}
        />
        <div>
          <label htmlFor="player-name-input" className="block font-medium mb-1">
            {t("welcome.playerName") || "Your Name"}
          </label>
          <input
            id="player-name-input"
            type="text"
            value={localName}
            onChange={e => setLocalName(e.target.value.slice(0, 14))}
            placeholder={t("welcome.playerNamePlaceholder") || "Enter your name"}
            className="w-full rounded border border-gray-300 px-3 py-2 text-lg focus:outline-none focus:border-blue-400 transition"
            maxLength={14}
            autoFocus
          />
        </div>
        <button
          onClick={() => {
            setPlayerName(localName.trim());
            if (localName.trim()) onStart();
          }}
          className={`w-full rounded-lg py-3 text-lg font-semibold transition-colors bg-primary text-primary-foreground hover:bg-primary/90 shadow ${
            !localName.trim() ? 'opacity-60 pointer-events-none' : ''
          }`}
          disabled={!localName.trim()}
        >
          {t("welcome.startGame") || "Start Game"}
        </button>
        <div className="flex flex-row gap-3 w-full">
          <button
            type="button"
            onClick={onSettings}
            className="flex-1 flex items-center justify-center gap-2 text-blue-600 font-semibold hover:underline transition"
          >
            <Settings size={18} /> {t("welcome.settings") || "Settings"}
          </button>
          <button
            type="button"
            onClick={() => setShowInstructions(true)}
            className="flex-1 flex items-center justify-center gap-2 text-blue-600 font-semibold hover:underline transition"
          >
            <Info size={18} /> {t("instructions.button")}
          </button>
        </div>
      </div>
      <div className="mt-8 text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Math Board Game ❤️
      </div>
      <InstructionsModal open={showInstructions} onOpenChange={setShowInstructions} />
    </div>
  );
};

export default WelcomeScreen;
