// Client-side only Firebase initialization
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { logger } from "./logger";
// Auth は実行環境に応じて initializeAuth を使用（Capacitor/Cordova 対応）
import {
  initializeAuth,
  connectAuthEmulator,
  indexedDBLocalPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// ビルド時の実行を避けるため、設定を関数内で取得
function getFirebaseConfig() {
  // ビルド時（サーバーサイド）では環境変数チェックをスキップ
  if (typeof window === 'undefined') {
    // ビルド時は空の設定を返す（実際の初期化は実行時に行われる）
    return {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
    };
  }

  // 実行時（ブラウザ環境）では環境変数をチェック
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

  if (!apiKey) {
    throw new Error(
      "Firebase APIキーが設定されていません。.env.localファイルにNEXT_PUBLIC_FIREBASE_API_KEYを設定してください。"
    );
  }
  if (!authDomain) {
    throw new Error(
      "Firebase Auth Domainが設定されていません。.env.localファイルにNEXT_PUBLIC_FIREBASE_AUTH_DOMAINを設定してください。"
    );
  }
  if (!projectId) {
    throw new Error(
      "Firebase Project IDが設定されていません。.env.localファイルにNEXT_PUBLIC_FIREBASE_PROJECT_IDを設定してください。"
    );
  }
  if (!storageBucket) {
    throw new Error(
      "Firebase Storage Bucketが設定されていません。.env.localファイルにNEXT_PUBLIC_FIREBASE_STORAGE_BUCKETを設定してください。"
    );
  }
  if (!messagingSenderId) {
    throw new Error(
      "Firebase Messaging Sender IDが設定されていません。.env.localファイルにNEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_IDを設定してください。"
    );
  }
  if (!appId) {
    throw new Error(
      "Firebase App IDが設定されていません。.env.localファイルにNEXT_PUBLIC_FIREBASE_APP_IDを設定してください。"
    );
  }
  if (!measurementId) {
    throw new Error(
      "Firebase Measurement IDが設定されていません。.env.localファイルにNEXT_PUBLIC_FIREBASE_MEASUREMENT_IDを設定してください。"
    );
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId,
  };
}

let app;
let auth;
let db;
let analytics;
let emulatorsStarted = false;
let initializationPromise = null;

const initializeFirebase = () => {
  // 既に初期化済みの場合は既存のインスタンスを返す
  if (app && auth && db) {
    return { app, auth, db, analytics };
  }

  // 初期化中の場合は既存のPromiseを返す
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = new Promise(async (resolve, reject) => {
    try {
      // ビルド時の実行を避けるため、ブラウザ環境でのみ実行
      if (typeof window === 'undefined') {
        // ビルド時は空のインスタンスを返す
        resolve({ app: null, auth: null, db: null, analytics: null });
        return;
      }

      // Firebase設定を取得
      const firebaseConfig = getFirebaseConfig();

      // Debug Firebase configuration in all environments
      logger.debug("Firebase Configuration Debug", {
        environment: process.env.NODE_ENV,
        apiKey: firebaseConfig.apiKey ? "Set" : "Not Set",
        authDomain: firebaseConfig.authDomain ? "Set" : "Not Set",
        projectId: firebaseConfig.projectId ? "Set" : "Not Set",
        useEmulators: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true",
        currentUrl:
          typeof window !== "undefined" && window.location 
            ? window.location.href 
            : "server",
      });

      // 設定の検証
      if (
        !firebaseConfig.apiKey ||
        !firebaseConfig.authDomain ||
        !firebaseConfig.projectId
      ) {
        throw new Error("Firebase configuration is incomplete");
      }

      app = initializeApp(firebaseConfig);

      // Capacitor/Cordova 環境では cordovaPopupRedirectResolver を使用
      const isBrowser = typeof window !== "undefined";
      const isCordova = isBrowser && !!window.cordova;
      const isCapacitor = isBrowser && !!window.Capacitor;

      if (isBrowser) {
        try {
          if (isCordova || isCapacitor) {
            // Cordova/Capacitor のリダイレクト解決用リゾルバ
            const { cordovaPopupRedirectResolver } = await import(
              "firebase/auth/cordova"
            );
            auth = initializeAuth(app, {
              persistence: indexedDBLocalPersistence,
              popupRedirectResolver: cordovaPopupRedirectResolver,
            });
          } else {
            auth = initializeAuth(app, {
              // sessionStorage の問題を避けるため、より堅牢な IndexedDB/Local を優先
              persistence: [indexedDBLocalPersistence, browserLocalPersistence],
            });
          }
        } catch (e) {
          // フォールバック（万一 initializeAuth が失敗した場合）
          const fallbackErr = e instanceof Error ? e : new Error(String(e));
          logger.warn("Auth initialization fallback", fallbackErr);
          auth = initializeAuth(app, {
            persistence: indexedDBLocalPersistence,
          });
        }
      }
      db = getFirestore(app);

      // Check if we should use emulators (only connect once)
      const useEmulators =
        process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";

      if (useEmulators && typeof window !== "undefined" && !emulatorsStarted) {
        try {
          // Connect to emulators only once
          connectAuthEmulator(auth, "http://localhost:9099", {
            disableWarnings: true,
          });
          connectFirestoreEmulator(db, "localhost", 8080);
          emulatorsStarted = true;
          logger.info("Connected to Firebase emulators");
        } catch (error) {
          // Emulators might already be connected
          const emulatorErr = error instanceof Error ? error : new Error(String(error));
          logger.warn("Emulator connection warning", emulatorErr);
        }
      }

      // Initialize Analytics only in production
      if (
        typeof window !== "undefined" &&
        process.env.NODE_ENV === "production"
      ) {
        isSupported()
          .then(yes => {
            if (yes) {
              analytics = getAnalytics(app);
              logger.info("Analytics initialized");
            }
          })
          .catch(error => {
            const analyticsErr = error instanceof Error ? error : new Error(String(error));
            logger.warn("Analytics initialization failed", analyticsErr);
          });
      }

      logger.info("Firebase initialized successfully");
      resolve({ app, auth, db, analytics });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Firebase initialization error", err, {
        solutions: [
          "1. Add Firebase configuration to .env.local file",
          "2. Use Firebase emulators: NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true",
          "3. Verify Firebase project settings",
        ],
      });

      // エラーが発生した場合、初期化Promiseをリセット
      initializationPromise = null;
      reject(error);
    }
  });

  return initializationPromise;
};

// エラーハンドリング付きの初期化関数
const initializeFirebaseWithFallback = async () => {
  try {
    return await initializeFirebase();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("Firebase initialization failed", err);

    // フォールバック: 基本的な認証機能のみ
    if (typeof window !== "undefined") {
      logger.warn("Using fallback authentication mode");
      // ローカルストレージベースの認証にフォールバック
      return {
        app: null,
        auth: null,
        db: null,
        analytics: null,
        fallback: true,
      };
    }

    throw error;
  }
};

export { initializeFirebase, initializeFirebaseWithFallback };
