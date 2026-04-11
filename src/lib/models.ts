export interface Model {
  id: string;
  name: string;
  description: string;
  category: 'fast' | 'balanced' | 'powerful' | 'creative' | 'vision';
  badge?: string;
}

export const models: Model[] = [
  {
    id: "meta-llama/llama-3.2-3b-instruct:free",
    name: "Llama 3.2 3B",
    description: "Fast & free lightweight model",
    category: "fast",
    badge: "Fastest"
  },
  {
    id: "meta-llama/llama-3.1-405b-instruct:free",
    name: "Llama 3.1 405B",
    description: "Free powerful model",
    category: "powerful",
    badge: "Popular"
  },
  {
    id: "meta-llama/llama-3.2-90b-vision-instruct:free",
    name: "Llama 3.2 90B Vision",
    description: "Free vision model",
    category: "vision",
  },
];

export const categoryLabels: Record<Model['category'], string> = {
  fast: "⚡ Fast",
  balanced: "⚖️ Balanced",
  powerful: "🔥 Powerful",
  creative: "✨ Creative",
  vision: "👁️ Vision",
};

/** Strip provider prefix and "(free)" from API model names */
export function cleanModelName(rawName: string): string {
  let name = rawName;
  name = name.replace(/^[^:]+:\s+/, '');
  name = name.replace(/\s*\(free\)\s*/gi, '').trim();
  return name;
}

/** Emoji badges for a model based on its ID and optional context length */
export function getModelBadges(id: string, contextLength?: number): string[] {
  const s = id.toLowerCase();
  const badges: string[] = [];
  if (/r1|qwq|thinking/.test(s)) badges.push('🧠');
  if (/code|coder/.test(s)) badges.push('💻');
  if (/[/-]vl[/-:]|vision/.test(s)) badges.push('👁️');
  if (/gemma|llama|mistral|qwen|aya|command/.test(s)) badges.push('🇹🇳');
  if (contextLength !== undefined) {
    if (contextLength < 32_000) badges.push('⚡');
    if (contextLength > 100_000) badges.push('🔥');
  }
  return badges;
}

/** True if model is likely to support Tamil well */
export function isTamilModel(id: string): boolean {
  return /gemma|llama|mistral|qwen|aya|command/.test(id.toLowerCase());
}
