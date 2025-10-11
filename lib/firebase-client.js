// Client-side only Firebase initialization
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
// Auth は実行環境に応じて initializeAuth を使用（Capacitor/Cordova 対応）
import {
  initializeAuth,
  connectAuthEmulator,
  indexedDBLocalPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    (() => {
      throw new Error(
        "Firebase APIキーが設定されていません。.env.localファイルにNEXT_PUBLIC_FIREBASE_API_KEYを設定してください。"
      );
    })(),
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    (() => {
      throw new Error(
        "Firebase Auth Domainが設定されていません。.env.localファイルにNEXT_PUBLIC_FIREBASE_AUTH_DOMAINを設定してください。"
      );
    })(),
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    (() => {
      throw new Error(
        "Firebase Project IDが設定されていません。.env.localファイルにNEXT_PUBLIC_FIREBASE_PROJECT_IDを設定してください。"
      );
    })(),
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    (() => {
      throw new Error(
        "Firebase Storage Bucketが設定されていません。.env.localファイルにNEXT_PUBLIC_FIREBASE_STORAGE_BUCKETを設定してください。"
      );
    })(),
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    (() => {
      throw new Error(
        "Firebase Messaging Sender IDが設定されていません。.env.localファイルにNEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_IDを設定してください。"
      );
    })(),
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    (() => {
      throw new Error(
        "Firebase App IDが設定されていません。.env.localファイルにNEXT_PUBLIC_FIREBASE_APP_IDを設定してください。"
      );
    })(),
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
    (() => {
      throw new Error(
        "Firebase Measurement IDが設定されていません。.env.localファイルにNEXT_PUBLIC_FIREBASE_MEASUREMENT_IDを設定してください。"
      );
    })(),
};

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
      // Debug Firebase configuration in development
      if (process.env.NODE_ENV === "development") {
        console.log("Firebase Configuration:", {
          apiKey: firebaseConfig.apiKey ? "Set" : "Not Set",
          authDomain: firebaseConfig.authDomain ? "Set" : "Not Set",
          projectId: firebaseConfig.projectId ? "Set" : "Not Set",
          useEmulators:
            process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true",
        });
      }

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
          console.warn("Auth initialization fallback:", e);
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
          console.log("Connected to Firebase emulators");
        } catch (error) {
          // Emulators might already be connected
          console.warn("Emulator connection warning:", error.message);
        }
      }

      // Initialize Analytics only in production
      if (
        typeof window !== "undefined" &&
        process.env.NODE_ENV === "production"
      ) {
        isSupported()
          .then((yes) => {
            if (yes) {
              analytics = getAnalytics(app);
              console.log("Analytics initialized");
            }
          })
          .catch((error) => {
            console.warn("Analytics initialization failed:", error);
          });
      }

      console.log("Firebase initialized successfully");
      resolve({ app, auth, db, analytics });
    } catch (error) {
      console.error("Firebase initialization error:", error);
      console.log("Solutions:");
      console.log("1. Add Firebase configuration to .env.local file");
      console.log(
        "2. Use Firebase emulators: NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true"
      );
      console.log("3. Verify Firebase project settings");

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
    console.error("Firebase initialization failed:", error);

    // フォールバック: 基本的な認証機能のみ
    if (typeof window !== "undefined") {
      console.log("Using fallback authentication mode");
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
