import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  useSettingsStore,
  ALL_CATEGORIES,
} from "@/stores/settings";
import type { WordCategory } from "@/lib/list";

const categoryLabels: Record<WordCategory, string> = {
  noun: "Nouns",
  verb: "Verbs",
  adjective: "Adjectives",
  adverb: "Adverbs",
  pronoun: "Pronouns",
  preposition: "Prepositions",
  conjunction: "Conjunctions",
  determiner: "Determiners",
  article: "Articles",
  number: "Numbers",
  phrase: "Phrases",
};

export function CategoryFilter() {
  const selectedCategories = useSettingsStore(
    (state) => state.selectedCategories
  );
  const toggleCategory = useSettingsStore((state) => state.toggleCategory);
  const setAllCategories = useSettingsStore((state) => state.setAllCategories);

  const allSelected = selectedCategories.length === ALL_CATEGORIES.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Categories</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setAllCategories(allSelected ? ["noun"] : ALL_CATEGORIES)
          }
        >
          {allSelected ? "Deselect All" : "Select All"}
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {ALL_CATEGORIES.map((category) => (
          <div key={category} className="flex items-center space-x-2">
            <Checkbox
              id={category}
              checked={selectedCategories.includes(category)}
              onCheckedChange={() => toggleCategory(category)}
            />
            <Label
              htmlFor={category}
              className="text-sm font-normal cursor-pointer"
            >
              {categoryLabels[category]}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
