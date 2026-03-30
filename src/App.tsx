import { useState, useEffect, useRef } from 'react';
import {
  fetchConversations,
  fetchMessages,
  createConversation,
  updateConversation,
  deleteConversation as apiDeleteConversation,
  createMessage,
  deleteMessage as apiDeleteMessage,
  streamChat,
  type Message,
  type Conversation,
} from './lib/api';
import { models } from './lib/models';
import { ChatMessage } from './components/ChatMessage';
import { ModelSelector } from './components/ModelSelector';
import { ChatInput } from './components/ChatInput';
import {
  MessageSquare, Plus, Moon, Sun, Trash2, Download,
  PenLine, Zap, Code2, Wand2, PenTool, Lightbulb, Menu, X, Sparkles
} from 'lucide-react';

function App() {
  const [selectedModel, setSelectedModel] = useState(models[0].id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [darkMode, setDarkMode] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [darkMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const data = await fetchConversations();
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const data = await fetchMessages(conversationId);
      setMessages(data);
      setCurrentConversation(conversationId);
      const conv = conversations.find(c => c.id === conversationId);
      if (conv) setSelectedModel(conv.model);
    } catch (err) {
      console.error('Failed to load conversation', err);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversation(null);
  };

  const deleteConversation = async (id: string) => {
    try {
      await apiDeleteConversation(id);
      await loadConversations();
      if (currentConversation === id) startNewConversation();
    } catch (err) {
      console.error('Failed to delete conversation', err);
    }
  };

  const renameConversation = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    try {
      await updateConversation(id, newTitle);
      await loadConversations();
      setRenamingId(null);
    } catch (err) {
      console.error('Failed to rename', err);
    }
  };

  const exportChat = () => {
    const data = JSON.stringify({ model: selectedModel, messages, timestamp: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${Date.now()}.json`;
    a.click();
  };

  const deleteMessage = async (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
    if (currentConversation) {
      try { await apiDeleteMessage(messageId); } catch {}
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    let conversationId = currentConversation;

    if (!conversationId) {
      try {
        const newConv = await createConversation(content.slice(0, 50), selectedModel);
        conversationId = newConv.id;
        setCurrentConversation(conversationId);
        await loadConversations();
      } catch {
        return;
      }
    }

    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try { await createMessage(conversationId!, 'user', content); } catch {}

    const assistantId = crypto.randomUUID();
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

    try {
      const msgHistory = [...messages, userMessage].map(m => ({ role: m.role, content: m.content }));
      if (systemPrompt) msgHistory.unshift({ role: 'system', content: systemPrompt });

      const stream = await streamChat(selectedModel, msgHistory);
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
            const delta = parsed.choices?.[0]?.delta?.content || '';
            if (delta) {
              fullResponse += delta;
              setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: fullResponse } : m));
            }
          } catch {}
        }
      }

      if (conversationId && fullResponse) {
        await createMessage(conversationId, 'assistant', fullResponse);
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Something went wrong. Please try again.';
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content: `⚠️ ${errMsg}` } : m
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { icon: <Code2 size={18} />, label: 'Code', prompt: 'Help me write code for: ', color: 'text-blue-500' },
    { icon: <Wand2 size={18} />, label: 'Create', prompt: 'Create: ', color: 'text-purple-500' },
    { icon: <PenTool size={18} />, label: 'Write', prompt: 'Write: ', color: 'text-cyan-500' },
    { icon: <Lightbulb size={18} />, label: 'Explain', prompt: 'Explain: ', color: 'text-amber-500' },
    { icon: <Zap size={18} />, label: 'Summarize', prompt: 'Summarize: ', color: 'text-emerald-500' },
  ];

  return (
    <div className="flex h-screen bg-surface text-text-primary overflow-hidden">

      {/* Sidebar */}
      <aside className={`${showSidebar ? 'w-64' : 'w-0'} flex-shrink-0 transition-all duration-300 overflow-hidden border-r border-border bg-surface-2 flex flex-col`}>
        <div className="p-3 space-y-2 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2 px-1 py-1 mb-1">
            <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center">
              <Sparkles size={14} className="text-accent" />
            </div>
            <span className="font-semibold text-sm text-text-primary">AI Chat</span>
          </div>
          <button
            onClick={startNewConversation}
            className="w-full flex items-center gap-2 px-3 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            <Plus size={15} />
            New conversation
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-surface placeholder-text-muted text-text-primary focus:outline-none focus:border-accent/40 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {filteredConversations.length === 0 ? (
            <p className="text-xs text-text-muted px-3 py-4 text-center">No conversations yet</p>
          ) : (
            filteredConversations.map(conv => (
              <div key={conv.id} className={`group rounded-xl transition-colors ${currentConversation === conv.id ? 'bg-surface-3' : 'hover:bg-surface-3'}`}>
                {renamingId === conv.id ? (
                  <div className="flex gap-1.5 p-2">
                    <input
                      value={renameText}
                      onChange={e => setRenameText(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:border-accent/40"
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === 'Enter') renameConversation(conv.id, renameText);
                        if (e.key === 'Escape') setRenamingId(null);
                      }}
                    />
                    <button onClick={() => renameConversation(conv.id, renameText)} className="text-xs px-2 py-1 bg-accent text-white rounded-lg">Save</button>
                  </div>
                ) : (
                  <div
                    onClick={() => loadConversation(conv.id)}
                    className="w-full text-left px-3 py-2.5 flex items-center gap-2 cursor-pointer"
                  >
                    <MessageSquare size={13} className="flex-shrink-0 text-text-muted" />
                    <span className="text-xs truncate flex-1 text-text-primary">{conv.title}</span>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={e => { e.stopPropagation(); setRenamingId(conv.id); setRenameText(conv.title); }}
                        className="p-1 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text-primary"
                      >
                        <PenLine size={11} />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); deleteConversation(conv.id); }}
                        className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/30 text-text-muted hover:text-red-500"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-border flex-shrink-0">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-text-secondary hover:bg-surface-3 transition-colors"
          >
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            {darkMode ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface flex-shrink-0">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-surface-2 transition-colors text-text-secondary"
          >
            {showSidebar ? <X size={16} /> : <Menu size={16} />}
          </button>
          <div className="flex-1 min-w-0">
            {currentConversation && (
              <p className="text-sm font-medium truncate text-text-primary">
                {conversations.find(c => c.id === currentConversation)?.title ?? 'Conversation'}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={exportChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
              >
                <Download size={13} />
                Export
              </button>
            )}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-surface-2 transition-colors text-text-secondary"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-6 py-12 animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-5">
                <Sparkles size={24} className="text-accent" />
              </div>
              <h1 className="text-2xl font-semibold text-text-primary mb-2">What can I help with?</h1>
              <p className="text-sm text-text-secondary mb-10 text-center max-w-sm">
                Choose a model below and start a conversation, or try one of the quick actions.
              </p>
              <div className="grid grid-cols-5 gap-2 mb-10 w-full max-w-lg">
                {quickActions.map(action => (
                  <button
                    key={action.label}
                    onClick={() => handleSendMessage(action.prompt)}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-border hover:border-accent/30 hover:bg-surface-2 transition-all group"
                  >
                    <span className={`${action.color} group-hover:scale-110 transition-transform`}>{action.icon}</span>
                    <span className="text-xs font-medium text-text-secondary">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full py-6 space-y-1">
              {messages.map(message => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  messageId={message.id}
                  onDelete={deleteMessage}
                />
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 px-4 pb-4 pt-2 bg-surface border-t border-border">
          <div className="max-w-3xl mx-auto space-y-2">
            <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
            <p className="text-center text-[11px] text-text-muted">
              AI can make mistakes — verify important information.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
