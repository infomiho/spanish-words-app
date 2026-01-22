import { Card, CardContent } from "@/components/ui/card";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { lessons, type Lesson } from "@/lib/lessons";
import { getLearnableItemsForLesson, isLessonUnlocked } from "@/lib/words";
import type { WordStats } from "@/lib/words";
import { Lock } from "lucide-react";

interface LessonListProps {
  stats: Record<string, WordStats>;
  onSelectLesson: (lessonId: number) => void;
  onLockedLessonClick: (lessonId: number) => void;
}

interface LessonCardProps {
  lesson: Lesson;
  stats: Record<string, WordStats>;
  onSelectLesson: (lessonId: number) => void;
  onLockedLessonClick: (lessonId: number) => void;
  getUnlockMessage: (lessonId: number) => string;
}

function LessonCard({
  lesson,
  stats,
  onSelectLesson,
  onLockedLessonClick,
  getUnlockMessage,
}: LessonCardProps) {
  const lessonItems = getLearnableItemsForLesson(lesson.id);
  const unlocked = isLessonUnlocked(lesson.id, stats);

  return (
    <Card
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

            <div className="mt-3">
              <ProgressIndicator
                items={lessonItems}
                stats={stats}
                compact
              />
            </div>

            {!unlocked && (
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">
                {getUnlockMessage(lesson.id)}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LessonList({
  stats,
  onSelectLesson,
  onLockedLessonClick,
}: LessonListProps) {
  const esEnLessons = lessons.filter((l) => l.direction === "es-en");
  const enEsLessons = lessons.filter((l) => l.direction === "en-es");

  function getUnlockMessage(lessonId: number): string {
    if (lessonId === 10) {
      return "Unlock: 80% in Lesson 9";
    }
    return `Unlock: 80% in Lesson ${lessonId - 1}`;
  }

  const sections = [
    { title: "Spanish → English", lessons: esEnLessons },
    { title: "English → Spanish", lessons: enEsLessons },
  ];

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.title} className="space-y-3">
          <h2 className="text-lg font-semibold text-center">{section.title}</h2>
          <div className="space-y-3">
            {section.lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                stats={stats}
                onSelectLesson={onSelectLesson}
                onLockedLessonClick={onLockedLessonClick}
                getUnlockMessage={getUnlockMessage}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
