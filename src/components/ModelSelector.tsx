import { models } from '../lib/models';
import { Sparkles } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  darkMode?: boolean;
}

export function ModelSelector({ selectedModel, onModelChange, darkMode }: ModelSelectorProps) {
  return (
    <div className="flex items-center gap-3 flex-1">
      <Sparkles size={20} className="text-blue-600 flex-shrink-0" />
      <select
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-colors ${
          darkMode
            ? 'bg-gray-800 border-gray-700 text-white'
            : 'bg-white border-gray-300 text-black'
        }`}
      >
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name} - {model.description}
          </option>
        ))}
      </select>
    </div>
  );
}
