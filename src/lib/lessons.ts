export interface Lesson {
  id: number;
  name: string;
  description: string;
}

export const lessons: Lesson[] = [
  { id: 1, name: "Fundamentals", description: "Core vocabulary" },
  { id: 2, name: "Essential Verbs", description: "Common action words" },
  { id: 3, name: "Common Phrases", description: "Everyday expressions" },
  { id: 4, name: "Descriptions", description: "Adjectives & adverbs" },
  { id: 5, name: "People & Places", description: "Nouns for life" },
  { id: 6, name: "Time & Numbers", description: "Temporal vocabulary" },
  { id: 7, name: "Connectors", description: "Conjunctions & prepositions" },
  { id: 8, name: "Advanced Verbs", description: "More action words" },
  { id: 9, name: "Abstract Concepts", description: "Ideas & thoughts" },
];

export const UNLOCK_THRESHOLD = 0.8; // 80%
