'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export default function TutorielPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-4 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
          >
            ← Retour au tableau de bord
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            📚 Tutoriel BattleWeb
          </h1>
          <p className="text-gray-600 mt-2">
            Apprenez à jouer à BattleWeb, un jeu de bataille navale stratégique en ligne
          </p>
        </div>

        {/* Contenu du tutoriel */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🎮 Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              BattleWeb est un jeu de bataille navale multijoueur en ligne. Le but est de détruire tous les navires de vos adversaires avant qu'ils ne détruisent les vôtres. 
              Le jeu se joue sur une grille de 12x12 cases et peut accueillir jusqu'à 3 joueurs simultanément.
            </p>
          </section>

          {/* Objectif du jeu */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Objectif du jeu</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Votre objectif est simple : être le dernier joueur avec des navires encore à flot. 
              Pour cela, vous devez :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Placer stratégiquement votre flotte sur votre grille</li>
              <li>Tirer sur les grilles de vos adversaires pour trouver et couler leurs navires</li>
              <li>Utiliser des bombes de détection pour révéler des zones (optionnel)</li>
              <li>Survivre jusqu'à ce que tous vos adversaires soient éliminés</li>
            </ul>
          </section>

          {/* Déroulement d'une partie */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">⚙️ Déroulement d'une partie</h2>
            
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                <h3 className="font-bold text-blue-900 mb-2">1. Créer ou rejoindre un lobby</h3>
                <p className="text-blue-800">
                  Depuis le tableau de bord, créez une nouvelle partie ou rejoignez une partie existante avec un code d'invitation. 
                  L'administrateur peut configurer les paramètres de la partie (nombre de joueurs, bombes, temps par tour).
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                <h3 className="font-bold text-green-900 mb-2">2. Placement de la flotte</h3>
                <p className="text-green-800">
                  Une fois la partie lancée, placez vos navires sur votre grille. Les navires sont placés automatiquement, 
                  mais vous pouvez générer un nouveau placement aléatoire si vous le souhaitez. 
                  Votre flotte comprend plusieurs navires de tailles différentes.
                </p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
                <h3 className="font-bold text-yellow-900 mb-2">3. Phase de jeu</h3>
                <p className="text-yellow-800 mb-3">
                  Les joueurs jouent à tour de rôle. À votre tour, vous pouvez :
                </p>
                <ul className="list-disc list-inside space-y-1 text-yellow-800 ml-4">
                  <li><strong>Tirer</strong> sur une case de la grille d'un adversaire</li>
                  <li><strong>Placer une bombe</strong> (si activées dans les paramètres)</li>
                  <li><strong>Désamorcer une bombe</strong> qui vous cible</li>
                </ul>
              </div>

              <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                <h3 className="font-bold text-red-900 mb-2">4. Fin de partie</h3>
                <p className="text-red-800">
                  La partie se termine lorsqu'un joueur n'a plus de navires en vie. 
                  Ce joueur est éliminé, et le dernier joueur restant remporte la victoire !
                </p>
              </div>
            </div>
          </section>

          {/* Les navires */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🚢 Les navires</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Votre flotte est composée de plusieurs navires de différentes tailles. Chaque navire occupe un certain nombre de cases sur la grille :
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="font-bold">•</span>
                  <span>Les navires sont placés horizontalement ou verticalement</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold">•</span>
                  <span>Un navire est coulé lorsqu'il a reçu autant de tirs que sa taille</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold">•</span>
                  <span>Vous perdez la partie si tous vos navires sont coulés</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Les tirs */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Les tirs</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              À votre tour, vous pouvez tirer sur une case de la grille d'un adversaire. Les résultats possibles sont :
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-red-600 border-2 border-red-700 rounded"></div>
                  <h3 className="font-bold text-red-900">Touché</h3>
                </div>
                <p className="text-red-800 text-sm">
                  Vous avez touché un navire adverse ! La case devient rouge. 
                  Continuez à viser autour pour couler le navire.
                </p>
              </div>

              <div className="bg-sky-50 rounded-lg p-4 border-2 border-sky-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-sky-300 border-2 border-sky-400 rounded"></div>
                  <h3 className="font-bold text-sky-900">Raté</h3>
                </div>
                <p className="text-sky-800 text-sm">
                  Vous avez tiré dans l'eau. La case devient bleu clair. 
                  C'est au tour du joueur suivant.
                </p>
              </div>
            </div>
          </section>

          {/* Les bombes de détection */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">💣 Les bombes de détection</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Les bombes de détection sont une fonctionnalité optionnelle qui peut être activée par l'administrateur. 
              Elles ajoutent une dimension stratégique supplémentaire au jeu.
            </p>

            <div className="space-y-4">
              <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                <h3 className="font-bold text-orange-900 mb-2">Placement d'une bombe</h3>
                <p className="text-orange-800 text-sm">
                  Vous pouvez placer une bombe sur la grille d'un adversaire. 
                  La bombe s'activera automatiquement après 2 tours, révélant une zone de 5x5 cases autour de sa position.
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                <h3 className="font-bold text-purple-900 mb-2">Désamorçage</h3>
                <p className="text-purple-800 text-sm mb-2">
                  Si une bombe vous cible, vous pouvez la désamorcer pendant votre tour. 
                  Attention : désamorcer une bombe vous fait <strong>sauter 2 tours</strong> !
                </p>
                <p className="text-purple-800 text-sm">
                  En revanche, si vous réussissez à désamorcer la bombe, elle révèle la zone 5x5 sur la grille 
                  de l'adversaire qui l'a placée (effet miroir).
                </p>
              </div>

              <div className="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-500">
                <h3 className="font-bold text-amber-900 mb-2">Activation automatique</h3>
                <p className="text-amber-800 text-sm">
                  Si une bombe n'est pas désamorcée, elle s'active automatiquement après 2 tours et révèle 
                  une zone de 5x5 cases sur votre grille, différenciant les cases avec navires (jaune) 
                  et les cases vides (cyan).
                </p>
              </div>
            </div>
          </section>

          {/* Mode multijoueur */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">👥 Mode multijoueur</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              BattleWeb supporte les parties à 2 ou 3 joueurs :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>1v1 (2 joueurs)</strong> : Le joueur qui détruit tous les navires de son adversaire gagne</li>
              <li><strong>1v1v1 (3 joueurs)</strong> : Vous devez sélectionner votre cible avant de tirer. Le dernier joueur avec des navires gagne</li>
              <li>À chaque tour, vous ne pouvez tirer qu'une seule fois</li>
              <li>Les tours alternent entre tous les joueurs vivants</li>
            </ul>
          </section>

          {/* Timer et paramètres */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">⏱️ Timer et paramètres</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              L'administrateur peut configurer plusieurs paramètres avant de lancer la partie :
            </p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">⏱️ Temps par tour</h3>
                <p className="text-gray-700 text-sm">
                  Vous pouvez définir un temps limite pour chaque tour (45s, 75s, ou illimité). 
                  Si le temps est écoulé, le tour passe automatiquement au joueur suivant.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">💣 Bombes de détection</h3>
                <p className="text-gray-700 text-sm">
                  Activez ou désactivez les bombes de détection et définissez le nombre de bombes 
                  disponibles par joueur (0 à 3).
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">👥 Nombre de joueurs</h3>
                <p className="text-gray-700 text-sm">
                  Choisissez le nombre maximum de joueurs (2 ou 3).
                </p>
              </div>
            </div>
          </section>

          {/* Conseils stratégiques */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">💡 Conseils stratégiques</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 mb-2">🎯 Placement</h3>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Évitez les patterns prévisibles</li>
                  <li>• Espacez vos navires</li>
                  <li>• Utilisez les bords de la grille</li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-bold text-green-900 mb-2">🎲 Tir</h3>
                <ul className="text-green-800 text-sm space-y-1">
                  <li>• Cherchez des patterns dans les tirs</li>
                  <li>• Après un touché, visez autour</li>
                  <li>• En 3 joueurs, choisissez bien votre cible</li>
                </ul>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="font-bold text-orange-900 mb-2">💣 Bombes</h3>
                <ul className="text-orange-800 text-sm space-y-1">
                  <li>• Placez-les stratégiquement</li>
                  <li>• Désamorcez si nécessaire (mais vous sautez 2 tours)</li>
                  <li>• Utilisez l'effet miroir à votre avantage</li>
                </ul>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-bold text-purple-900 mb-2">⚔️ Multijoueur</h3>
                <ul className="text-purple-800 text-sm space-y-1">
                  <li>• Équilibrez vos attaques</li>
                  <li>• Ne laissez pas un joueur dominer</li>
                  <li>• Surveillez tous les adversaires</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Légende des couleurs */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🎨 Légende des couleurs</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-600 border-2 border-red-700 rounded"></div>
                <span className="text-sm text-gray-700">Touché</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-sky-300 border-2 border-sky-400 rounded"></div>
                <span className="text-sm text-gray-700">Raté</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 border-2 border-blue-200 rounded"></div>
                <span className="text-sm text-gray-700">Eau</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-400 border-2 border-amber-500 rounded"></div>
                <span className="text-sm text-gray-700">Révélé (navire)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-cyan-200 border-2 border-cyan-300 rounded"></div>
                <span className="text-sm text-gray-700">Révélé (vide)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-500 border-2 border-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  💣
                </div>
                <span className="text-sm text-gray-700">Bombe active</span>
              </div>
            </div>
          </section>

          {/* Bouton retour */}
          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

