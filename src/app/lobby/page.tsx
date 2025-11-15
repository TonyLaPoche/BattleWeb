'use client';

import { useAuth } from '@/hooks/useAuth';
import { Lobby } from '@/components/lobby/Lobby';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Game } from '@/types/game';

export default function LobbyPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [initialCode, setInitialCode] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    // Récupérer le code depuis l'URL
    const code = searchParams.get('code');
    const gameId = searchParams.get('gameId');
    if (code) {
      setInitialCode(code);
    } else if (gameId) {
      // Si on a un gameId, on ne fait rien ici, le Lobby le gérera
      setInitialCode(null);
    }
  }, [searchParams]);

  const handleGameStart = (game: Game) => {
    // Rediriger vers la phase de placement
    router.push(`/placement?gameId=${game.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirection en cours
  }

  const gameId = searchParams.get('gameId');
  return <Lobby onGameStart={handleGameStart} initialCode={initialCode} initialGameId={gameId || undefined} />;
}
