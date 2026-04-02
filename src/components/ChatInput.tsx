import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Square, ChevronDown, Check } from 'lucide-react';
import { models } from '../lib/models';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export function ChatInput({ onSendMessage, disabled, selectedModel, onModelChange }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [showModelMenu, setShowModelMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentModel = models.find(m => m.id === selectedModel) ?? models[0];

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowModelMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
    <div className="rounded-2xl border border-border bg-surface-2 shadow-lg transition-shadow focus-within:border-border focus-within:shadow-xl overflow-hidden">
      {/* Textarea */}
      <div className="px-4 pt-4 pb-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled}
          rows={1}
          data-testid="input-message"
          className="w-full bg-transparent resize-none outline-none text-sm text-text-primary placeholder-text-muted disabled:opacity-50 leading-relaxed min-h-[28px] max-h-[200px]"
        />
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-3 pb-3">
        {/* Model selector */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowModelMenu(v => !v)}
            data-testid="button-model-selector"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors"
          >
            <span className="font-medium">{currentModel.name}</span>
            <ChevronDown size={11} className={`transition-transform ${showModelMenu ? 'rotate-180' : ''}`} />
          </button>

          {showModelMenu && (
            <div className="absolute bottom-full left-0 mb-2 w-64 rounded-xl border border-border bg-surface shadow-2xl z-50 py-1.5 animate-fade-in">
              {models.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => { onModelChange(m.id); setShowModelMenu(false); }}
                  data-testid={`button-model-${m.id}`}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-surface-2 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-text-primary truncate">{m.name}</span>
                      {m.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-accent/15 text-accent font-medium flex-shrink-0">
                          {m.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-muted truncate mt-0.5">{m.description}</p>
                  </div>
                  {m.id === selectedModel && (
                    <Check size={13} className="text-accent flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Send / Stop */}
        <button
          type="button"
          onClick={disabled ? undefined : handleSubmit}
          data-testid="button-send"
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
            disabled
              ? 'bg-surface-3 text-text-muted cursor-not-allowed'
              : input.trim()
              ? 'bg-accent text-white hover:bg-accent-hover shadow-sm'
              : 'bg-surface-3 text-text-muted cursor-not-allowed'
          }`}
        >
          {disabled ? <Square size={13} /> : <ArrowUp size={15} strokeWidth={2.5} />}
        </button>
      </div>
    </div>
  );
}
