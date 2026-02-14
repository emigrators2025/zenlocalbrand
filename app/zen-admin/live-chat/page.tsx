'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  User, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Headphones,
  Loader2,
  RefreshCw,
  MessageSquare,
  UserCircle
} from 'lucide-react';

interface ChatSession {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  status: 'waiting' | 'connected' | 'closed';
  adminId?: string;
  adminName?: string;
  createdAt: Date;
  lastActivity: Date;
}

interface Message {
  id: string;
  content: string;
  type: 'user' | 'admin';
  timestamp: Date;
}

export default function LiveChatAdminPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  const lastMessageCountRef = useRef(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = (force = false) => {
    if (force || !isUserScrollingRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    // Consider user "at bottom" if within 100px of the bottom
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    isUserScrollingRef.current = !isAtBottom;
  };

  // Only scroll when NEW messages arrive (message count increases)
  useEffect(() => {
    if (messages.length > lastMessageCountRef.current && !isUserScrollingRef.current) {
      scrollToBottom();
    }
    lastMessageCountRef.current = messages.length;
  }, [messages]);

  const fetchSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/live-chat?admin=true');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched sessions:', data.sessions);
        setSessions(data.sessions || []);
      } else {
        console.error('Failed to fetch sessions:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!selectedSession) return;

    try {
      const response = await fetch(`/api/live-chat?sessionId=${selectedSession.id}`);
      if (response.ok) {
        const data = await response.json();
        
        if (data.newMessages) {
          const newMessages = data.newMessages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
          
          // Only update if message count changed (prevents unnecessary re-renders)
          setMessages(prev => {
            if (prev.length !== newMessages.length) {
              return newMessages;
            }
            // Check if last message ID is different
            const lastPrev = prev[prev.length - 1];
            const lastNew = newMessages[newMessages.length - 1];
            if (lastPrev?.id !== lastNew?.id) {
              return newMessages;
            }
            return prev;
          });
        }
        
        // Update session status if changed
        if (data.session && data.session.status !== selectedSession.status) {
          setSelectedSession(prev => prev ? { ...prev, status: data.session.status } : null);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [selectedSession]);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  useEffect(() => {
    if (selectedSession) {
      fetchMessages();
      pollIntervalRef.current = setInterval(fetchMessages, 2000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [selectedSession, fetchMessages]);

  const handleJoinChat = async (session: ChatSession) => {
    // Reset scroll tracking for new chat
    lastMessageCountRef.current = 0;
    isUserScrollingRef.current = false;
    
    try {
      await fetch('/api/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          sessionId: session.id,
          adminId: 'admin',
          adminName: 'Support Team',
        }),
      });

      setSelectedSession({ ...session, status: 'connected' });
      await fetchMessages();
      fetchSessions();
    } catch (error) {
      console.error('Error joining chat:', error);
    }
  };

  const handleCloseChat = async () => {
    if (!selectedSession) return;

    try {
      await fetch('/api/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'close',
          sessionId: selectedSession.id,
        }),
      });

      setSelectedSession(null);
      setMessages([]);
      fetchSessions();
    } catch (error) {
      console.error('Error closing chat:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedSession || sending) return;

    const content = inputValue.trim();
    setInputValue('');
    setSending(true);

    // Optimistically add message
    const tempMessage: Message = {
      id: `temp_${Date.now()}`,
      content,
      type: 'admin',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, tempMessage]);
    
    // Force scroll to bottom when admin sends a message
    isUserScrollingRef.current = false;
    setTimeout(() => scrollToBottom(true), 100);

    try {
      await fetch('/api/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'message',
          sessionId: selectedSession.id,
          content,
          type: 'admin',
        }),
      });

      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const quickResponses = [
    'Hello! How can I help you today?',
    'Let me check that for you.',
    'Is there anything else I can help with?',
    'Thank you for contacting us!',
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Live Chat Support</h1>
        <p className="text-zinc-400">Respond to customer inquiries in real-time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-5rem)]">
        {/* Chat Sessions List */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              Active Chats
            </h2>
            <button 
              onClick={fetchSessions}
              className="p-2 text-zinc-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto h-[calc(100%-4rem)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageSquare className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400">No active chats</p>
                <p className="text-zinc-500 text-sm mt-1">
                  Waiting chats will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => session.status === 'waiting' ? handleJoinChat(session) : setSelectedSession(session)}
                    className={`w-full p-4 text-left hover:bg-zinc-800/50 transition-colors ${
                      selectedSession?.id === session.id ? 'bg-emerald-500/10 border-l-2 border-emerald-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        session.status === 'waiting' ? 'bg-yellow-500/20' : 'bg-emerald-500/20'
                      }`}>
                        <UserCircle className={`w-5 h-5 ${
                          session.status === 'waiting' ? 'text-yellow-400' : 'text-emerald-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-white font-medium truncate">
                            {session.userName}
                          </p>
                          {session.status === 'waiting' ? (
                            <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Waiting
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </span>
                          )}
                        </div>
                        {session.userEmail && (
                          <p className="text-zinc-500 text-sm truncate">
                            {session.userEmail}
                          </p>
                        )}
                        <p className="text-zinc-600 text-xs mt-1">
                          {formatDate(new Date(session.lastActivity))}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden flex flex-col">
          {selectedSession ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{selectedSession.userName}</h3>
                    <p className="text-zinc-500 text-sm">
                      {selectedSession.userEmail || 'Guest User'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseChat}
                  className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors flex items-center gap-1"
                >
                  <XCircle className="w-4 h-4" />
                  End Chat
                </button>
              </div>

              {/* Messages Area */}
              <div 
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.type === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 max-w-[75%] ${message.type === 'admin' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.type === 'admin' ? 'bg-blue-500' : 'bg-zinc-700'
                        }`}>
                          {message.type === 'admin' ? (
                            <Headphones className="w-4 h-4 text-white" />
                          ) : (
                            <User className="w-4 h-4 text-zinc-300" />
                          )}
                        </div>
                        <div className={`rounded-2xl px-4 py-2 ${
                          message.type === 'admin'
                            ? 'bg-blue-500 text-white rounded-br-md'
                            : 'bg-zinc-800 text-zinc-200 rounded-bl-md'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.type === 'admin' ? 'text-blue-200' : 'text-zinc-500'
                          }`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Responses */}
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {quickResponses.map((response, index) => (
                  <button
                    key={index}
                    onClick={() => setInputValue(response)}
                    className="px-3 py-1 text-xs bg-zinc-800 text-zinc-300 rounded-full hover:bg-zinc-700 transition-colors"
                  >
                    {response}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-zinc-800">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 bg-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-zinc-500"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || sending}
                    className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {sending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Headphones className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Select a Chat
                </h3>
                <p className="text-zinc-500 max-w-sm">
                  Click on a waiting or active chat from the list to start responding to customers
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
