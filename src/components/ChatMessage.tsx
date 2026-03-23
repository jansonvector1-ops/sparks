import { Bot, User, Copy, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  messageId?: string;
  onDelete?: (id: string) => void;
  darkMode?: boolean;
}

export function ChatMessage({ role, content, messageId, onDelete, darkMode }: ChatMessageProps) {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-4 p-4 group ${
      isUser
        ? darkMode ? 'bg-gray-900' : 'bg-white'
        : darkMode ? 'bg-gray-800/50' : 'bg-gray-50'
    }`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
      }`}>
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <p className={`whitespace-pre-wrap leading-relaxed ${
          darkMode ? 'text-gray-100' : 'text-gray-800'
        }`}>
          {content}
        </p>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Copy size={14} />
            {copied ? 'Copied!' : 'Copy'}
          </button>
          {messageId && onDelete && (
            <button
              onClick={() => onDelete(messageId)}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
