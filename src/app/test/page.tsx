'use client';

import { useEffect, useState } from 'react';
import { auth, db, realtimeDb } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export default function TestPage() {
  const [firebaseStatus, setFirebaseStatus] = useState<string>('Test en cours...');
  const [authStatus, setAuthStatus] = useState<string>('Test en cours...');
  const [firestoreStatus, setFirestoreStatus] = useState<string>('Test en cours...');
  const [realtimeStatus, setRealtimeStatus] = useState<string>('Test en cours...');
  const [authTestStatus, setAuthTestStatus] = useState<string>('Non testé');
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('password123');

  useEffect(() => {
    // Test connexion Firebase de base
    try {
      if (auth && db && realtimeDb) {
        setFirebaseStatus('✅ Firebase connecté');
      } else {
        setFirebaseStatus('❌ Firebase non connecté');
      }
    } catch (error) {
      setFirebaseStatus('❌ Erreur Firebase: ' + (error as Error).message);
    }

    // Test Auth
    try {
      setAuthStatus('✅ Auth disponible');
    } catch (error) {
      setAuthStatus('❌ Erreur Auth: ' + (error as Error).message);
    }

    // Test Firestore
    try {
      setFirestoreStatus('✅ Firestore disponible');
    } catch (error) {
      setFirestoreStatus('❌ Erreur Firestore: ' + (error as Error).message);
    }

    // Test Realtime Database
    try {
      setRealtimeStatus('✅ Realtime DB disponible');
    } catch (error) {
      setRealtimeStatus('❌ Erreur Realtime DB: ' + (error as Error).message);
    }
  }, []);

  const testAuth = async (action: 'register' | 'login') => {
    setAuthTestStatus('Test en cours...');
    try {
      if (action === 'register') {
        await createUserWithEmailAndPassword(auth, testEmail, testPassword);
        setAuthTestStatus('✅ Inscription réussie !');
      } else {
        await signInWithEmailAndPassword(auth, testEmail, testPassword);
        setAuthTestStatus('✅ Connexion réussie !');
      }
    } catch (error: any) {
      setAuthTestStatus(`❌ Erreur: ${error.code} - ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">🔥 Test Firebase BattleWeb</h1>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Firebase Connection:</span>
            <span className={firebaseStatus.includes('✅') ? 'text-green-600' : 'text-red-600'}>
              {firebaseStatus}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-medium">Authentication:</span>
            <span className={authStatus.includes('✅') ? 'text-green-600' : 'text-red-600'}>
              {authStatus}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-medium">Firestore:</span>
            <span className={firestoreStatus.includes('✅') ? 'text-green-600' : 'text-red-600'}>
              {firestoreStatus}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-medium">Realtime Database:</span>
            <span className={realtimeStatus.includes('✅') ? 'text-green-600' : 'text-red-600'}>
              {realtimeStatus}
            </span>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Retour à l'accueil
          </a>
        </div>

        {/* Test d'authentification */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">🧪 Test Authentification</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Email de test"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                placeholder="Mot de passe de test"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => testAuth('register')}
                className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Tester Inscription
              </button>
              <button
                onClick={() => testAuth('login')}
                className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Tester Connexion
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded">
              <strong>Résultat du test :</strong> {authTestStatus}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gray-50 p-4 rounded">
          <h3 className="font-medium mb-2">🔧 Variables d'environnement :</h3>
          <pre className="text-xs text-gray-600 overflow-x-auto">
            {JSON.stringify({
              apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Défini' : '❌ Manquant',
              authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Défini' : '❌ Manquant',
              projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Défini' : '❌ Manquant',
              databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ? '✅ Défini' : '❌ Manquant',
              messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✅ Défini' : '❌ Manquant',
              appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ Défini' : '❌ Manquant',
            }, null, 2)}
          </pre>
        </div>

        <div className="mt-6 bg-yellow-50 p-4 rounded border border-yellow-200">
          <h3 className="font-medium mb-2 text-yellow-800">⚠️ Diagnostic Authentification</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Vérifie que l'authentification Email/Password est activée dans Firebase Console</li>
            <li>• Assure-toi que Firestore et Realtime Database sont en mode "test"</li>
            <li>• Vérifie que les Security Rules permettent les écritures (pour le développement)</li>
            <li>• Utilise un email valide pour les tests</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
