import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QuestionBox } from "@/components/QuestionBox";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { lessons } from "@/lib/lessons";
import {
  getLearnableItemsForLesson,
  getRandomWord,
  type LearnableItem,
} from "@/lib/words";
import { useStatsStore } from "@/stores/stats";
import { ArrowLeft } from "lucide-react";

interface LessonQuizProps {
  lessonId: number;
  onBack: () => void;
}

export function LessonQuiz({ lessonId, onBack }: LessonQuizProps) {
  const lesson = lessons.find((l) => l.id === lessonId);
  const stats = useStatsStore((state) => state.stats);

  const lessonItems = useMemo(
    () => getLearnableItemsForLesson(lessonId),
    [lessonId]
  );

  const [currentItem, setCurrentItem] = useState<LearnableItem | null>(() =>
    getRandomWord(lessonItems, stats)
  );

  const handleNext = useCallback(() => {
    const freshStats = useStatsStore.getState().stats;
    const nextItem = getRandomWord(lessonItems, freshStats);
    setCurrentItem(nextItem);
  }, [lessonItems]);

  if (!lesson) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Lesson not found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          Lessons
        </Button>
        <div className="flex-1 text-center pr-16">
          <h2 className="font-semibold">
            Lesson {lesson.id}: {lesson.name}
          </h2>
        </div>
      </div>

      {/* Question */}
      {currentItem ? (
        <>
          <QuestionBox
            word={currentItem.word}
            direction={currentItem.direction}
            onNext={handleNext}
          />
          <ProgressIndicator
            items={lessonItems}
            stats={stats}
            currentWordId={currentItem.word.english}
          />
        </>
      ) : (
        <Card className="w-full max-w-lg mx-auto">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No words available in this lesson.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
