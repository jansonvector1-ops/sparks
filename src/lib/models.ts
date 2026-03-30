export interface Model {
  id: string;
  name: string;
  description: string;
  category: 'fast' | 'balanced' | 'powerful' | 'creative' | 'vision';
  badge?: string;
}

export const models: Model[] = [
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Llama 3.3 70B",
    description: "Meta's latest flagship — fast & capable",
    category: "balanced",
    badge: "Popular"
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
    id: "qwen/qwen3-30b-a3b:free",
    name: "Qwen3 30B",
    description: "Alibaba's strong reasoning model",
    category: "balanced",
    badge: "New"
  },
  {
    id: "nvidia/nemotron-3-super-120b-a12b:free",
    name: "Nemotron 120B",
    description: "NVIDIA's most powerful model",
    category: "powerful",
    badge: "Best for Code"
  },
  {
    id: "nousresearch/hermes-3-llama-3.1-405b:free",
    name: "Hermes 3 405B",
    description: "Massive NousResearch model",
    category: "powerful",
    badge: "Highest Quality"
  },
  {
    id: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    name: "Dolphin Mistral 24B",
    description: "Uncensored, great for creative tasks",
    category: "creative",
  },
  {
    id: "openai/gpt-oss-20b:free",
    name: "GPT OSS 20B",
    description: "OpenAI open-source variant",
    category: "balanced",
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
