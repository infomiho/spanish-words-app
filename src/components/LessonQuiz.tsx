import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { QuestionBox } from "@/components/QuestionBox";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { lessons } from "@/lib/lessons";
import { getWordsForLesson, getRandomWord, type IndexedWord } from "@/lib/words";
import { useSettingsStore } from "@/stores/settings";
import { useStatsStore } from "@/stores/stats";
import { ArrowLeft } from "lucide-react";

interface LessonQuizProps {
  lessonId: number;
  onBack: () => void;
}

export function LessonQuiz({ lessonId, onBack }: LessonQuizProps) {
  const lesson = lessons.find((l) => l.id === lessonId);
  const direction = useSettingsStore((state) => state.direction);
  const setDirection = useSettingsStore((state) => state.setDirection);
  const stats = useStatsStore((state) => state.stats);

  const lessonWords = useMemo(() => getWordsForLesson(lessonId), [lessonId]);

  const [currentWord, setCurrentWord] = useState<IndexedWord | null>(() =>
    getRandomWord(lessonWords, stats)
  );

  const handleNext = useCallback(() => {
    const freshStats = useStatsStore.getState().stats;
    const nextWord = getRandomWord(lessonWords, freshStats);
    setCurrentWord(nextWord);
  }, [lessonWords]);

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

      {/* Direction toggle */}
      <div className="flex items-center justify-center gap-3">
        <span
          className={`text-sm font-medium ${
            direction === "es-en" ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          ES → EN
        </span>
        <Switch
          checked={direction === "en-es"}
          onCheckedChange={(checked) =>
            setDirection(checked ? "en-es" : "es-en")
          }
        />
        <span
          className={`text-sm font-medium ${
            direction === "en-es" ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          EN → ES
        </span>
      </div>

      {/* Question */}
      {currentWord ? (
        <>
          <QuestionBox word={currentWord} onNext={handleNext} />
          <ProgressIndicator
            words={lessonWords}
            stats={stats}
            currentWordId={currentWord.english}
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
