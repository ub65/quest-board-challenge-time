
import { useState } from "react";
import { Tile } from "./types";

/**
 * Hook to manage defense mode logic and click handler.
 */
export function useDefenseModeHandler({
  t,
  toast,
  setDefenseMode,
  handleDefenseClick,
}: {
  t: (key: string, params?: any) => string;
  toast: (args: any) => void;
  setDefenseMode: (b: boolean) => void;
  handleDefenseClick: (tile: Tile) => void;
}) {
  const [defenseActive, setDefenseActive] = useState(false);

  function startDefensePlacement() {
    setDefenseMode(true);
    setDefenseActive(true);
    toast({
      title: t("game.defense_mode_on"),
      description: t("game.defense_mode_on_desc"),
      duration: 2200,
    });
    const handler = (ev: MouseEvent) => {
      if (!(ev.target instanceof HTMLElement)) return;
      let tileDiv = ev.target.closest("button[data-tile-x]");
      if (!tileDiv) return;
      const x = parseInt(tileDiv.getAttribute("data-tile-x") || "-1");
      const y = parseInt(tileDiv.getAttribute("data-tile-y") || "-1");
      if (x < 0 || y < 0) return;
      handleDefenseClick({ x, y });
      document.removeEventListener("click", handler, true);
      setDefenseMode(false);
      setDefenseActive(false);
    };
    setTimeout(() => {
      document.addEventListener("click", handler, true);
    }, 100);
  }

  function cancelDefensePlacement() {
    setDefenseMode(false);
    setDefenseActive(false);
    toast({
      title: t("game.defense_mode_off") || "Defense mode canceled",
      description: t("game.defense_mode_off_desc") || "Defense placement has been canceled",
      duration: 2000,
    });
  }

  function toggleDefensePlacement() {
    if (defenseActive) {
      cancelDefensePlacement();
    } else {
      startDefensePlacement();
    }
  }

  return { defenseActive, startDefensePlacement, cancelDefensePlacement, toggleDefensePlacement };
}
