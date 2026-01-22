/**
 * Audio generation script for Spanish vocabulary pronunciation.
 * Downloads audio from SpanishDict.com for all Spanish words.
 *
 * Usage:
 *   pnpm generate-audio:spanishdict
 *
 * Features:
 *   - Fetches native speaker audio from SpanishDict.com
 *   - Skips already downloaded files (resume capability)
 *   - Rate limiting to be respectful to the server
 *   - Progress reporting
 *   - Uses English word as filename for stability (indexes may change)
 */

import * as fs from "fs";
import * as path from "path";
import { words } from "../src/lib/list";

const OUTPUT_DIR = path.join(process.cwd(), "public", "audio");

// Rate limiting: be respectful to the server
const DELAY_BETWEEN_REQUESTS = 300; // ms

// Concurrency for parallel downloads
const CONCURRENT_REQUESTS = 5;

/**
 * Sanitizes a string to be safe for use as a filename.
 * Replaces slashes and special characters with hyphens.
 */
function sanitizeFilename(str: string): string {
  return str
    .toLowerCase()
    .replace(/[/\\]/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetches the audio URL from SpanishDict for a given Spanish word.
 * Returns the direct audio URL or null if not found.
 *
 * Note: For conjugated verbs (e.g., "debería"), SpanishDict shows the infinitive
 * as the headword (e.g., "deber"). We search for an audioUrl that matches our
 * exact search term, not just the headword.
 */
async function getAudioUrl(spanishWord: string): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(spanishWord);
    const url = `https://www.spanishdict.com/translate/${encoded}?langFrom=es`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Accept: "text/html",
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    // URL-encode the word for matching in the HTML
    const encodedWord = encodeURIComponent(spanishWord);
    const escapedEncodedWord = encodedWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // First, try to find audioUrls.result with text= matching our word
    // This handles conjugated verbs (e.g., "debería") which have audio under audioUrls.result
    const resultMatchRegex = new RegExp(
      `audioUrls":\\{"result":"(https:[^"]*text=${escapedEncodedWord}[^"]*)"`
    );
    const resultMatch = html.match(resultMatchRegex);

    if (resultMatch) {
      return resultMatch[1].replace(/\\u002F/g, "/");
    }

    // Try singular audioUrl with text= matching our word (URL encoded)
    const exactMatchRegex = new RegExp(
      `audioUrl":"(https:[^"]*text=${escapedEncodedWord}[^"]*)"`
    );
    const exactMatch = html.match(exactMatchRegex);

    if (exactMatch) {
      return exactMatch[1].replace(/\\u002F/g, "/");
    }

    // Fallback: use the headword audioUrl (works for base words)
    const headwordMatch = html.match(
      /"headword":\{[^}]*audioUrl":"([^"]+)"/
    );

    if (headwordMatch) {
      return headwordMatch[1].replace(/\\u002F/g, "/");
    }

    return null;
  } catch (error) {
    console.error(`Error fetching audio URL for "${spanishWord}":`, error);
    return null;
  }
}

/**
 * Downloads an audio file from the given URL and saves it to the output path.
 */
async function downloadAudio(
  audioUrl: string,
  outputPath: string
): Promise<boolean> {
  try {
    const response = await fetch(audioUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      return false;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(outputPath, buffer);
    return true;
  } catch (error) {
    return false;
  }
}

interface WordTask {
  index: number;
  spanish: string;
  english: string;
  outputPath: string;
}

async function processWord(
  task: WordTask,
  total: number
): Promise<{ success: boolean; skipped: boolean }> {
  // Skip if file already exists
  if (fs.existsSync(task.outputPath)) {
    return { success: true, skipped: true };
  }

  const audioUrl = await getAudioUrl(task.spanish);

  if (!audioUrl) {
    console.log(
      `[${task.index + 1}/${total}] "${task.spanish}" -> NOT FOUND`
    );
    return { success: false, skipped: false };
  }

  const success = await downloadAudio(audioUrl, task.outputPath);

  if (success) {
    console.log(
      `[${task.index + 1}/${total}] "${task.spanish}" -> OK`
    );
  } else {
    console.log(
      `[${task.index + 1}/${total}] "${task.spanish}" -> DOWNLOAD FAILED`
    );
  }

  return { success, skipped: false };
}

async function main() {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}`);
  }

  console.log(`Downloading audio for ${words.length} words from SpanishDict.com...`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`Concurrent requests: ${CONCURRENT_REQUESTS}`);
  console.log("");

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  // Prepare all tasks
  const tasks: WordTask[] = words.map((word, index) => ({
    index,
    spanish: word.spanish,
    english: word.english,
    outputPath: path.join(OUTPUT_DIR, `${sanitizeFilename(word.english)}.mp3`),
  }));

  // Process in batches for controlled concurrency
  for (let i = 0; i < tasks.length; i += CONCURRENT_REQUESTS) {
    const batch = tasks.slice(i, i + CONCURRENT_REQUESTS);

    const results = await Promise.all(
      batch.map((task) => processWord(task, words.length))
    );

    for (const result of results) {
      if (result.skipped) {
        skipped++;
      } else if (result.success) {
        generated++;
      } else {
        failed++;
      }
    }

    // Rate limiting between batches
    if (i + CONCURRENT_REQUESTS < tasks.length) {
      await sleep(DELAY_BETWEEN_REQUESTS);
    }
  }

  console.log("");
  console.log("=== Summary ===");
  console.log(`Downloaded: ${generated}`);
  console.log(`Skipped (already exists): ${skipped}`);
  console.log(`Failed/Not found: ${failed}`);
  console.log(`Total: ${words.length}`);
}

main().catch(console.error);
