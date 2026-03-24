import { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { models } from './lib/models';
import { ChatMessage } from './components/ChatMessage';
import { ModelSelector } from './components/ModelSelector';
import { ChatInput } from './components/ChatInput';
import { MessageSquare, Plus, Moon, Sun, Trash2, Download, CreditCard as Edit2, Zap, Settings, Code2, Wand2, PenTool, Lightbulb, LogOut, Menu, X, Bot } from 'lucide-react';

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
  const [showPresets, setShowPresets] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const presets = [
    { name: 'Ultra-fast response', model: 'stepfun/step-3.5-flash:free' },
    { name: 'Best quality', model: 'nousresearch/hermes-3-llama-3.1-405b:free' },
    { name: 'Balanced (Speed+Quality)', model: 'qwen/qwen3-next-80b-a3b-instruct:free' },
    { name: 'Code generation', model: 'nvidia/nemotron-3-super-120b-a12b:free' },
    { name: 'Mobile/lightweight', model: 'meta-llama/llama-3.2-3b-instruct:free' },
    { name: 'Image analysis', model: 'nvidia/nemotron-nano-12b-v2-vl:free' },
    { name: 'Creative writing', model: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free' },
    { name: 'Structured output', model: 'google/gemma-3-27b-it:free' },
  ];

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
    <div className={`flex h-screen ${darkMode ? 'bg-gray-950' : 'bg-white'}`}>
      <div className={`${showSidebar ? 'w-60' : 'w-0'} ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-900'} text-white flex flex-col border-r transition-all duration-300 overflow-hidden`}>
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
        <div className={`border-b ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              {showSidebar ? <Menu size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex-1" />
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-950' : 'bg-white'}`}>
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-2xl px-4">
                <div className="mb-8">
                  <div className={`text-5xl mb-4 ${darkMode ? 'text-orange-500' : 'text-orange-600'}`}>✨</div>
                  <h1 className={`text-4xl font-light mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    Good <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>evening</span>
                  </h1>
                  <div className="flex items-center justify-center gap-2 mb-8">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Free plan</span>
                    <span className={darkMode ? 'text-gray-600' : 'text-gray-300'}>•</span>
                    <button className={`text-sm font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} transition-colors`}>
                      Upgrade
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                  <button className={`group flex flex-col items-center gap-2 p-4 rounded-lg transition-all ${
                    darkMode ? 'hover:bg-gray-800 border border-gray-800' : 'hover:bg-gray-50 border border-gray-100'
                  }`}>
                    <Code2 size={20} className={darkMode ? 'text-gray-400 group-hover:text-blue-400' : 'text-gray-600 group-hover:text-blue-600'} />
                    <span className={`text-xs ${darkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'}`}>Code</span>
                  </button>
                  <button className={`group flex flex-col items-center gap-2 p-4 rounded-lg transition-all ${
                    darkMode ? 'hover:bg-gray-800 border border-gray-800' : 'hover:bg-gray-50 border border-gray-100'
                  }`}>
                    <Wand2 size={20} className={darkMode ? 'text-gray-400 group-hover:text-purple-400' : 'text-gray-600 group-hover:text-purple-600'} />
                    <span className={`text-xs ${darkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'}`}>Create</span>
                  </button>
                  <button className={`group flex flex-col items-center gap-2 p-4 rounded-lg transition-all ${
                    darkMode ? 'hover:bg-gray-800 border border-gray-800' : 'hover:bg-gray-50 border border-gray-100'
                  }`}>
                    <PenTool size={20} className={darkMode ? 'text-gray-400 group-hover:text-cyan-400' : 'text-gray-600 group-hover:text-cyan-600'} />
                    <span className={`text-xs ${darkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'}`}>Write</span>
                  </button>
                  <button className={`group flex flex-col items-center gap-2 p-4 rounded-lg transition-all ${
                    darkMode ? 'hover:bg-gray-800 border border-gray-800' : 'hover:bg-gray-50 border border-gray-100'
                  }`}>
                    <Lightbulb size={20} className={darkMode ? 'text-gray-400 group-hover:text-yellow-400' : 'text-gray-600 group-hover:text-yellow-600'} />
                    <span className={`text-xs ${darkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'}`}>Learn</span>
                  </button>
                  <button className={`group flex flex-col items-center gap-2 p-4 rounded-lg transition-all ${
                    darkMode ? 'hover:bg-gray-800 border border-gray-800' : 'hover:bg-gray-50 border border-gray-100'
                  }`}>
                    <Zap size={20} className={darkMode ? 'text-gray-400 group-hover:text-orange-400' : 'text-gray-600 group-hover:text-orange-600'} />
                    <span className={`text-xs ${darkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'}`}>Presets</span>
                  </button>
                </div>

                <div className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                  Select a model and start chatting, or try one of the quick actions above
                </div>
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

        <div className={`border-t ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} p-6`}>
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <button
                      onClick={() => setShowPresets(!showPresets)}
                      className={`p-2.5 rounded-lg border transition-all ${
                        darkMode
                          ? 'border-gray-700 hover:bg-gray-800'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      title="Quick presets"
                    >
                      <Zap size={18} className="text-amber-500" />
                    </button>
                    {showPresets && (
                      <div className={`absolute left-0 bottom-12 w-64 rounded-lg shadow-xl z-50 border ${
                        darkMode
                          ? 'bg-gray-800 border-gray-700'
                          : 'bg-white border-gray-200'
                      }`}>
                        <div className="p-2 space-y-1">
                          {presets.map((preset) => (
                            <button
                              key={preset.model}
                              onClick={() => {
                                setSelectedModel(preset.model);
                                setShowPresets(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors flex items-start gap-3 ${
                                selectedModel === preset.model
                                  ? darkMode ? 'bg-blue-600/20 text-blue-400 border border-blue-600' : 'bg-blue-50 text-blue-600 border border-blue-200'
                                  : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                              }`}
                            >
                              <Zap size={14} className="mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="font-medium">{preset.name}</div>
                                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {preset.model.split('/')[1].split(':')[0]}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <ModelSelector
                      selectedModel={selectedModel}
                      onModelChange={setSelectedModel}
                    />
                  </div>
                </div>
              </div>
            )}
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} darkMode={darkMode} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
