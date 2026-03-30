import { Bot, User, Copy, Check, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  messageId?: string;
  onDelete?: (id: string) => void;
}

function parseMarkdown(text: string): string {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
      `<pre><code class="language-${lang}">${code.trim()}</code></pre>`)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^\> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^---$/gm, '<hr>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^\s*[-*+] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/^\s*\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hH\d]|<ul|<ol|<li|<pre|<block|<hr)(.+)$/gm, (m) =>
      m.startsWith('<') ? m : `<p>${m}</p>`)
    .replace(/<p><\/p>/g, '');
}

export function ChatMessage({ role, content, messageId, onDelete }: ChatMessageProps) {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex justify-end px-4 py-2 animate-fade-in group">
        <div className="flex items-end gap-2 max-w-[80%]">
          <div className="flex flex-col items-end gap-1">
            <div className="px-4 py-3 rounded-2xl rounded-br-sm bg-accent text-white text-sm leading-relaxed shadow-sm">
              {content}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-1">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              {messageId && onDelete && (
                <button
                  onClick={() => onDelete(messageId)}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-accent/20 text-accent flex items-center justify-center mb-6">
            <User size={14} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 px-4 py-2 animate-fade-in group">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-surface-3 border border-border flex items-center justify-center mt-0.5">
        <Bot size={14} className="text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm text-text-primary prose-message ${!content ? 'flex items-center gap-1' : ''}`}>
          {!content ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
            </>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }} />
          )}
        </div>
        {content && (
          <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            {messageId && onDelete && (
              <button
                onClick={() => onDelete(messageId)}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 size={12} />
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
