'use client';

import { useState, useEffect } from 'react';
import { Friend } from '@/types/friends';
import { subscribeToFriends } from '@/services/friendService';
import { subscribeToFriendPresence } from '@/services/presenceService';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { sendGameInvitation, subscribeToInvitationResponse } from '@/services/gameInvitationService';

interface FriendsListProps {
  userId: string;
  onInviteFriend?: (friendId: string) => void;
}

export const FriendsList = ({ userId, onInviteFriend }: FriendsListProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [invitingFriendId, setInvitingFriendId] = useState<string | null>(null);
  const [invitationStatus, setInvitationStatus] = useState<Record<string, 'pending' | 'accepted' | 'rejected'>>({});

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToFriends(userId, (updatedFriends) => {
      setFriends(updatedFriends);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  const handleInviteToGame = async (friendId: string) => {
    if (!user || invitingFriendId) return;

    setInvitingFriendId(friendId);
    setInvitationStatus(prev => ({ ...prev, [friendId]: 'pending' }));

    try {
      const username = user.displayName || user.email?.split('@')[0] || 'Joueur';
      
      // Envoyer l'invitation
      const invitationId = await sendGameInvitation(user.uid, username, friendId);

      // S'abonner à la réponse
      const unsubscribe = subscribeToInvitationResponse(
        user.uid,
        friendId,
        invitationId,
        (status, gameId) => {
          setInvitationStatus(prev => ({ ...prev, [friendId]: status }));
          setInvitingFriendId(null);

          if (status === 'accepted') {
            // L'invitation a été acceptée, rediriger vers la partie
            if (gameId) {
              router.push(`/lobby?gameId=${gameId}`);
            } else {
              alert('Invitation acceptée ! Redirection...');
            }
          } else if (status === 'rejected') {
            alert('Invitation refusée');
            // Nettoyer après 3 secondes
            setTimeout(() => {
              setInvitationStatus(prev => {
                const newStatus = { ...prev };
                delete newStatus[friendId];
                return newStatus;
              });
            }, 3000);
          } else if (status === 'expired') {
            alert('Invitation expirée');
            // Nettoyer après 3 secondes
            setTimeout(() => {
              setInvitationStatus(prev => {
                const newStatus = { ...prev };
                delete newStatus[friendId];
                return newStatus;
              });
            }, 3000);
          }
        }
      );

      // Timeout de 30 secondes pour nettoyer
      setTimeout(() => {
        unsubscribe();
        setInvitationStatus(prev => {
          if (prev[friendId] === 'pending') {
            const newStatus = { ...prev };
            delete newStatus[friendId];
            setInvitingFriendId(null);
            return newStatus;
          }
          return prev;
        });
      }, 30000);
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi de l\'invitation:', error);
      const errorMessage = error.message || 'Erreur lors de l\'envoi de l\'invitation';
      alert(errorMessage);
      setInvitingFriendId(null);
      setInvitationStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[friendId];
        return newStatus;
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'in-game':
        return 'bg-blue-500';
      case 'offline':
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online':
        return 'En ligne';
      case 'in-game':
        return 'En partie';
      case 'offline':
      default:
        return 'Hors ligne';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Mes Amis</h3>
        <div className="text-center text-gray-500 py-4">Chargement...</div>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Mes Amis</h3>
        <div className="text-center text-gray-500 py-8">
          <p className="mb-2">Vous n'avez pas encore d'amis</p>
          <p className="text-sm">Ajoutez des amis pour jouer avec eux !</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Mes Amis ({friends.length})</h3>
      <div className="space-y-3">
        {friends.map((friend) => (
          <div
            key={friend.userId}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3 flex-1">
              {/* Statut */}
              <div className="relative">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(friend.status)}`} />
                {friend.status === 'in-game' && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                )}
              </div>

              {/* Nom d'utilisateur */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{friend.username}</p>
                <p className="text-xs text-gray-500">{getStatusLabel(friend.status)}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {friend.status === 'in-game' && friend.currentGameId && (
                <button
                  onClick={() => router.push(`/game/${friend.currentGameId}`)}
                  className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                  title="Voir la partie"
                >
                  Voir
                </button>
              )}
              <button
                onClick={() => handleInviteToGame(friend.userId)}
                disabled={friend.status === 'in-game' || invitingFriendId === friend.userId || invitationStatus[friend.userId] === 'pending'}
                className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded transition-colors"
                title="Inviter à jouer"
              >
                {invitingFriendId === friend.userId || invitationStatus[friend.userId] === 'pending'
                  ? 'En attente...'
                  : invitationStatus[friend.userId] === 'accepted'
                  ? 'Accepté'
                  : invitationStatus[friend.userId] === 'rejected'
                  ? 'Refusé'
                  : 'Inviter'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

