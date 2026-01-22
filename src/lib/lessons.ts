export type Direction = "es-en" | "en-es";

export interface Lesson {
  id: number;
  name: string;
  description: string;
  direction: Direction;
  vocabLesson: number; // 1-9, maps to word.lesson field
}

const lessonNames = [
  { name: "Fundamentals", description: "Core vocabulary" },
  { name: "Essential Verbs", description: "Common action words" },
  { name: "Common Phrases", description: "Everyday expressions" },
  { name: "Descriptions", description: "Adjectives & adverbs" },
  { name: "People & Places", description: "Nouns for life" },
  { name: "Time & Numbers", description: "Temporal vocabulary" },
  { name: "Connectors", description: "Conjunctions & prepositions" },
  { name: "Advanced Verbs", description: "More action words" },
  { name: "Abstract Concepts", description: "Ideas & thoughts" },
];

// Generate 18 lessons: 1-9 ES→EN, 10-18 EN→ES
export const lessons: Lesson[] = [
  // Lessons 1-9: Spanish → English
  ...lessonNames.map((lesson, i) => ({
    id: i + 1,
    name: `${lesson.name} (ES→EN)`,
    description: lesson.description,
    direction: "es-en" as Direction,
    vocabLesson: i + 1,
  })),
  // Lessons 10-18: English → Spanish
  ...lessonNames.map((lesson, i) => ({
    id: i + 10,
    name: `${lesson.name} (EN→ES)`,
    description: lesson.description,
    direction: "en-es" as Direction,
    vocabLesson: i + 1,
  })),
];

export const UNLOCK_THRESHOLD = 0.8; // 80%
