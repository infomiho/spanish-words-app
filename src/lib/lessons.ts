export type Direction = "es-en" | "en-es";

export interface Lesson {
  id: number;
  name: string;
  description: string;
  direction: Direction;
  vocabLesson: number; // 1-11, maps to word.lesson field
}

const lessonNames = [
  { name: "Fundamentals", description: "Core vocabulary" },
  { name: "Essential Verbs", description: "Common action words" },
  { name: "Common Phrases", description: "Everyday expressions" },
  { name: "Descriptions", description: "Adjectives & adverbs" },
  { name: "People & Family", description: "Family, roles & body" },
  { name: "Animals & Nature", description: "Living world & geography" },
  { name: "Places & Objects", description: "Buildings, items & food" },
  { name: "Time & Numbers", description: "Temporal & connectors" },
  { name: "Action Verbs", description: "Common action words" },
  { name: "More Verbs & Life", description: "Verbs & everyday nouns" },
  { name: "Abstract Concepts", description: "Ideas & thoughts" },
];

// Generate 22 lessons: 1-11 ES→EN, 12-22 EN→ES
export const lessons: Lesson[] = [
  // Lessons 1-11: Spanish → English
  ...lessonNames.map((lesson, i) => ({
    id: i + 1,
    name: `${lesson.name} (ES→EN)`,
    description: lesson.description,
    direction: "es-en" as Direction,
    vocabLesson: i + 1,
  })),
  // Lessons 12-22: English → Spanish
  ...lessonNames.map((lesson, i) => ({
    id: i + lessonNames.length + 1,
    name: `${lesson.name} (EN→ES)`,
    description: lesson.description,
    direction: "en-es" as Direction,
    vocabLesson: i + 1,
  })),
];

export const UNLOCK_THRESHOLD = 0.8; // 80%
