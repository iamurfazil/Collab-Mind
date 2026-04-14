import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Bot, Lightbulb, Send, Sparkles, User2, Wrench, X } from 'lucide-react';
import { useStore } from '../../store';
// @ts-ignore - existing API module is JavaScript; runtime exports are valid.
import { askNexusAI } from '../../services/api';

type NexusRole = 'owner' | 'builder';

type NexusMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const WELCOME_MESSAGE: NexusMessage = {
  id: 'nexus-welcome',
  role: 'assistant',
  content:
    'I am CollabMind Nexus. I can help you match ideas and builders, shape deliverables, and plan next steps. Tell me your goal and I will guide you.',
};

function toTitleRole(role: NexusRole) {
  return role === 'owner' ? 'Idea Poster' : 'Builder';
}

type NexusAIProps = {
  embedded?: boolean;
  onClose?: () => void;
};

export default function NexusAI({ embedded = false, onClose }: NexusAIProps) {
  const { user } = useStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<NexusMessage[]>([WELCOME_MESSAGE]);

  const role: NexusRole = user?.role === 'owner' ? 'owner' : 'builder';
  const historyStorageKey = user ? `collabmind-nexus-history:${user.id}:${role}` : '';

  if (!user) {
    return null;
  }

  useEffect(() => {
    if (!historyStorageKey) {
      return;
    }

    const raw = localStorage.getItem(historyStorageKey);
    if (!raw) {
      setMessages([WELCOME_MESSAGE]);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        setMessages([WELCOME_MESSAGE]);
        return;
      }

      const cleaned = parsed
        .filter((msg) => msg && (msg.role === 'assistant' || msg.role === 'user') && typeof msg.content === 'string')
        .map((msg, index) => ({
          id: msg.id || `restored-${index}`,
          role: msg.role,
          content: msg.content,
        }));

      setMessages(cleaned.length > 0 ? cleaned : [WELCOME_MESSAGE]);
    } catch {
      setMessages([WELCOME_MESSAGE]);
    }
  }, [historyStorageKey]);

  useEffect(() => {
    if (!historyStorageKey || messages.length === 0) {
      return;
    }

    localStorage.setItem(historyStorageKey, JSON.stringify(messages));
  }, [messages, historyStorageKey]);

  const sendMessage = async (messageText: string) => {
    const content = messageText.trim();
    if (!content || isLoading) {
      return;
    }

    const userMessage: NexusMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
    };

    const historyForApi = [...messages, userMessage].slice(-10).map((message) => ({
      role: message.role,
      content: message.content,
    }));

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askNexusAI({
        role,
        message: content,
        history: historyForApi,
        context: {
          skills: user.skills || [],
          goal: role === 'owner' ? 'find builders for my idea' : 'find projects and collaborate',
        },
      });

      const assistantReply: NexusMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response?.data?.reply || 'I could not generate a response right now. Please try again.',
      };

      setMessages((prev) => [...prev, assistantReply]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong while contacting Nexus AI.';
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          content: `Nexus could not reply: ${errorMessage}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessage(input);
  };

  return (
    <div className={embedded ? 'h-full flex flex-col' : 'space-y-6'}>
      <div className={`bg-white border border-gray-200 shadow-sm relative overflow-hidden ${embedded ? 'rounded-2xl p-4 mb-4' : 'rounded-3xl p-6 md:p-8'}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-amber-400/10 to-transparent" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold mb-3">
              <span className="w-5 h-5 rounded-full bg-white/90 border border-orange-200 flex items-center justify-center">
                <Sparkles className="w-3 h-3" />
              </span>
              Nexus AI
            </div>
            <h1 className={`${embedded ? 'text-xl' : 'text-2xl md:text-3xl'} font-bold text-gray-900`}>CollabMind Nexus</h1>
            <p className="text-gray-600 mt-2">Connect ideas with the right builders through role-aware AI guidance.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center ${role === 'owner' ? 'bg-orange-100 text-orange-500' : 'bg-blue-100 text-blue-500'}`}>
                {role === 'owner' ? <Lightbulb className="w-3.5 h-3.5" /> : <Wrench className="w-3.5 h-3.5" />}
              </span>
              Mode: {toTitleRole(role)}
            </div>
            {embedded && onClose && (
              <button
                onClick={onClose}
                className="h-10 w-10 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                aria-label="Close Nexus drawer"
              >
                <X className="w-4 h-4 mx-auto" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={`bg-white border border-gray-200 shadow-sm overflow-hidden ${embedded ? 'rounded-2xl flex-1 min-h-0 flex flex-col' : 'rounded-3xl'}`}>
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </span>
          <h2 className="font-semibold text-gray-900">Nexus Conversation</h2>
        </div>

        <div className={`${embedded ? 'flex-1 min-h-0' : 'h-[420px]'} overflow-y-auto p-4 md:p-6 space-y-4 bg-gradient-to-b from-orange-50/40 to-white`}>
          {messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[90%] md:max-w-[75%] rounded-2xl border p-3 ${isUser ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-900 border-gray-200'}`}>
                  <div className="flex items-center gap-2 text-xs mb-1 opacity-90">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center ${isUser ? 'bg-white/20' : 'bg-orange-100 text-orange-500'}`}>
                      {isUser ? <User2 className="w-2.5 h-2.5" /> : <Bot className="w-2.5 h-2.5" />}
                    </span>
                    {isUser ? 'You' : 'Nexus'}
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                </div>
              </motion.div>
            );
          })}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500 inline-flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center">
                  <Bot className="w-3 h-3" />
                </span>
                Nexus is thinking...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder={role === 'owner' ? 'Ask how to refine your idea or screen builders...' : 'Ask how to pitch, estimate, or collaborate better...'}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 text-white font-medium disabled:opacity-60"
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <Send className="w-3 h-3" />
              </span>
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
