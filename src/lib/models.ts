export interface Model {
  id: string;
  name: string;
  description: string;
  category: 'fast' | 'balanced' | 'powerful' | 'creative' | 'vision';
  badge?: string;
}

export const models: Model[] = [
  {
    id: "nvidia/nemotron-3-super-120b-a12b:free",
    name: "Nemotron 120B",
    description: "Code Master",
    category: "powerful",
    badge: "Best for Code"
  },
  {
    id: "nvidia/nemotron-3-nano-30b-a3b:free",
    name: "Nemotron 30B",
    description: "Quick & Smart",
    category: "fast",
    badge: "Recommended"
  },
];

export const categoryLabels: Record<Model['category'], string> = {
  fast: "⚡ Fast",
  balanced: "⚖️ Balanced",
  powerful: "🔥 Powerful",
  creative: "✨ Creative",
  vision: "👁️ Vision",
};
