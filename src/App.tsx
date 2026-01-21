import { useState, useMemo, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuestionBox } from "@/components/QuestionBox";
import { CategoryFilter } from "@/components/CategoryFilter";
import { StatsView } from "@/components/StatsView";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { LessonList } from "@/components/LessonList";
import { LessonQuiz } from "@/components/LessonQuiz";
import { useSettingsStore } from "@/stores/settings";
import { useStatsStore } from "@/stores/stats";
import { words } from "@/lib/list";
import { getRandomWord, isLessonUnlocked, type IndexedWord } from "@/lib/words";
import { lessons } from "@/lib/lessons";
import {
  BarChart3,
  Settings,
  X,
  Languages,
  GraduationCap,
  Dumbbell,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

function App() {
  const direction = useSettingsStore((state) => state.direction);
  const setDirection = useSettingsStore((state) => state.setDirection);
  const selectedCategories = useSettingsStore(
    (state) => state.selectedCategories
  );
  const introDismissed = useSettingsStore((state) => state.introDismissed);
  const dismissIntro = useSettingsStore((state) => state.dismissIntro);
  const stats = useStatsStore((state) => state.stats);

  // State for active lesson (null = show list, number = show quiz)
  const [activeLesson, setActiveLesson] = useState<number | null>(null);

  // Get unlocked lesson IDs
  const unlockedLessonIds = useMemo(() => {
    const unlocked: number[] = [];
    for (const lesson of lessons) {
      if (isLessonUnlocked(lesson.id, stats)) {
        unlocked.push(lesson.id);
      }
    }
    return unlocked;
  }, [stats]);

  // Words from unlocked lessons only
  const unlockedWords: IndexedWord[] = useMemo(
    () =>
      words
        .map((word, index) => ({ ...word, index }))
        .filter((w) => unlockedLessonIds.includes(w.lesson)),
    [unlockedLessonIds]
  );

  // Filtered words for Practice tab (unlocked lessons + category filter)
  const filteredWords: IndexedWord[] = useMemo(
    () => unlockedWords.filter((w) => selectedCategories.includes(w.category)),
    [unlockedWords, selectedCategories]
  );

  const [currentWord, setCurrentWord] = useState<IndexedWord | null>(() =>
    getRandomWord(filteredWords, stats)
  );

  const handleNext = useCallback(() => {
    const freshStats = useStatsStore.getState().stats;
    const nextWord = getRandomWord(filteredWords, freshStats);
    setCurrentWord(nextWord);
  }, [filteredWords]);

  // Update current word when filtered words change
  useMemo(() => {
    if (
      filteredWords.length > 0 &&
      (!currentWord ||
        !filteredWords.find((w) => w.english === currentWord.english))
    ) {
      setCurrentWord(getRandomWord(filteredWords, stats));
    }
  }, [filteredWords, currentWord, stats]);

  const handleLockedLessonClick = (lessonId: number) => {
    toast.warning("Lesson Locked", {
      description: `Complete 80% of Lesson ${lessonId - 1} first to unlock this lesson.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-gradient-to-r from-red-500/10 via-yellow-500/10 to-red-500/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-yellow-500 text-white shadow-sm">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Spanish Words</h1>
              <p className="text-xs text-muted-foreground">
                Practice makes perfecto
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {!introDismissed && (
          <Card className="mb-6 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-medium">Welcome to Spanish Words!</p>
                  <p className="text-sm text-muted-foreground">
                    Progress through lessons to learn vocabulary step by step.
                    Unlock the next lesson by mastering 80% of the current one.
                    Use Practice mode to review words from unlocked lessons.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={dismissIntro}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="lessons" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger
              value="lessons"
              className="gap-2"
              onClick={() => setActiveLesson(null)}
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Lessons</span>
            </TabsTrigger>
            <TabsTrigger value="practice" className="gap-2">
              <Dumbbell className="w-4 h-4" />
              <span className="hidden sm:inline">Practice</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="space-y-6">
            {activeLesson === null ? (
              <LessonList
                stats={stats}
                onSelectLesson={setActiveLesson}
                onLockedLessonClick={handleLockedLessonClick}
              />
            ) : (
              <LessonQuiz
                lessonId={activeLesson}
                onBack={() => setActiveLesson(null)}
              />
            )}
          </TabsContent>

          <TabsContent value="practice" className="space-y-6">
            <div className="flex items-center justify-center gap-3">
              <span
                className={`text-sm font-medium ${
                  direction === "es-en"
                    ? "text-foreground"
                    : "text-muted-foreground"
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
                  direction === "en-es"
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                EN → ES
              </span>
            </div>

            {currentWord ? (
              <>
                <QuestionBox word={currentWord} onNext={handleNext} />
                <ProgressIndicator
                  words={filteredWords}
                  stats={stats}
                  currentWordId={currentWord.english}
                />
              </>
            ) : (
              <Card className="w-full max-w-lg mx-auto">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    {unlockedWords.length === 0
                      ? "Complete Lesson 1 to unlock words for practice."
                      : "No words available. Select at least one category in Settings."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="stats">
            <StatsView />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="direction">Translation Direction</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose which language to translate from
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">ES→EN</span>
                    <Switch
                      id="direction"
                      checked={direction === "en-es"}
                      onCheckedChange={(checked) =>
                        setDirection(checked ? "en-es" : "es-en")
                      }
                    />
                    <span className="text-sm">EN→ES</span>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <CategoryFilter />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Toaster />
    </div>
  );
}

export default App;
