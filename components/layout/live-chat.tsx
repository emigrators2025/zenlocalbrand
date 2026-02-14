'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { MessageCircle, X, Send, Loader2, Bot, User, Headphones } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';

interface Message {
  id: string;
  type: 'user' | 'bot' | 'admin' | 'system';
  content: string;
  timestamp: Date;
  isLink?: boolean;
  linkUrl?: string;
  linkText?: string;
}

interface ChatSession {
  id: string;
  status: 'bot' | 'waiting' | 'connected' | 'closed';
  adminName?: string;
}

const quickReplies = [
  'Track my order',
  'Shipping info',
  'Return policy',
  'Talk to human',
];

interface BotResponse {
  text: string;
  link?: { url: string; text: string };
}

const botResponses: Record<string, BotResponse> = {
  'track my order': {
    text: `You can track your order status in real-time. Just enter your order number to see delivery updates.`,
    link: { url: '/track-order', text: 'Track Your Order →' }
  },
  'shipping info': {
    text: `We offer FREE shipping on orders over 1000 EGP! 🚚\n\n• Standard delivery: 3-5 business days\n• Express delivery: 1-2 business days\n• All orders include tracking`,
    link: { url: '/shipping', text: 'View Full Shipping Policy →' }
  },
  'return policy': {
    text: `Easy returns within 14 days! 📦\n\n• Items must be unworn with original tags\n• Free returns on defective items\n• Refund processed in 3-5 business days`,
    link: { url: '/faq', text: 'Read Return Policy →' }
  },
  'talk to human': {
    text: `I'll connect you with a support agent. Please wait a moment...`,
  },
  'contact support': {
    text: `Our support team is here for you! 💚\n\n📧 support@zenlocalbrand.shop\n📱 +201062137061\n\nOr fill out our contact form for a quick response.`,
    link: { url: '/contact', text: 'Contact Us →' }
  },
  'hello': {
    text: `Hello! 👋 Welcome to ZEN LOCAL BRAND. How can I help you today?`
  },
  'hi': {
    text: `Hi there! 👋 How can I assist you today?`
  },
  'default': {
    text: `Thanks for your message! I'm here to help with orders, shipping, and returns. For complex issues, tap "Talk to human" to chat with our support team.`,
    link: { url: '/faq', text: 'Browse FAQ →' }
  },
};

function getBotResponse(message: string): BotResponse {
  const lowerMessage = message.toLowerCase().trim();
  
  for (const [key, response] of Object.entries(botResponses)) {
    if (lowerMessage.includes(key) || key.includes(lowerMessage)) {
      return response;
    }
  }
  
  return botResponses.default;
}

export function LiveChatWidget() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! 👋 Welcome to ZEN LOCAL BRAND. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [waitingForAdmin, setWaitingForAdmin] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for admin messages when in waiting/connected state
  const pollForMessages = useCallback(async () => {
    if (!chatSession?.id) return;
    
    try {
      const response = await fetch(`/api/live-chat?sessionId=${chatSession.id}`);
      if (response.ok) {
        const data = await response.json();
        
        if (data.session) {
          if (data.session.status === 'connected' && chatSession.status !== 'connected') {
            setChatSession(prev => prev ? { ...prev, status: 'connected', adminName: data.session.adminName } : null);
            setWaitingForAdmin(false);
            
            // Add admin joined message
            const joinMessage: Message = {
              id: Date.now().toString(),
              type: 'admin',
              content: `${data.session.adminName || 'Support Agent'} has joined the chat. How can I help you?`,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, joinMessage]);
          }
        }
        
        // Check if chat was closed by admin
        if (data.session && data.session.status === 'closed' && chatSession.status !== 'closed') {
          setChatSession(prev => prev ? { ...prev, status: 'closed' } : null);
          setWaitingForAdmin(false);
        }
        
        if (data.newMessages && data.newMessages.length > 0) {
          const newMessages = data.newMessages
            .filter((msg: any) => msg.type === 'admin' || msg.type === 'system')
            .map((msg: any) => ({
              id: msg.id,
              type: msg.type as 'admin' | 'system',
              content: msg.content,
              timestamp: new Date(msg.timestamp),
            }));
          
          if (newMessages.length > 0) {
            setMessages(prev => {
              const existingIds = new Set(prev.map(m => m.id));
              const filteredMsgs = newMessages.filter((m: Message) => !existingIds.has(m.id));
              return [...prev, ...filteredMsgs];
            });
          }
        }
      }
    } catch (error) {
      console.error('Error polling messages:', error);
    }
  }, [chatSession]);

  useEffect(() => {
    if (chatSession && (chatSession.status === 'waiting' || chatSession.status === 'connected')) {
      pollIntervalRef.current = setInterval(pollForMessages, 3000);
    }
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [chatSession, pollForMessages]);

  const startAdminChat = async () => {
    setWaitingForAdmin(true);
    
    try {
      const requestBody = {
        action: 'start',
        userId: user?.uid || `guest_${Date.now()}`,
        userName: user?.displayName || user?.email || 'Guest',
        userEmail: user?.email || null,
      };
      
      console.log('Starting admin chat with:', requestBody);
      
      const response = await fetch('/api/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      console.log('Admin chat response:', data);
      
      if (response.ok && data.sessionId) {
        setChatSession({ id: data.sessionId, status: 'waiting' });
        
        // Send existing messages to the session
        const userMessages = messages.filter(m => m.type === 'user');
        if (userMessages.length > 0) {
          await fetch('/api/live-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'message',
              sessionId: data.sessionId,
              content: userMessages.map(m => m.content).join('\n---\n'),
              type: 'user',
            }),
          });
        }
      }
    } catch (error) {
      console.error('Error starting admin chat:', error);
      setWaitingForAdmin(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // If connected to admin, send message to server
    if (chatSession?.status === 'connected' || chatSession?.status === 'waiting') {
      try {
        await fetch('/api/live-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'message',
            sessionId: chatSession.id,
            content: content.trim(),
            type: 'user',
          }),
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
      return;
    }

    // Check if user wants to talk to human
    if (content.toLowerCase().includes('talk to human') || content.toLowerCase().includes('human') || content.toLowerCase().includes('agent') || content.toLowerCase().includes('support')) {
      setIsTyping(true);
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: 'Connecting you with a support agent. Please wait...',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botResponse]);
        setIsTyping(false);
        startAdminChat();
      }, 500);
      return;
    }

    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const response = getBotResponse(content);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      
      // Add link message if exists
      if (response.link) {
        const linkMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'bot',
          content: response.link.text,
          timestamp: new Date(),
          isLink: true,
          linkUrl: response.link.url,
          linkText: response.link.text,
        };
        setMessages((prev) => [...prev, linkMessage]);
      }
      
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-emerald-600 transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col"
            style={{ height: '500px', maxHeight: 'calc(100vh - 6rem)' }}
          >
            {/* Header */}
            <div className="bg-emerald-500 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  {chatSession?.status === 'connected' ? (
                    <Headphones className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-white font-semibold">
                    {chatSession?.status === 'connected' 
                      ? chatSession.adminName || 'Support Agent'
                      : 'ZEN Support'}
                  </h3>
                  <p className="text-emerald-100 text-xs">
                    {chatSession?.status === 'closed'
                      ? '🔴 Chat Ended'
                      : chatSession?.status === 'waiting' 
                      ? 'Connecting to agent...'
                      : chatSession?.status === 'connected'
                      ? '🟢 Online'
                      : 'Usually replies instantly'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'system' ? 'justify-center' : message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'system' ? (
                    <div className="bg-zinc-700/50 border border-zinc-600 rounded-full px-4 py-2 text-center">
                      <p className="text-xs text-zinc-300">{message.content}</p>
                    </div>
                  ) : message.isLink ? (
                    <Link
                      href={message.linkUrl || '#'}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl transition-colors text-sm font-medium"
                    >
                      {message.linkText}
                    </Link>
                  ) : (
                    <div className={`flex gap-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === 'user' 
                          ? 'bg-emerald-500' 
                          : message.type === 'admin'
                          ? 'bg-blue-500'
                          : 'bg-zinc-700'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : message.type === 'admin' ? (
                          <Headphones className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                      <div className={`rounded-2xl px-4 py-2 ${
                        message.type === 'user'
                          ? 'bg-emerald-500 text-white rounded-br-md'
                          : message.type === 'admin'
                          ? 'bg-blue-500/20 text-blue-100 rounded-bl-md border border-blue-500/30'
                          : 'bg-zinc-800 text-zinc-200 rounded-bl-md'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.type === 'user' 
                            ? 'text-emerald-200' 
                            : message.type === 'admin'
                            ? 'text-blue-300'
                            : 'text-zinc-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString('en-GB', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {(isTyping || waitingForAdmin) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    waitingForAdmin ? 'bg-blue-500/20' : 'bg-zinc-700'
                  }`}>
                    {waitingForAdmin ? (
                      <Headphones className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Bot className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <div className={`rounded-2xl rounded-bl-md px-4 py-3 ${
                    waitingForAdmin ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-zinc-800'
                  }`}>
                    {waitingForAdmin ? (
                      <p className="text-sm text-blue-300">Finding available agent...</p>
                    ) : (
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-4 py-2 border-t border-zinc-800">
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => handleSendMessage(reply)}
                    className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            {chatSession?.status === 'closed' ? (
              <div className="p-4 border-t border-zinc-800 text-center">
                <p className="text-zinc-400 text-sm">This chat has ended. Start a new conversation if you need help.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-full text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isTyping}
                    className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    {isTyping ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
