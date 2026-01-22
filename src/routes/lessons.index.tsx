import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LessonList } from "@/components/LessonList";
import { useStatsStore } from "@/stores/stats";
import { toast } from "sonner";

export const Route = createFileRoute("/lessons/")({
  component: LessonsPage,
});

function LessonsPage() {
  const stats = useStatsStore((state) => state.stats);
  const navigate = useNavigate();

  const handleSelectLesson = (lessonId: number) => {
    navigate({ to: "/lessons/$lessonId", params: { lessonId: String(lessonId) } });
  };

  const handleLockedLessonClick = (lessonId: number) => {
    const unlockMessage =
      lessonId === 10
        ? "Complete 80% of Lesson 9 first to unlock this lesson."
        : `Complete 80% of Lesson ${lessonId - 1} first to unlock this lesson.`;

    toast.warning("Lesson Locked", {
      description: unlockMessage,
    });
  };

  return (
    <LessonList
      stats={stats}
      onSelectLesson={handleSelectLesson}
      onLockedLessonClick={handleLockedLessonClick}
    />
  );
}
