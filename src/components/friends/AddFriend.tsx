'use client';

import { useState, useEffect } from 'react';
import { searchUsers, sendFriendRequest, subscribeToReceivedFriendRequests, subscribeToSentFriendRequests, acceptFriendRequest, rejectFriendRequest } from '@/services/friendService';
import { UserProfile } from '@/services/userService';
import { FriendRequest } from '@/types/friends';
import { useAuth } from '@/hooks/useAuth';

export const AddFriend = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Écouter les demandes reçues
  useEffect(() => {
    if (!user) return;

    const unsubscribeReceived = subscribeToReceivedFriendRequests(user.uid, (requests) => {
      setReceivedRequests(requests);
    });

    const unsubscribeSent = subscribeToSentFriendRequests(user.uid, (requests) => {
      setSentRequests(requests);
    });

    return () => {
      unsubscribeReceived();
      unsubscribeSent();
    };
  }, [user]);

  // Rechercher des utilisateurs
  const handleSearch = async () => {
    if (!user || !searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setError('');
    try {
      const results = await searchUsers(searchQuery.trim(), user.uid);
      setSearchResults(results);
    } catch (err: any) {
      setError('Erreur lors de la recherche');
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  // Envoyer une demande d'ami
  const handleSendRequest = async (toUserId: string) => {
    if (!user) return;

    setError('');
    setSuccess('');
    try {
      await sendFriendRequest(user.uid, toUserId);
      setSuccess('Demande d\'ami envoyée !');
      setTimeout(() => setSuccess(''), 3000);
      // Recharger les résultats pour mettre à jour l'état
      handleSearch();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi de la demande');
      setTimeout(() => setError(''), 5000);
    }
  };

  // Accepter une demande
  const handleAcceptRequest = async (fromUserId: string) => {
    if (!user) return;

    setError('');
    setSuccess('');
    try {
      await acceptFriendRequest(fromUserId, user.uid);
      setSuccess('Demande acceptée !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'acceptation');
      setTimeout(() => setError(''), 5000);
    }
  };

  // Refuser une demande
  const handleRejectRequest = async (fromUserId: string) => {
    if (!user) return;

    setError('');
    try {
      await rejectFriendRequest(fromUserId, user.uid);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du refus');
      setTimeout(() => setError(''), 5000);
    }
  };

  // Vérifier si une demande a déjà été envoyée
  const isRequestSent = (userId: string) => {
    return sentRequests.some(req => req.toUserId === userId);
  };

  // Vérifier si une demande a été reçue
  const isRequestReceived = (userId: string) => {
    return receivedRequests.some(req => req.fromUserId === userId);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Ajouter un Ami</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Recherche */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Rechercher par nom d'utilisateur..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={searching || !searchQuery.trim() || searchQuery.trim().length < 2}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {searching ? 'Recherche...' : 'Rechercher'}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Minimum 2 caractères requis
        </p>
      </div>

      {/* Demandes reçues */}
      {receivedRequests.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Demandes reçues ({receivedRequests.length})
          </h4>
          <div className="space-y-2">
            {receivedRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
              >
                <span className="font-medium text-gray-900">{request.fromUsername}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAcceptRequest(request.fromUserId)}
                    className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request.fromUserId)}
                    className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                  >
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Résultats de recherche */}
      {searchResults.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Résultats ({searchResults.length})
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {searchResults.map((user) => {
              const requestSent = isRequestSent(user.id);
              const requestReceived = isRequestReceived(user.id);

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium text-gray-900">{user.username}</span>
                  {requestSent ? (
                    <span className="text-xs text-gray-500">Demande envoyée</span>
                  ) : requestReceived ? (
                    <span className="text-xs text-blue-500">Demande reçue</span>
                  ) : (
                    <button
                      onClick={() => handleSendRequest(user.id)}
                      className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                    >
                      Ajouter
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {searchQuery && searchResults.length === 0 && !searching && (
        <div className="text-center text-gray-500 py-4 text-sm">
          Aucun utilisateur trouvé
        </div>
      )}
    </div>
  );
};

