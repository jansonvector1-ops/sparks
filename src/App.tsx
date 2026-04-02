import { useState, useEffect, useRef } from 'react';
import {
  fetchConversations, fetchMessages, createConversation,
  updateConversation, deleteConversation as apiDeleteConversation,
  createMessage, deleteMessage as apiDeleteMessage, streamChat,
  type Message, type Conversation,
} from './lib/api';
import { models } from './lib/models';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { Settings, DEFAULT_SETTINGS, type AppSettings } from './components/Settings';
import {
  SquarePen, Search, MessageSquare, Trash2, PenLine, Settings as SettingsIcon,
  PanelLeft, X
} from 'lucide-react';

function App() {
  // Settings (persisted)
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('ai-chat-settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch { return DEFAULT_SETTINGS; }
  });
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Chat state
  const [selectedModel, setSelectedModel] = useState(models[0].id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Sidebar state
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Apply theme from settings
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      if (mq.matches) root.classList.add('dark');
      else root.classList.remove('dark');
      const handler = (e: MediaQueryListEvent) => {
        if (e.matches) root.classList.add('dark');
        else root.classList.remove('dark');
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [settings.theme]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => { loadConversations(); }, []);

  const loadConversations = async () => {
    try { setConversations(await fetchConversations()); } catch {}
  };

  const loadConversation = async (id: string) => {
    try {
      const data = await fetchMessages(id);
      setMessages(data);
      setCurrentConversation(id);
      const conv = conversations.find(c => c.id === id);
      if (conv) setSelectedModel(conv.model);
    } catch {}
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentConversation(null);
  };

  const deleteConversation = async (id: string) => {
    try {
      await apiDeleteConversation(id);
      await loadConversations();
      if (currentConversation === id) startNewChat();
    } catch {}
  };

  const renameConversation = async (id: string, title: string) => {
    if (!title.trim()) return;
    try {
      await updateConversation(id, title);
      await loadConversations();
      setRenamingId(null);
    } catch {}
  };

  const deleteMessageItem = async (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
    if (currentConversation) {
      try { await apiDeleteMessage(messageId); } catch {}
    }
  };

  const handleSaveSettings = (s: AppSettings) => {
    setSettings(s);
    localStorage.setItem('ai-chat-settings', JSON.stringify(s));
  };

  const exportConversations = () => {
    const data = JSON.stringify({ conversations, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `ai-chat-export-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllHistory = async () => {
    if (!confirm('Delete all conversations? This cannot be undone.')) return;
    for (const c of conversations) {
      try { await apiDeleteConversation(c.id); } catch {}
    }
    setConversations([]);
    startNewChat();
  };

  const fontSizeClass = settings.fontSize === 'sm' ? 'text-xs' : settings.fontSize === 'lg' ? 'text-base' : 'text-sm';

  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Auto-retry chat with model fallback ──────────────────────────────────
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    let conversationId = currentConversation;
    if (!conversationId) {
      try {
        const newConv = await createConversation(content.slice(0, 60), selectedModel);
        conversationId = newConv.id;
        setCurrentConversation(conversationId);
        await loadConversations();
      } catch { return; }
    }

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    try { await createMessage(conversationId!, 'user', content); } catch {}

    const assistantId = crypto.randomUUID();
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

    // Build message history with optional system prompt
    const msgHistory = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
    if (settings.systemPrompt) msgHistory.unshift({ role: 'system', content: settings.systemPrompt });

    // Try models in order — skip silently on 429 rate-limit
    const modelQueue = [
      selectedModel,
      ...models.filter(m => m.id !== selectedModel).map(m => m.id),
    ];

    let usedModel: string | null = null;

    for (let i = 0; i < modelQueue.length; i++) {
      const modelId = modelQueue[i];
      try {
        const stream = await streamChat(modelId, msgHistory, {
          temperature: settings.temperature,
          topP: settings.topP,
          maxTokens: settings.maxTokens,
          presencePenalty: settings.presencePenalty,
          frequencyPenalty: settings.frequencyPenalty,
        });

        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content ?? '';
              if (delta) {
                fullResponse += delta;
                setMessages(prev => prev.map(m =>
                  m.id === assistantId ? { ...m, content: fullResponse } : m
                ));
              }
            } catch {}
          }
        }

        usedModel = modelId;
        if (conversationId && fullResponse) {
          await createMessage(conversationId, 'assistant', fullResponse);
        }
        break; // success — stop trying

      } catch (err: any) {
        if ((err as any).statusCode === 429 && i < modelQueue.length - 1) {
          // Rate-limited — silently try next model
          continue;
        }
        // Final error
        const msg = err?.message ?? 'Something went wrong. Please try again.';
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: `⚠️ ${msg}` } : m
        ));
        break;
      }
    }

    // If we fell back to a different model, update the selector
    if (usedModel && usedModel !== selectedModel) {
      setSelectedModel(usedModel);
    }

    setIsLoading(false);
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className={`flex h-screen bg-surface text-text-primary overflow-hidden ${fontSizeClass}`}>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className={`${showSidebar ? 'w-56' : 'w-0'} flex-shrink-0 transition-all duration-200 overflow-hidden border-r border-border bg-surface-2 flex flex-col`}
      >
        {/* Logo */}
        <div className="px-4 pt-5 pb-3 flex-shrink-0">
          <span className="font-mono font-bold text-base tracking-tight text-text-primary select-none">
            AI Chat
          </span>
        </div>

        {/* Nav items */}
        <div className="px-2 space-y-0.5 flex-shrink-0">
          <button
            onClick={startNewChat}
            data-testid="button-new-chat"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors"
          >
            <SquarePen size={15} />
            New chat
          </button>
          <button
            onClick={() => setShowSearch(v => !v)}
            data-testid="button-search"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors"
          >
            <Search size={15} />
            Search
          </button>
        </div>

        {/* Search input */}
        {showSearch && (
          <div className="px-2 mt-1 animate-fade-in">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-border bg-surface placeholder-text-muted text-text-primary focus:outline-none focus:border-accent/40 transition-colors"
            />
          </div>
        )}

        {/* Conversations */}
        <div className="mt-4 px-3 mb-1 flex-shrink-0">
          <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">Conversations</span>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
          {filteredConversations.length === 0 ? (
            <p className="text-xs text-text-muted px-3 py-3">No conversations yet</p>
          ) : filteredConversations.map(conv => (
            <div
              key={conv.id}
              className={`group rounded-xl transition-colors ${currentConversation === conv.id ? 'bg-surface-3' : 'hover:bg-surface-3'}`}
            >
              {renamingId === conv.id ? (
                <div className="flex gap-1 p-2">
                  <input
                    value={renameText}
                    onChange={e => setRenameText(e.target.value)}
                    autoFocus
                    className="flex-1 px-2 py-1 text-xs rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:border-accent/40"
                    onKeyDown={e => {
                      if (e.key === 'Enter') renameConversation(conv.id, renameText);
                      if (e.key === 'Escape') setRenamingId(null);
                    }}
                  />
                  <button onClick={() => renameConversation(conv.id, renameText)} className="text-[11px] px-2 bg-accent text-white rounded-lg">OK</button>
                </div>
              ) : (
                <div
                  onClick={() => loadConversation(conv.id)}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer"
                >
                  <MessageSquare size={12} className="flex-shrink-0 text-text-muted" />
                  <span className="text-xs truncate flex-1 text-text-primary">{conv.title}</span>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); setRenamingId(conv.id); setRenameText(conv.title); }}
                      className="p-1 rounded-md hover:bg-surface-2 text-text-muted hover:text-text-primary"
                    >
                      <PenLine size={11} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); deleteConversation(conv.id); }}
                      className="p-1 rounded-md hover:bg-surface-2 text-text-muted hover:text-red-400"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* Top bar */}
        <header className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2.5 z-10">
          <button
            onClick={() => setShowSidebar(v => !v)}
            data-testid="button-sidebar-toggle"
            className="w-8 h-8 flex items-center justify-center rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
          >
            {showSidebar ? <X size={16} /> : <PanelLeft size={16} />}
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            data-testid="button-settings"
            className="w-8 h-8 flex items-center justify-center rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
          >
            <SettingsIcon size={16} />
          </button>
        </header>

        {/* Messages or empty state */}
        <div className="flex-1 overflow-y-auto pt-14 pb-2">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-6 select-none animate-fade-in">
              <h1 className="font-mono font-bold text-3xl tracking-tight text-text-primary mb-2">AI Chat</h1>
              <p className="text-sm text-text-muted">Type a message to get started</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full py-6 space-y-1 px-4">
              {messages.map(message => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  messageId={message.id}
                  onDelete={deleteMessageItem}
                />
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 px-4 pb-5 pt-2">
          <div className="max-w-3xl mx-auto">
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isLoading}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
            <p className="text-center text-[11px] text-text-muted mt-2.5">
              Press <kbd className="px-1 py-0.5 rounded bg-surface-3 border border-border font-mono text-[10px]">Enter</kbd> to send,&nbsp;
              <kbd className="px-1 py-0.5 rounded bg-surface-3 border border-border font-mono text-[10px]">Shift+Enter</kbd> for new line
            </p>
          </div>
        </div>
      </div>

      {/* ── Settings modal ───────────────────────────────────────────────── */}
      {settingsOpen && (
        <Settings
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setSettingsOpen(false)}
          onExport={exportConversations}
          onClearHistory={clearAllHistory}
        />
      )}
    </div>
  );
}

export default App;
