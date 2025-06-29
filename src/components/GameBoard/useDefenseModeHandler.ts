import { useCallback } from "react";
import { Tile } from "./types";

/**
 * Hook to manage defense mode logic and click handler.
 */
export function useDefenseModeHandler({
  t,
  toast,
  setDefenseMode,
  handleDefenseClick,
  defenseMode,
}: {
  t: (key: string, params?: any) => string;
  toast: (args: any) => void;
  setDefenseMode: (b: boolean) => void;
  handleDefenseClick: (tile: Tile) => void;
  defenseMode: boolean;
}) {
  const startDefensePlacement = useCallback(() => {
    console.log('[DEFENSE] Starting defense placement mode');
    setDefenseMode(true);
    toast({
      title: t("game.defense_mode_on") || "Defense Mode",
      description: t("game.defense_mode_on_desc") || "Select a tile to place your defense",
      duration: 2200,
    });
  }, [setDefenseMode, toast, t]);

  const cancelDefensePlacement = useCallback(() => {
    console.log('[DEFENSE] Cancelling defense placement mode');
    setDefenseMode(false);
    toast({
      title: t("game.defense_cancelled") || "Defense Cancelled",
      description: t("game.defense_cancelled_desc") || "Defense placement mode disabled",
      duration: 1500,
    });
  }, [setDefenseMode, toast, t]);

  const toggleDefensePlacement = useCallback(() => {
    console.log(`[DEFENSE] Toggling defense mode, current state: ${defenseMode}`);
    if (defenseMode) {
      cancelDefensePlacement();
    } else {
      startDefensePlacement();
    }
  }, [defenseMode, startDefensePlacement, cancelDefensePlacement]);

  return { 
    defenseActive: defenseMode, 
    startDefensePlacement, 
    cancelDefensePlacement, 
    toggleDefensePlacement 
  };
}