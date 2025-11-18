'use client';

import { useState, useRef, useEffect } from 'react';
import { GameChatMessage } from '@/types/friends';

interface GameChatCollapsibleProps {
  messages: GameChatMessage[];
  onSendMessage: (message: string) => void;
  currentUserId?: string;
  canChat: boolean;
  gamePhase?: 'lobby' | 'placement' | 'playing' | 'finished';
  filterByPhase?: boolean;
}

export const GameChatCollapsible = ({
  messages,
  onSendMessage,
  currentUserId,
  canChat,
  gamePhase,
  filterByPhase = false
}: GameChatCollapsibleProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredMessages = filterByPhase && gamePhase
    ? messages.filter(msg => msg.gamePhase === gamePhase)
    : messages;

  // Compter les messages non lus
  useEffect(() => {
    if (!isOpen) {
      setUnreadCount(filteredMessages.length);
    } else {
      setUnreadCount(0);
    }
  }, [filteredMessages.length, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [filteredMessages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && canChat) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Bouton du chat */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full w-14 h-14 shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center relative"
      >
        {isOpen ? (
          <span className="text-xl">✕</span>
        ) : (
          <>
            <span className="text-xl">💬</span>
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Fenêtre de chat */}
      {isOpen && (
        <>
          {/* Overlay pour fermer */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Fenêtre de chat */}
          <div className="absolute bottom-16 right-0 w-80 sm:w-96 max-h-96 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
              <h3 className="text-white font-bold text-sm">💬 Chat de jeu</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="h-64 overflow-y-auto p-3 space-y-2">
              {filteredMessages.length === 0 ? (
                <div className="text-slate-400 text-center py-8 text-sm">
                  Aucun message...
                </div>
              ) : (
                <>
                  {filteredMessages.slice(-20).map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.playerId === currentUserId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          msg.playerId === currentUserId
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        <div className="text-xs font-semibold mb-1 opacity-80">
                          {msg.playerName}
                        </div>
                        <div className="break-words">
                          {msg.message}
                        </div>
                        <div className="text-xs opacity-60 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Formulaire d'envoi */}
            {canChat ? (
              <form onSubmit={handleSubmit} className="p-3 bg-slate-800 border-t border-slate-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    maxLength={200}
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors font-semibold"
                  >
                    📤
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3 bg-slate-800 border-t border-slate-700 text-center text-slate-400 text-sm">
                Chat indisponible
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
