'use client';

import { useAuth } from '@/hooks/useAuth';
import { Lobby } from '@/components/lobby/Lobby';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Game } from '@/types/game';

function LobbyContent() {
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
    
    // Si on n'a ni code ni gameId, rediriger vers le dashboard
    if (!code && !gameId) {
      router.push('/dashboard');
      return;
    }
    
    if (code) {
      setInitialCode(code);
    } else if (gameId) {
      // Si on a un gameId, on ne fait rien ici, le Lobby le gérera
      setInitialCode(null);
    }
  }, [searchParams, router]);

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

export default function LobbyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    }>
      <LobbyContent />
    </Suspense>
  );
}
