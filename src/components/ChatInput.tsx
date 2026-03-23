import { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
  darkMode?: boolean;
}

export function ChatInput({ onSendMessage, disabled, darkMode }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={disabled}
          className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:cursor-not-allowed transition-colors ${
            darkMode
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 disabled:bg-gray-900'
              : 'bg-white border-gray-300 text-black placeholder-gray-500 disabled:bg-gray-100'
          }`}
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
        >
          <Send size={18} />
          Send
        </button>
      </form>
    </div>
  );
}
