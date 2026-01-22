import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { LessonQuiz } from "@/components/LessonQuiz";
import { useStatsStore } from "@/stores/stats";
import { isLessonUnlocked } from "@/lib/words";
import { toast } from "sonner";

export const Route = createFileRoute("/lessons/$lessonId")({
  beforeLoad: ({ params }) => {
    const lessonId = Number(params.lessonId);

    // Validate lessonId is a number between 1-18
    if (isNaN(lessonId) || lessonId < 1 || lessonId > 18) {
      throw redirect({ to: "/lessons" });
    }

    const stats = useStatsStore.getState().stats;
    if (!isLessonUnlocked(lessonId, stats)) {
      // Show toast for locked lesson
      const unlockMessage =
        lessonId === 10
          ? "Complete 80% of Lesson 9 first to unlock this lesson."
          : `Complete 80% of Lesson ${lessonId - 1} first to unlock this lesson.`;

      toast.warning("Lesson Locked", {
        description: unlockMessage,
      });

      throw redirect({ to: "/lessons" });
    }
  },
  component: LessonQuizPage,
});

function LessonQuizPage() {
  const { lessonId } = Route.useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate({ to: "/lessons" });
  };

  return <LessonQuiz lessonId={Number(lessonId)} onBack={handleBack} />;
}
