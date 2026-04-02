import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Square, ChevronDown, Check, ChevronRight } from 'lucide-react';
import { models, categoryLabels } from '../lib/models';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export function ChatInput({ onSendMessage, disabled, selectedModel, onModelChange }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentModel = models.find(m => m.id === selectedModel) ?? models[0];
  const categories = Array.from(new Set(models.map(m => m.category)));
  const filteredModels = selectedCategory ? models.filter(m => m.category === selectedCategory) : models;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setShowModelMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (showModelMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.top,
        left: rect.right + 1,
      });
    }
  }, [showModelMenu]);

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
      <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled}
          rows={1}
          data-testid="input-message"
          className="w-full bg-transparent resize-none outline-none text-xs sm:text-sm text-text-primary placeholder-text-muted disabled:opacity-50 leading-relaxed min-h-[24px] sm:min-h-[28px] max-h-[200px]"
        />
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-2 sm:px-3 pb-2 sm:pb-3 gap-2">
        {/* Model selector */}
        <div>
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setShowModelMenu(v => !v)}
            data-testid="button-model-selector"
            className="flex items-center gap-1 px-1.5 sm:px-2 py.5 rounded-lg text-[9px] sm:text-xs text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors flex-shrink-0"
          >
            <span className="font-medium truncate max-w-[80px] sm:max-w-[120px]">{currentModel.name.split(' ')[0]}</span>
            <ChevronDown size={9} className={`transition-transform flex-shrink-0 ${showModelMenu ? 'rotate-180' : ''}`} />
          </button>

          {showModelMenu && (
            <div 
              ref={menuRef}
              className="fixed rounded-xl border border-border bg-surface shadow-2xl z-50 animate-fade-in"
              style={{ top: `${menuPos.top}px`, left: `${menuPos.left}px`, transform: 'translateY(-50%)', width: '280px' }}
            >
              {/* Category tabs */}
              <div className="flex gap-1 p-2 border-b border-border flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === null
                      ? 'bg-accent text-white'
                      : 'bg-surface-2 text-text-secondary hover:text-text-primary'
                  }`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                      selectedCategory === cat
                        ? 'bg-accent text-white'
                        : 'bg-surface-2 text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {categoryLabels[cat]}
                  </button>
                ))}
              </div>

              {/* Model list */}
              <div className="max-h-[300px] overflow-y-auto py-1.5">
                {filteredModels.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => { onModelChange(m.id); setShowModelMenu(false); setSelectedCategory(null); }}
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
            </div>
          )}
        </div>

        {/* Send / Stop */}
        <button
          type="button"
          onClick={disabled ? undefined : handleSubmit}
          data-testid="button-send"
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
            disabled
              ? 'bg-surface-3 text-text-muted cursor-not-allowed'
              : input.trim()
              ? 'bg-accent text-white hover:bg-accent-hover shadow-sm'
              : 'bg-surface-3 text-text-muted cursor-not-allowed'
          }`}
        >
          {disabled ? <Square size={11} className="sm:hidden" /> : <ArrowUp size={13} className="sm:hidden" strokeWidth={2.5} />}
          {disabled ? <Square size={13} className="hidden sm:block" /> : <ArrowUp size={15} className="hidden sm:block" strokeWidth={2.5} />}
        </button>
      </div>
    </div>
  );
}
