
import { Gift } from "lucide-react";
import { useCallback } from "react";
import type { Tile, PlayerType, SurpriseTile } from "./types";
import { toast } from "@/components/ui/use-toast"; // Only import `toast`, not `ToastFn`

type UseSurpriseProps = {
  boardPoints: number[][];
  surpriseTiles: SurpriseTile[];
  setSurpriseTiles: (fn: (prev: SurpriseTile[]) => SurpriseTile[]) => void;
  setHumanPoints: (fn: (val: number) => number) => void;
  setAIPoints: (fn: (val: number) => number) => void;
  humanPoints: number;
  aiPoints: number;
  t: (s: string, params?: any) => string;
  toast: typeof toast; // Use the type of the imported `toast` function
};

export function useSurprise({
  boardPoints,
  surpriseTiles,
  setSurpriseTiles,
  setHumanPoints,
  setAIPoints,
  humanPoints,
  aiPoints,
  t,
  toast,
}: UseSurpriseProps) {
  return useCallback(
    (tile: Tile, player: PlayerType) => {
      const sIdx = surpriseTiles.findIndex(
        (st) => st.x === tile.x && st.y === tile.y && !st.used
      );
      if (sIdx === -1) return;
      const s = surpriseTiles[sIdx];
      let message = "";
      let pointsChange = 0;
      let doFreeMove = false;

      const tilePoints = boardPoints[tile.y]?.[tile.x] || 0;
      switch (s.type) {
        case "double":
          if (tilePoints > 0) {
            pointsChange = tilePoints;
            if (player === "human") setHumanPoints((v) => v + tilePoints);
            else setAIPoints((v) => v + tilePoints);
          }
          message = player === "human"
            ? t("surprise.double.self")
            : t("surprise.double.ai");
          break;
        case "lose":
          pointsChange = -Math.ceil(
            (player === "human" ? humanPoints : aiPoints) * 0.2
          );
          if (player === "human")
            setHumanPoints((v) => Math.max(0, v + pointsChange));
          else setAIPoints((v) => Math.max(0, v + pointsChange));
          message =
            player === "human"
              ? t("surprise.lose.self")
              : t("surprise.lose.ai");
          break;
        case "free":
          doFreeMove = true;
          message =
            player === "human"
              ? t("surprise.free.self")
              : t("surprise.free.ai");
          break;
        case "steal": {
          const take = 15 + Math.floor(Math.random() * 15);
          if (player === "human") {
            setAIPoints((aiv) => Math.max(0, aiv - take));
            setHumanPoints((hv) => hv + take);
          } else {
            setHumanPoints((hv) => Math.max(0, hv - take));
            setAIPoints((aiv) => aiv + take);
          }
          message =
            player === "human"
              ? t("surprise.steal.self", { n: take })
              : t("surprise.steal.ai", { n: take });
          break;
        }
        case "extra":
          pointsChange = 15 + Math.floor(Math.random() * 15);
          if (player === "human") setHumanPoints((v) => v + pointsChange);
          else setAIPoints((v) => v + pointsChange);
          message =
            player === "human"
              ? t("surprise.extra.self", { n: pointsChange })
              : t("surprise.extra.ai", { n: pointsChange });
          break;
      }
      setSurpriseTiles((prev) =>
        prev.map((s, i) => (i === sIdx ? { ...s, used: true } : s))
      );
      toast({
        title: t("surprise.title"),
        description: (
          <span className="flex items-center gap-2">
            <Gift className="inline-block text-pink-500" size={24} />
            {message}
          </span>
        ),
        duration: 3000,
      });
      return doFreeMove;
    },
    [
      boardPoints,
      surpriseTiles,
      setSurpriseTiles,
      setHumanPoints,
      setAIPoints,
      humanPoints,
      aiPoints,
      t,
      toast,
    ]
  );
}
