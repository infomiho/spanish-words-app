/**
 * Audio generation script for Spanish vocabulary pronunciation.
 * Uses ElevenLabs API to generate MP3 files for all Spanish words.
 *
 * Usage:
 *   pnpm generate-audio
 *
 * Environment (via .env.local):
 *   ELEVENLABS_API_KEY - Your ElevenLabs API key (required)
 *   ELEVENLABS_VOICE_ID - Voice ID to use (required)
 *
 * Features:
 *   - Reads API key from .env.local
 *   - Skips already generated files (resume capability)
 *   - Rate limiting (2 requests per second for free tier)
 *   - Progress reporting
 *   - Uses English word as filename for stability (indexes may change)
 */

import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";
import { words } from "../src/lib/list";

// Load environment variables from .env.local
config({ path: ".env.local" });

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

const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
const OUTPUT_DIR = path.join(process.cwd(), "public", "audio");

// ElevenLabs API configuration
const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

// Rate limiting: 2 requests per second for free tier
const DELAY_BETWEEN_REQUESTS = 500; // ms

interface ElevenLabsError {
  detail?: {
    message?: string;
    status?: string;
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateAudio(
  text: string,
  outputPath: string
): Promise<boolean> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY!,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const error = (await response.json()) as ElevenLabsError;
      console.error(`Error for "${text}":`, error.detail?.message || error);
      return false;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(outputPath, buffer);
    return true;
  } catch (error) {
    console.error(`Failed to generate audio for "${text}":`, error);
    return false;
  }
}

async function main() {
  if (!API_KEY || !VOICE_ID) {
    console.error("Error: ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID are required");
    console.error("");
    console.error("Add them to .env.local:");
    console.error("  ELEVENLABS_API_KEY=your_api_key");
    console.error("  ELEVENLABS_VOICE_ID=your_voice_id");
    console.error("");
    console.error("Then run: pnpm generate-audio");
    process.exit(1);
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}`);
  }

  console.log(`Generating audio for ${words.length} words...`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`Voice ID: ${VOICE_ID}`);
  console.log("");

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const filename = sanitizeFilename(word.english);
    const outputPath = path.join(OUTPUT_DIR, `${filename}.mp3`);

    // Skip if file already exists (resume capability)
    if (fs.existsSync(outputPath)) {
      skipped++;
      continue;
    }

    process.stdout.write(
      `[${i + 1}/${words.length}] Generating: "${word.spanish}" -> ${filename}.mp3... `
    );

    const success = await generateAudio(word.spanish, outputPath);

    if (success) {
      generated++;
      console.log("OK");
    } else {
      failed++;
      console.log("FAILED");
    }

    // Rate limiting
    if (i < words.length - 1) {
      await sleep(DELAY_BETWEEN_REQUESTS);
    }
  }

  console.log("");
  console.log("=== Summary ===");
  console.log(`Generated: ${generated}`);
  console.log(`Skipped (already exists): ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${words.length}`);
}

main().catch(console.error);
