import { Language, translations } from "./i18n";
export interface MirrorData {
  count: number;
  towardCount: number;
  awayCount: number;
  dominantPattern: string;
}

export function generateMirror(template: string, data: MirrorData): string {
  return template
    .replace(/\{count\}/g, String(data.count))
    .replace(/\{toward_count\}/g, String(data.towardCount))
    .replace(/\{away_count\}/g, String(data.awayCount))
    .replace(/\{dominant_pattern\}/g, data.dominantPattern);
}


export function getDominantPattern(
  towardCount: number,
  awayCount: number,
  lang: Language = "id"
): string {
  if (towardCount > awayCount) return "toward";
  if (awayCount > towardCount) return "away";
  return translations[lang].balanced;
}
