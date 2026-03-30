import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Square } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
  onStop?: () => void;
}

export function ChatInput({ onSendMessage, disabled, onStop }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-end gap-3 p-3 rounded-2xl border border-border bg-surface-2 shadow-sm transition-shadow focus-within:shadow-md focus-within:border-accent/40">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message... (Shift+Enter for new line)"
        disabled={disabled}
        rows={1}
        className="flex-1 bg-transparent resize-none outline-none text-sm text-text-primary placeholder-text-muted disabled:opacity-50 leading-relaxed min-h-[24px] max-h-[200px] py-0.5"
      />
      <button
        onClick={disabled ? onStop : handleSubmit}
        className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
          disabled
            ? 'bg-text-secondary/20 text-text-secondary hover:bg-text-secondary/30'
            : input.trim()
            ? 'bg-accent text-white hover:bg-accent-hover shadow-sm shadow-accent/30'
            : 'bg-surface-3 text-text-muted cursor-not-allowed'
        }`}
      >
        {disabled ? <Square size={14} /> : <ArrowUp size={16} strokeWidth={2.5} />}
      </button>
    </div>
  );
}
