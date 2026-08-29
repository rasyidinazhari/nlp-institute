export interface KeywordEntry {
  phrase: string;
  direction: string; // "toward" | "away"
}

export interface DetectionResult {
  direction: "toward" | "away" | "neutral";
  towardMatches: string[];
  awayMatches: string[];
  towardCount: number;
  awayCount: number;
}

export function detectPattern(
  text: string,
  keywords: KeywordEntry[]
): DetectionResult {
  const lowerText = text.toLowerCase();

  // Sort by phrase length descending: multi-word matches first
  // e.g. "supaya tidak" matched before "tidak"
  const sorted = [...keywords].sort(
    (a, b) => b.phrase.length - a.phrase.length
  );

  const towardMatches: string[] = [];
  const awayMatches: string[] = [];
  let remaining = lowerText;

  for (const kw of sorted) {
    const phrase = kw.phrase.toLowerCase();
    // Check if phrase exists in remaining text
    if (remaining.includes(phrase)) {
      if (kw.direction === "toward") {
        towardMatches.push(kw.phrase);
      } else {
        awayMatches.push(kw.phrase);
      }
      // Remove matched phrase to avoid double-counting
      remaining = remaining.replace(phrase, " ");
    }
  }

  const towardCount = towardMatches.length;
  const awayCount = awayMatches.length;

  let direction: "toward" | "away" | "neutral";
  if (towardCount === 0 && awayCount === 0) {
    direction = "neutral";
  } else if (towardCount > awayCount) {
    direction = "toward";
  } else if (awayCount > towardCount) {
    direction = "away";
  } else {
    direction = "neutral";
  }

  return { direction, towardMatches, awayMatches, towardCount, awayCount };
}
