import { useRef, useState, useCallback } from "react";

/**
 * Sanitizes a string to match the filename format used during audio generation.
 */
function sanitizeFilename(str: string): string {
  return str
    .toLowerCase()
    .replace(/[/\\]/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function useAudioPlayback() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = useCallback((englishWord: string) => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const filename = sanitizeFilename(englishWord);
    const audio = new Audio(`/audio/${filename}.mp3`);
    audioRef.current = audio;

    audio.addEventListener("play", () => setIsPlaying(true));
    audio.addEventListener("ended", () => setIsPlaying(false));
    audio.addEventListener("pause", () => setIsPlaying(false));
    audio.addEventListener("error", () => setIsPlaying(false));

    audio.play().catch((error) => {
      console.error("Failed to play audio:", error);
      setIsPlaying(false);
    });
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  }, []);

  return { play, stop, isPlaying };
}
