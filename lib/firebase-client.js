// Client-side only Firebase initialization
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAznPMBHnEZzTB7iehxAFXUT38uCKHORBs",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "takken-d3a2b.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "takken-d3a2b",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "takken-d3a2b.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "586131197546",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:586131197546:web:0c6acf22d88d1993b6c413",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-VN0GDRL4RG"
};

let app;
let auth;
let db;
let analytics;
let emulatorsStarted = false;

const initializeFirebase = () => {
  if (!app) {
    try {
      // Debug Firebase configuration in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Firebase Configuration:', {
          apiKey: firebaseConfig.apiKey ? 'Set' : 'Not Set',
          authDomain: firebaseConfig.authDomain ? 'Set' : 'Not Set',
          projectId: firebaseConfig.projectId ? 'Set' : 'Not Set',
          useEmulators: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true'
        });
      }

      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      
      // Check if we should use emulators (only connect once)
      const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true';
      
      if (useEmulators && typeof window !== 'undefined' && !emulatorsStarted) {
        try {
          // Connect to emulators only once
          connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
          connectFirestoreEmulator(db, 'localhost', 8080);
          emulatorsStarted = true;
          console.log('Connected to Firebase emulators');
        } catch (error) {
          // Emulators might already be connected
          console.warn('Emulator connection warning:', error.message);
        }
      }
      
      // Initialize Analytics only in production
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
        isSupported().then(yes => {
          if (yes) {
            analytics = getAnalytics(app);
            console.log('Analytics initialized');
          }
        }).catch((error) => {
          console.warn('Analytics initialization failed:', error);
        });
      }
    } catch (error) {
      console.error('Firebase initialization error:', error);
      console.log('Solutions:');
      console.log('1. Add Firebase configuration to .env.local file');
      console.log('2. Use Firebase emulators: NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true');
      console.log('3. Verify Firebase project settings');
      throw error;
    }
  }
  
  return { app, auth, db, analytics };
};

export { initializeFirebase };