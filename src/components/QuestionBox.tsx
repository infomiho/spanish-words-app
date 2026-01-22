import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Word } from "@/components/Word";
import { useStatsStore } from "@/stores/stats";
import { getStatKey, type IndexedWord, type Direction } from "@/lib/words";

interface QuestionBoxProps {
  word: IndexedWord;
  direction: Direction;
  onNext: () => void;
  /** When false, answers won't be recorded to stats (default: true) */
  recordStats?: boolean;
}

const categoryColors: Record<string, string> = {
  noun: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  verb: "bg-green-500/10 text-green-700 dark:text-green-400",
  adjective: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  adverb: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  pronoun: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
  preposition: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
  conjunction: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  determiner: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  article: "bg-teal-500/10 text-teal-700 dark:text-teal-400",
  number: "bg-red-500/10 text-red-700 dark:text-red-400",
  phrase: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};

export function QuestionBox({
  word,
  direction,
  onNext,
  recordStats = true,
}: QuestionBoxProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const addCorrectAnswer = useStatsStore((state) => state.addCorrectAnswer);
  const addWrongAnswer = useStatsStore((state) => state.addWrongAnswer);

  const questionText = direction === "es-en" ? word.spanish : word.english;
  const answer = direction === "es-en" ? word.english : word.spanish;
  const statKey = getStatKey(word.english, direction);

  function handleAnswer(isCorrect: boolean) {
    if (recordStats) {
      if (isCorrect) {
        addCorrectAnswer(statKey);
      } else {
        addWrongAnswer(statKey);
      }
    }
    setShowAnswer(false);
    onNext();
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardContent className="pt-6 space-y-6">
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Translate to {direction === "es-en" ? "English" : "Spanish"}:
          </p>
          <Word word={word} displayText={questionText} direction={direction} />
          <Badge
            variant="secondary"
            className={categoryColors[word.category] || ""}
          >
            {word.category}
          </Badge>
        </div>

        {!showAnswer ? (
          <Button
            className="w-full"
            size="lg"
            onClick={() => setShowAnswer(true)}
          >
            Show Answer
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-2xl font-semibold">{answer}</p>
            </div>
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                size="lg"
                onClick={() => handleAnswer(true)}
              >
                I knew it
              </Button>
              <Button
                className="flex-1"
                size="lg"
                variant="outline"
                onClick={() => handleAnswer(false)}
              >
                Nope
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
