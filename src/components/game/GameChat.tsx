'use client';

import { useState, useRef, useEffect } from 'react';
import { LobbyMessage } from '@/types/game';

interface GameChatProps {
  messages: LobbyMessage[];
  onSendMessage: (message: string) => void;
  currentUserId?: string;
  canChat: boolean;
  title?: string;
  gamePhase?: 'lobby' | 'placement' | 'playing' | 'finished';
  filterByPhase?: boolean; // Si true, filtre les messages par phase
}

export const GameChat = ({ 
  messages, 
  onSendMessage, 
  currentUserId, 
  canChat,
  title = 'Chat',
  gamePhase,
  filterByPhase = false
}: GameChatProps) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filtrer les messages par phase si nécessaire
  const filteredMessages = filterByPhase && gamePhase
    ? messages.filter((msg: any) => {
        // Si le message n'a pas de gamePhase, on l'affiche (compatibilité)
        if (!msg.gamePhase) return true;
        // Afficher les messages du lobby pendant toutes les phases
        if (msg.gamePhase === 'lobby') return true;
        // Afficher les messages in-game seulement pendant la phase playing
        if (msg.type === 'in-game' && gamePhase === 'playing') return true;
        return false;
      })
    : messages;

  // Scroll automatique vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && canChat) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow h-[400px] sm:h-[500px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">{title}</h3>
        {!canChat && (
          <p className="text-sm text-gray-500 mt-1">
            Rejoignez la partie pour pouvoir chatter
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Aucun message pour le moment
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.playerId === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.playerId === currentUserId
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm">{msg.playerName}</span>
                  <span className={`text-xs ${
                    msg.playerId === currentUserId ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <p className="text-sm break-words">{msg.message}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={canChat ? "Tapez votre message..." : "Vous devez rejoindre la partie"}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-sm"
            disabled={!canChat}
            maxLength={200}
          />
          <button
            type="submit"
            disabled={!message.trim() || !canChat}
            className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Envoyer
          </button>
        </form>
      </div>
    </div>
  );
};

