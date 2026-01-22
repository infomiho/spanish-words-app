import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useStatsStore } from "@/stores/stats";
import { words } from "@/lib/list";
import { getOverallStats, getStatKey, type Direction } from "@/lib/words";
import { Sparkles, RotateCcw } from "lucide-react";

interface WordStatEntry {
  word: (typeof words)[0];
  direction: Direction;
  correct: number;
  incorrect: number;
  total: number;
  successRate: number | null;
}

interface WordStatsSectionProps {
  title: string;
  stats: WordStatEntry[];
  getPrimaryText: (word: (typeof words)[0]) => string;
  getSecondaryText: (word: (typeof words)[0]) => string;
}

function WordStatsSection({
  title,
  stats,
  getPrimaryText,
  getSecondaryText,
}: WordStatsSectionProps) {
  if (stats.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">{title}</h3>
      <div className="grid gap-2">
        {stats.map(({ word, direction, total, successRate }) => (
          <Card
            key={`${word.english}:${direction}`}
            className={
              successRate !== null && successRate < 50
                ? "border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20"
                : ""
            }
          >
            <CardContent className="py-3 px-4 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{getPrimaryText(word)}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {getSecondaryText(word)}
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
  );
}

export function StatsView() {
  const stats = useStatsStore((state) => state.stats);
  const resetStats = useStatsStore((state) => state.resetStats);

  const overall = getOverallStats(stats);

  const wordStats = useMemo(() => {
    const entries: WordStatEntry[] = [];

    for (const word of words) {
      // ES → EN stats
      const esEnKey = getStatKey(word.english, "es-en");
      const esEnStat = stats[esEnKey] || { correct: 0, incorrect: 0, total: 0 };
      const esEnSuccessRate =
        esEnStat.total > 0
          ? Math.round((esEnStat.correct / esEnStat.total) * 100)
          : null;
      entries.push({
        word,
        direction: "es-en",
        ...esEnStat,
        successRate: esEnSuccessRate,
      });

      // EN → ES stats
      const enEsKey = getStatKey(word.english, "en-es");
      const enEsStat = stats[enEsKey] || { correct: 0, incorrect: 0, total: 0 };
      const enEsSuccessRate =
        enEsStat.total > 0
          ? Math.round((enEsStat.correct / enEsStat.total) * 100)
          : null;
      entries.push({
        word,
        direction: "en-es",
        ...enEsStat,
        successRate: enEsSuccessRate,
      });
    }

    return entries
      .filter((e) => e.total > 0) // Only show practiced items
      .sort((a, b) => {
        // Show words with lowest success rate first
        if (a.successRate === null && b.successRate === null) return 0;
        if (a.successRate === null) return 1;
        if (b.successRate === null) return -1;
        return a.successRate - b.successRate;
      });
  }, [stats]);

  const esEnStats = wordStats.filter((ws) => ws.direction === "es-en");
  const enEsStats = wordStats.filter((ws) => ws.direction === "en-es");

  const sections = [
    {
      title: "Spanish → English",
      stats: esEnStats,
      getPrimaryText: (word: (typeof words)[0]) => word.spanish,
      getSecondaryText: (word: (typeof words)[0]) => word.english,
    },
    {
      title: "English → Spanish",
      stats: enEsStats,
      getPrimaryText: (word: (typeof words)[0]) => word.english,
      getSecondaryText: (word: (typeof words)[0]) => word.spanish,
    },
  ];

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

      {sections.map((section) => (
        <WordStatsSection
          key={section.title}
          title={section.title}
          stats={section.stats}
          getPrimaryText={section.getPrimaryText}
          getSecondaryText={section.getSecondaryText}
        />
      ))}

      {wordStats.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No words practiced yet. Start a lesson to see your progress!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
