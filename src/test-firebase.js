// Script de test Firebase (à exécuter dans le navigateur)
console.log('🔥 Test Firebase Connection');

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, connectAuthEmulator } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, connectFirestoreEmulator } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getDatabase, connectDatabaseEmulator } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

const firebaseConfig = {
  apiKey: "AIzaSyBiHzosm4MWc1zMENAKrmaB9HNsrMvtICU",
  authDomain: "battleweb-77067.firebaseapp.com",
  databaseURL: "https://battleweb-77067-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "battleweb-77067",
  storageBucket: "battleweb-77067.firebasestorage.app",
  messagingSenderId: "860367319048",
  appId: "1:860367319048:web:6c994d604e3d10861561bd"
};

try {
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized');

  const auth = getAuth(app);
  console.log('✅ Auth initialized');

  const db = getFirestore(app);
  console.log('✅ Firestore initialized');

  const realtimeDb = getDatabase(app);
  console.log('✅ Realtime Database initialized');

  console.log('🎉 Toutes les connexions Firebase sont OK !');

} catch (error) {
  console.error('❌ Erreur Firebase:', error);
}
