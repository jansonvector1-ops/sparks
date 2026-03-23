import { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { models } from './lib/models';
import { ChatMessage } from './components/ChatMessage';
import { ModelSelector } from './components/ModelSelector';
import { ChatInput } from './components/ChatInput';
import { MessageSquare, Plus, Moon, Sun, Trash2, Download, CreditCard as Edit2, X } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  model: string;
}

function App() {
  const [selectedModel, setSelectedModel] = useState(models[0].id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const { data } = await supabase
      .from('conversations')
      .select('id, title, model')
      .order('updated_at', { ascending: false })
      .limit(10);

    if (data) {
      setConversations(data);
    }
  };

  const loadConversation = async (conversationId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('id, role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
      setCurrentConversation(conversationId);

      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        setSelectedModel(conversation.model);
      }
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversation(null);
  };

  const deleteConversation = async (id: string) => {
    await supabase.from('conversations').delete().eq('id', id);
    await loadConversations();
    if (currentConversation === id) {
      startNewConversation();
    }
  };

  const renameConversation = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    await supabase.from('conversations').update({ title: newTitle }).eq('id', id);
    await loadConversations();
    setRenamingId(null);
  };

  const exportChat = () => {
    const chatData = {
      model: selectedModel,
      messages,
      timestamp: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(chatData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-${Date.now()}.json`;
    link.click();
  };

  const deleteMessage = async (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    if (currentConversation) {
      await supabase.from('messages').delete().eq('id', messageId);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    let conversationId = currentConversation;

    if (!conversationId) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          title: content.slice(0, 50),
          model: selectedModel,
        })
        .select()
        .single();

      if (newConv) {
        conversationId = newConv.id;
        setCurrentConversation(conversationId);
        await loadConversations();
      }
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    if (conversationId) {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content,
      });
    }

    const assistantMessageId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: assistantMessageId, role: 'assistant', content: '' },
    ]);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      const messagesForAPI = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      if (systemPrompt) {
        messagesForAPI.unshift({
          role: 'system',
          content: systemPrompt,
        });
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: messagesForAPI,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from API');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  fullResponse += content;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: fullResponse }
                        : msg
                    )
                  );
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        }
      }

      if (conversationId && fullResponse) {
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: fullResponse,
        });

        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: 'Error: Failed to get response. Please try again.' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-950' : 'bg-gray-100'}`}>
      <div className={`w-64 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-900'} text-white flex flex-col border-r`}>
        <div className="p-3 space-y-3 border-b border-gray-800">
          <button
            onClick={startNewConversation}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium text-sm"
          >
            <Plus size={16} />
            New Chat
          </button>
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <p className="text-xs text-gray-500 p-3">No conversations</p>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`group rounded-lg transition-colors ${
                  currentConversation === conv.id
                    ? 'bg-gray-800'
                    : 'hover:bg-gray-800'
                }`}
              >
                {renamingId === conv.id ? (
                  <div className="p-2 flex gap-2">
                    <input
                      type="text"
                      value={renameText}
                      onChange={(e) => setRenameText(e.target.value)}
                      className="flex-1 px-2 py-1 bg-gray-700 rounded text-sm text-white focus:outline-none"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') renameConversation(conv.id, renameText);
                        if (e.key === 'Escape') setRenamingId(null);
                      }}
                    />
                    <button
                      onClick={() => renameConversation(conv.id, renameText)}
                      className="px-2 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => loadConversation(conv.id)}
                    className="w-full text-left px-3 py-2 flex items-start gap-2 group-hover:opacity-100"
                  >
                    <MessageSquare size={14} className="mt-1 flex-shrink-0" />
                    <span className="text-sm truncate flex-1">{conv.title}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenamingId(conv.id);
                          setRenameText(conv.title);
                        }}
                        className="p-1 hover:bg-gray-700 rounded"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                        className="p-1 hover:bg-red-600 rounded"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-gray-800">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            {darkMode ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className={`border-b ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="max-w-4xl mx-auto px-4 py-3 space-y-3">
            <div className="flex items-center gap-3">
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
              />
              {messages.length > 0 && (
                <button
                  onClick={exportChat}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Export chat"
                >
                  <Download size={18} />
                </button>
              )}
            </div>
            <div>
              <label className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                System Prompt (optional)
              </label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Add system instructions for the AI..."
                className={`w-full mt-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-black'
                }`}
                rows={2}
              />
            </div>
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-950' : 'bg-white'}`}>
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">Start a conversation</p>
                <p className="text-sm mt-2">Choose a model and send a message to begin</p>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  messageId={message.id}
                  onDelete={deleteMessage}
                  darkMode={darkMode}
                />
              ))}
              {isLoading && (
                <div className={`flex gap-4 p-4 ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-700 text-white`}>
                    <Bot size={18} />
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '100ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '200ms' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className={`border-t ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
}

export default App;
