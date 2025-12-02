import { initializeFirebase } from './firebase-client';
import { logger } from './logger';

// ビルド時の実行を避けるため、条件分岐を追加
let firebaseInstance = null;

function getFirebaseInstance() {
  if (!firebaseInstance) {
    firebaseInstance = initializeFirebase();
  }
  return firebaseInstance;
}

// トップレベルでの初期化を避け、必要になった時点で初期化
const isBrowser = typeof window !== 'undefined';
const isDevelopment = process.env.NODE_ENV === 'development';

let app, auth, db, analytics;

if (isBrowser || isDevelopment) {
  const instance = getFirebaseInstance();
  app = instance.app;
  auth = instance.auth;
  db = instance.db;
  analytics = instance.analytics;
} else {
  app = null;
  auth = null;
  db = null;
  analytics = null;
}

// 認証状態の確認用ヘルパー関数
const checkAuth = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Browser environment required'));
  }
  
  if (!auth) {
    return Promise.reject(new Error('Firebase Auth is not initialized'));
  }
  
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        reject(new Error('認証が必要です'));
      }
    });
  });
};

// プレミアム会員確認用ヘルパー関数
const checkPremiumStatus = async (userId) => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  if (!db) {
    logger.warn('Firestore is not initialized');
    return false;
  }
  
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const subscriptionDoc = await getDoc(doc(db, 'subscriptions', userId));
    return subscriptionDoc.exists();
  } catch (error) {
    logger.error('プレミアムステータスの確認に失敗', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
};

export { app, auth, db, analytics, checkAuth, checkPremiumStatus };
