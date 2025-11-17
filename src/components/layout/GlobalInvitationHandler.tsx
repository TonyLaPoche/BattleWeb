'use client';

import { GameInvitationModal } from '@/components/game/GameInvitationModal';

/**
 * Composant global pour gérer les invitations de jeu
 * Doit être placé dans le layout pour être disponible sur toutes les pages
 */
export const GlobalInvitationHandler = () => {
  return <GameInvitationModal />;
};

