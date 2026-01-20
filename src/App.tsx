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
import { useSettingsStore } from "@/stores/settings";
import { useStatsStore } from "@/stores/stats";
import { words } from "@/lib/list";
import { getRandomWord, type IndexedWord } from "@/lib/words";
import { BookOpen, BarChart3, Settings, X, Languages } from "lucide-react";

function App() {
  const direction = useSettingsStore((state) => state.direction);
  const setDirection = useSettingsStore((state) => state.setDirection);
  const selectedCategories = useSettingsStore(
    (state) => state.selectedCategories
  );
  const introDismissed = useSettingsStore((state) => state.introDismissed);
  const dismissIntro = useSettingsStore((state) => state.dismissIntro);
  const stats = useStatsStore((state) => state.stats);

  const filteredWords: IndexedWord[] = useMemo(
    () =>
      words
        .map((word, index) => ({ ...word, index }))
        .filter((w) => selectedCategories.includes(w.category)),
    [selectedCategories]
  );

  const [currentWord, setCurrentWord] = useState<IndexedWord | null>(() =>
    getRandomWord(filteredWords, stats)
  );

  const handleNext = useCallback(() => {
    // Get fresh stats from the store
    const freshStats = useStatsStore.getState().stats;
    const nextWord = getRandomWord(filteredWords, freshStats);
    setCurrentWord(nextWord);
  }, [filteredWords]);

  // Update current word when filtered words change
  useMemo(() => {
    if (
      filteredWords.length > 0 &&
      (!currentWord || !filteredWords.find((w) => w.index === currentWord.index))
    ) {
      setCurrentWord(getRandomWord(filteredWords, stats));
    }
  }, [filteredWords, currentWord, stats]);

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
              <p className="text-xs text-muted-foreground">Practice makes perfecto</p>
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
                    Practice Spanish vocabulary with flashcards. Words you
                    struggle with will appear more frequently. Select categories
                    to focus on specific word types.
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

        <Tabs defaultValue="learn" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="learn" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Learn
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Stats
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="learn" className="space-y-6">
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

            {currentWord ? (
              <>
                <QuestionBox word={currentWord} onNext={handleNext} />
                <ProgressIndicator
                  words={filteredWords}
                  stats={stats}
                  currentWordIndex={currentWord.index}
                />
              </>
            ) : (
              <Card className="w-full max-w-lg mx-auto">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    No words available. Select at least one category in
                    Settings.
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
    </div>
  );
}

export default App;
