import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { QuestionBox } from "@/components/QuestionBox";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { useStatsStore } from "@/stores/stats";
import {
  getRandomWord,
  getAllUnlockedItems,
  type LearnableItem,
} from "@/lib/words";

export const Route = createFileRoute("/practice")({
  component: PracticePage,
});

function PracticePage() {
  const stats = useStatsStore((state) => state.stats);

  // Get all unlocked items (words with their directions) for practice mode
  const unlockedItems = useMemo(() => getAllUnlockedItems(stats), [stats]);

  const [currentItem, setCurrentItem] = useState<LearnableItem | null>(() =>
    getRandomWord(unlockedItems, stats)
  );

  const handleNext = useCallback(() => {
    const freshStats = useStatsStore.getState().stats;
    const freshItems = getAllUnlockedItems(freshStats);
    const nextItem = getRandomWord(freshItems, freshStats);
    setCurrentItem(nextItem);
  }, []);

  // Update current item when unlocked items change
  useMemo(() => {
    if (
      unlockedItems.length > 0 &&
      (!currentItem ||
        !unlockedItems.find(
          (i) =>
            i.word.english === currentItem.word.english &&
            i.direction === currentItem.direction
        ))
    ) {
      setCurrentItem(getRandomWord(unlockedItems, stats));
    }
  }, [unlockedItems, currentItem, stats]);

  if (!currentItem) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            Complete Lesson 1 to unlock words for practice.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <QuestionBox
        word={currentItem.word}
        direction={currentItem.direction}
        onNext={handleNext}
        recordStats={false}
      />
      <ProgressIndicator
        items={unlockedItems}
        stats={stats}
        currentWordId={currentItem.word.english}
      />
    </div>
  );
}
