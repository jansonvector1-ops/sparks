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
    description: "NVIDIA's most powerful — great for code & reasoning",
    category: "powerful",
    badge: "Best for Code"
  },
  {
    id: "nvidia/nemotron-3-nano-30b-a3b:free",
    name: "Nemotron 30B",
    description: "Fast NVIDIA model with strong performance",
    category: "fast",
    badge: "Recommended"
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Llama 3.3 70B",
    description: "Meta's latest flagship — capable & fast",
    category: "balanced",
    badge: "Popular"
  },
  {
    id: "meta-llama/llama-3.2-3b-instruct:free",
    name: "Llama 3.2 3B",
    description: "Lightweight & quick for simple tasks",
    category: "fast",
  },
  {
    id: "google/gemma-3-27b-it:free",
    name: "Gemma 3 27B",
    description: "Google's instruction-tuned model",
    category: "balanced",
  },
  {
    id: "google/gemma-3-12b-it:free",
    name: "Gemma 3 12B",
    description: "Efficient mid-size Google model",
    category: "fast",
  },
  {
    id: "nousresearch/hermes-3-llama-3.1-405b:free",
    name: "Hermes 3 405B",
    description: "Highest quality for complex tasks",
    category: "powerful",
    badge: "Highest Quality"
  },
  {
    id: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    name: "Dolphin Mistral 24B",
    description: "Great for creative & uncensored tasks",
    category: "creative",
  },
  {
    id: "stepfun/step-3.5-flash:free",
    name: "Step 3.5 Flash",
    description: "Ultra-fast responses",
    category: "fast",
    badge: "Fastest"
  },
  {
    id: "nvidia/nemotron-nano-12b-v2-vl:free",
    name: "Nemotron 12B Vision",
    description: "Multimodal vision-language model",
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
