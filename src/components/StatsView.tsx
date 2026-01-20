import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useStatsStore } from "@/stores/stats";
import { useSettingsStore } from "@/stores/settings";
import { words } from "@/lib/list";
import { getOverallStats } from "@/lib/words";
import { Sparkles, RotateCcw } from "lucide-react";

export function StatsView() {
  const stats = useStatsStore((state) => state.stats);
  const resetStats = useStatsStore((state) => state.resetStats);
  const selectedCategories = useSettingsStore(
    (state) => state.selectedCategories
  );

  const filteredWords = useMemo(
    () => words.filter((w) => selectedCategories.includes(w.category)),
    [selectedCategories]
  );

  const overall = getOverallStats(stats);

  const wordStats = useMemo(() => {
    return filteredWords
      .map((word, index) => {
        const wordStat = stats[index] || { correct: 0, incorrect: 0, total: 0 };
        const successRate =
          wordStat.total > 0
            ? Math.round((wordStat.correct / wordStat.total) * 100)
            : null;
        return { word, index, ...wordStat, successRate };
      })
      .sort((a, b) => {
        // Show words with lowest success rate first, then unattempted
        if (a.successRate === null && b.successRate === null) return 0;
        if (a.successRate === null) return 1;
        if (b.successRate === null) return -1;
        return a.successRate - b.successRate;
      });
  }, [filteredWords, stats]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Overall Progress</CardTitle>
          <Button variant="ghost" size="sm" onClick={resetStats}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{overall.wordsPlayed}</p>
              <p className="text-sm text-muted-foreground">
                Words Practiced
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold">{overall.successRate}%</p>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
          </div>
          <Progress value={overall.successRate} className="h-2" />
          <p className="text-sm text-muted-foreground text-center">
            {overall.totalCorrect} correct out of {overall.totalAttempts}{" "}
            attempts
          </p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Word Progress</h3>
        <div className="grid gap-2">
          {wordStats.map(({ word, index, total, successRate }) => (
            <Card
              key={index}
              className={
                successRate !== null && successRate < 50
                  ? "border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20"
                  : ""
              }
            >
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{word.spanish}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {word.english}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {total === 0 ? (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    >
                      New
                    </Badge>
                  ) : (
                    <>
                      {successRate !== null && successRate >= 70 && (
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          successRate !== null && successRate < 50
                            ? "text-red-600 dark:text-red-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {successRate}%
                      </span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
