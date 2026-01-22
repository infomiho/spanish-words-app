import { useState, useRef, useCallback } from "react";
import { Volume2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useStatsStore } from "@/stores/stats";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { getStatKey, type IndexedWord, type Direction } from "@/lib/words";

interface WordProps {
  word: IndexedWord;
  displayText: string;
  direction: Direction;
}

const LONG_PRESS_DURATION = 500;
const DEFAULT_STATS = { correct: 0, incorrect: 0, total: 0 };

export function Word({ word, displayText, direction }: WordProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { play, isPlaying } = useAudioPlayback();
  const statKey = getStatKey(word.english, direction);
  const wordStats = useStatsStore(
    (state) => state.stats[statKey] ?? DEFAULT_STATS
  );

  const successRate =
    wordStats.total > 0
      ? Math.round((wordStats.correct / wordStats.total) * 100)
      : null;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startLongPress = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      setIsOpen(true);
    }, LONG_PRESS_DURATION);
  }, [clearTimer]);

  const cancelLongPress = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={() => play(word.english)}
        className={`p-2 rounded-full transition-colors hover:bg-muted ${
          isPlaying ? "text-primary" : "text-muted-foreground"
        }`}
        aria-label="Play pronunciation"
      >
        <Volume2 className={`w-6 h-6 ${isPlaying ? "animate-pulse" : ""}`} />
      </button>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className="text-3xl font-bold cursor-default select-none touch-none"
            onMouseDown={startLongPress}
            onMouseUp={cancelLongPress}
            onMouseLeave={cancelLongPress}
            onTouchStart={startLongPress}
            onTouchEnd={cancelLongPress}
            onTouchCancel={cancelLongPress}
            onContextMenu={(e) => e.preventDefault()}
          >
            {displayText}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-3">
            <div className="text-center">
              <p className="font-semibold">{word.spanish}</p>
              <p className="text-sm text-muted-foreground">{word.english}</p>
            </div>
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Stats
              </p>
              {wordStats.total === 0 ? (
                <p className="text-sm text-muted-foreground">Not practiced yet</p>
              ) : (
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="text-muted-foreground py-0.5">Correct</td>
                      <td className="text-right font-medium text-emerald-600">{wordStats.correct}</td>
                    </tr>
                    <tr>
                      <td className="text-muted-foreground py-0.5">Incorrect</td>
                      <td className="text-right font-medium text-red-600">{wordStats.incorrect}</td>
                    </tr>
                    <tr>
                      <td className="text-muted-foreground py-0.5">Success rate</td>
                      <td className="text-right font-medium">{successRate}%</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
