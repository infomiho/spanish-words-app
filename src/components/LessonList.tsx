import { Card, CardContent } from "@/components/ui/card";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { lessons } from "@/lib/lessons";
import { getWordsForLesson, isLessonUnlocked } from "@/lib/words";
import type { WordStats } from "@/lib/words";
import { Lock } from "lucide-react";

interface LessonListProps {
  stats: Record<string, WordStats>;
  onSelectLesson: (lessonId: number) => void;
  onLockedLessonClick: (lessonId: number) => void;
}

export function LessonList({
  stats,
  onSelectLesson,
  onLockedLessonClick,
}: LessonListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center">Lessons</h2>
      <div className="space-y-3">
        {lessons.map((lesson) => {
          const lessonWords = getWordsForLesson(lesson.id);
          const unlocked = isLessonUnlocked(lesson.id, stats);

          return (
            <Card
              key={lesson.id}
              className={`cursor-pointer transition-all ${
                unlocked
                  ? "hover:shadow-md hover:border-primary/50"
                  : "opacity-60"
              }`}
              onClick={() =>
                unlocked
                  ? onSelectLesson(lesson.id)
                  : onLockedLessonClick(lesson.id)
              }
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {!unlocked && (
                        <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                      <h3 className="font-medium">
                        Lesson {lesson.id}: {lesson.name}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {lesson.description}
                    </p>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <ProgressIndicator
                        words={lessonWords}
                        stats={stats}
                        compact
                      />
                    </div>

                    {!unlocked && (
                      <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">
                        Unlock: 80% in Lesson {lesson.id - 1}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
