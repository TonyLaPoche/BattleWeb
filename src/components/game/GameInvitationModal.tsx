'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  subscribeToGameInvitations,
  acceptGameInvitation,
  rejectGameInvitation,
  GameInvitation,
} from '@/services/gameInvitationService';
import { createGame, joinGame } from '@/services/gameService';

export const GameInvitationModal = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [invitations, setInvitations] = useState<GameInvitation[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToGameInvitations(user.uid, (invitationsList) => {
      setInvitations(invitationsList);
    });

    return unsubscribe;
  }, [user]);

  const handleAccept = async (invitation: GameInvitation) => {
    if (!user || processing) return;

    setProcessing(invitation.id);
    try {
      // Étape 1: Créer une nouvelle partie avec l'utilisateur actuel comme admin
      const currentUserName = user.displayName || user.email?.split('@')[0] || 'Joueur';
      const game = await createGame(
        user.uid, // L'utilisateur actuel devient admin
        currentUserName,
        {
          enableBombs: false,
          bombsPerPlayer: 0,
          turnTimeLimit: 0,
          maxPlayers: 2,
        }
      );

      // Note: L'utilisateur est déjà dans la partie en tant qu'admin, pas besoin de joinGame

      // Étape 3: Accepter l'invitation avec l'ID de la partie pour que l'inviteur puisse être redirigé
      await acceptGameInvitation(user.uid, invitation.id, game.id);

      // Étape 4: Rediriger vers le lobby
      router.push(`/lobby?gameId=${game.id}`);
    } catch (error: any) {
      console.error('Erreur lors de l\'acceptation de l\'invitation:', error);
      alert(`Erreur lors de l'acceptation de l'invitation: ${error.message}`);
      setProcessing(null);
    }
  };

  const handleReject = async (invitation: GameInvitation) => {
    if (!user || processing) return;

    setProcessing(invitation.id);
    try {
      await rejectGameInvitation(user.uid, invitation.id);
    } catch (error) {
      console.error('Erreur lors du refus de l\'invitation:', error);
      alert('Erreur lors du refus de l\'invitation');
      setProcessing(null);
    }
  };

  if (invitations.length === 0) {
    return null;
  }

  // Afficher seulement la première invitation (la plus récente)
  const invitation = invitations[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Invitation à jouer</h2>
        
        <div className="mb-6">
          <p className="text-gray-700">
            <span className="font-semibold">{invitation.fromUsername}</span> vous invite à jouer une partie.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => handleReject(invitation)}
            disabled={processing === invitation.id}
            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 rounded transition-colors"
          >
            {processing === invitation.id ? 'Traitement...' : 'Refuser'}
          </button>
          <button
            onClick={() => handleAccept(invitation)}
            disabled={processing === invitation.id}
            className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-white rounded transition-colors"
          >
            {processing === invitation.id ? 'Traitement...' : 'Accepter'}
          </button>
        </div>
      </div>
    </div>
  );
};

