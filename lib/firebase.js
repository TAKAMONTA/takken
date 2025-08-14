import { initializeFirebase } from './firebase-client';

const { app, auth, db, analytics } = initializeFirebase();

// 認証状態の確認用ヘルパー関数
const checkAuth = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Browser environment required'));
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
  
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const subscriptionDoc = await getDoc(doc(db, 'subscriptions', userId));
    return subscriptionDoc.exists();
  } catch (error) {
    console.error('プレミアムステータスの確認に失敗:', error);
    return false;
  }
};

export { app, auth, db, analytics, checkAuth, checkPremiumStatus };
