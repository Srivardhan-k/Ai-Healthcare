import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { ArrowLeft, Send, Loader2, AlertCircle, MessageCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { api } from "../../api/client";

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// Dynamic API URL helper (same as in client.ts)
function getBaseURL(): string {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  const hostname = window.location.hostname;
  const port = 5001;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://localhost:${port}/api`;
  }
  return `http://${hostname}:${port}/api`;
}

export function ChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      type: 'system',
      content: 'Hello! I\'m your MediGuard health assistant. Ask me anything about fitness, nutrition, or general health tips!',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ollmaStatus, setOllamaStatus] = useState<'checking' | 'available' | 'offline'>('checking');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check Ollama availability on mount
  useEffect(() => {
    const checkOllama = async () => {
      try {
        const response = await fetch(`${getBaseURL()}/chat/health-check`);
        const data = await response.json();
        setOllamaStatus(data.ollama_available ? 'available' : 'offline');
      } catch {
        setOllamaStatus('offline');
      }
    };

    checkOllama();
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('chatHistory');
      if (saved) {
        const parsed = JSON.parse(saved);
        const messages_with_dates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messages_with_dates);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  }, []);

  // Save chat to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    } catch (err) {
      console.error('Failed to save chat history:', err);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    if (ollmaStatus === 'offline') {
      setError('AI service is offline. Please run: ollama run llama3');
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${getBaseURL()}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputValue }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.reply || data.message || 'No response generated',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: '0',
        type: 'system',
        content: 'Hello! I\'m your MediGuard health assistant. Ask me anything about fitness, nutrition, or general health tips!',
        timestamp: new Date()
      }
    ]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                Health Assistant
              </h1>
              <p className="text-sm text-gray-500">
                {ollmaStatus === 'available' ? '✓ Online' : '✗ Offline - Start Ollama'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-6 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl ${
                  msg.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : msg.type === 'system'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </Card>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <Card className="bg-white border border-gray-200 px-4 py-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <p className="text-sm text-gray-600">Thinking...</p>
                </div>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-2xl mx-auto w-full px-6 py-2">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-700">{error}</p>
              {error.includes('ollama') && (
                <p className="text-xs text-red-600 mt-1">
                  To enable AI: Run <code className="bg-red-100 px-1 rounded">ollama run llama3</code> in a terminal
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-2xl mx-auto w-full px-6 py-4 space-y-3">
          <div className="flex gap-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about fitness, nutrition, health..."
              disabled={isLoading || ollmaStatus === 'offline'}
              className="flex-1 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              inputMode="text"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim() || ollmaStatus === 'offline'}
              className="h-12 w-12 rounded-xl bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 touch-action-manipulation"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <Button
            onClick={handleClearChat}
            variant="ghost"
            size="sm"
            className="w-full text-gray-600 hover:text-gray-900"
          >
            Clear Chat
          </Button>
        </div>
      </div>
    </div>
  );
}
