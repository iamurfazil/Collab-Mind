import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { 
  Send, Sparkles, Bot, User, Loader2, RefreshCw, 
  Lightbulb, ArrowRight
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

const suggestedPrompts = [
  "I want to build a platform for students to find hackathons.",
  "Help me name an AI tool that summarizes research papers.",
  "Give me project ideas related to sustainable energy and IoT.",
];

export default function AIProjectGenerator() {
  const { user } = useStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: "Hi there! I'm your Collab Mind Copilot. Tell me a bit about what you want to build, and I'll help you generate catchy titles and detailed problem descriptions."
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsTyping(true);

    // MOCK API CALL: Simulate backend processing delay
    // TODO: Replace this block with actual API integration later
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: "Here are a few project title ideas based on your input:\n\n1. **NexLearn**: An interactive learning hub.\n2. **EduConnect**: Bridging the gap in student networking.\n\nDescription: A robust platform designed to streamline communication and resource sharing among students... \n\n(This is a placeholder response until we connect the backend!)"
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'ai',
        content: "Chat cleared! Let's brainstorm something new. What are you thinking of building?"
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto bg-white border border-gray-200 shadow-sm rounded-3xl overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">AI Project Generator</h2>
            <p className="text-xs text-gray-500 font-medium">Brainstorm titles & descriptions</p>
          </div>
        </div>
        <button 
          onClick={handleClearChat}
          className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all cursor-hover tooltip"
          title="Clear Chat"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {msg.role === 'user' ? (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center shadow-sm">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Message Bubble */}
              <div 
                className={`max-w-[80%] rounded-2xl p-4 whitespace-pre-wrap leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-md rounded-tr-sm' 
                    : 'bg-white border border-gray-200 text-gray-700 shadow-sm rounded-tl-sm'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 flex-row"
          >
            <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center shadow-sm shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
              <span className="text-sm font-medium tracking-wide">Generating ideas...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts (Only show if chat is empty/just starting) */}
      {messages.length === 1 && !isTyping && (
        <div className="px-6 pb-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="text-left text-sm px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:border-orange-300 hover:text-orange-600 hover:shadow-sm transition-all cursor-hover flex items-center gap-2 group"
              >
                <Lightbulb className="w-3 h-3 text-orange-400 group-hover:text-orange-500" />
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
          className="relative flex items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(input);
              }
            }}
            placeholder="Describe your idea... (Press Enter to send)"
            className="w-full pl-4 pr-14 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-900 placeholder-gray-400 resize-none min-h-[60px] max-h-[150px]"
            rows={1}
          />
          <motion.button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 bottom-2 p-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-hover flex items-center justify-center group"
            whileHover={{ scale: input.trim() && !isTyping ? 1.05 : 1 }}
            whileTap={{ scale: input.trim() && !isTyping ? 0.95 : 1 }}
          >
            <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </motion.button>
        </form>
        <div className="text-center mt-2">
          <p className="text-[10px] text-gray-400 font-medium">
            AI can make mistakes. Review the generated titles and descriptions before publishing.
          </p>
        </div>
      </div>
    </div>
  );
}