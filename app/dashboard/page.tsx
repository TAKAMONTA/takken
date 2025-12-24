"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AITeacher from "@/components/AITeacher";
import { UserContext } from "@/lib/ai-teacher-messages";
// 植物機能は削除
import { motion } from "framer-motion";
import { OfflineSyncManager } from "@/lib/offline-sync";
import {
  PushNotificationManager,
  StudyReminderManager,
} from "@/lib/push-notifications";
import AdSense from "@/components/AdSense";
import { logger } from "@/lib/logger";
import StudyInfoSection from "@/components/StudyInfoSection";
import { UserProfile } from "@/lib/types";
import SubscriptionBadge from "@/components/SubscriptionBadge";
import AIUsageIndicator from "@/components/AIUsageIndicator";

// シンプルな学習オプション
const quickActions = [
  {
    id: "practice",
    title: "AI予想問題",
    icon: "ri-book-open-line",
    description: "AI生成問題を分野別に学習",
    route: "/practice",
  },
  {
    id: "weak-points",
    title: "弱点克服",
    icon: "ri-target-line",
    description: "苦手な問題を再挑戦",
    route: "/weak-points",
  },
];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  // 植物機能は削除

  useEffect(() => {
    // PWA機能の初期化
    const initializePWA = async () => {
      try {
        // オフライン同期の初期化
        const offlineSync = OfflineSyncManager.getInstance();
        await offlineSync.initialize();
        offlineSync.setupConnectionListener();

        // プッシュ通知の初期化
        const pushManager = PushNotificationManager.getInstance();
        await pushManager.initialize();

        // 学習リマインダーの設定
        const reminderManager = StudyReminderManager.getInstance();
        const reminderSettings = reminderManager.getReminderSettings();

        if (reminderSettings && reminderSettings.enabled) {
          await reminderManager.setupReminder(
            reminderSettings.hour,
            reminderSettings.minute
          );
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("PWA initialization failed", err);
      }
    };

    initializePWA();

    // Firebase認証状態を監視
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      try {
        // まずローカルストレージからユーザー情報を確認
        const localUserData = localStorage.getItem("takken_user");
        logger.debug("Dashboard Auth Debug", {
          environment: process.env.NODE_ENV,
          hasLocalUserData: !!localUserData,
          localUserData: localUserData ? "exists" : "null",
          currentUrl:
            typeof window !== "undefined" ? window.location.href : "server",
        });

        if (localUserData) {
          try {
            const userData = JSON.parse(localUserData);
            logger.debug("Local user data found", {
              id: userData.id,
              name: userData.name,
              email: userData.email,
            });
            setUser(userData);
            setLoading(false);
            return;
          } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            logger.error("Error parsing local user data", err);
            localStorage.removeItem("takken_user");
          }
        }

        // Firebase認証も試行
        const { onAuthStateChanged } = await import("firebase/auth");
        const { initializeFirebase } = await import(
          "../../lib/firebase-client"
        );
        const { firestoreService } = await import(
          "../../lib/firestore-service"
        );
        const { auth } = initializeFirebase();

        unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
          logger.debug("Firebase Auth State Changed", {
            hasFirebaseUser: !!firebaseUser,
            firebaseUserUid: firebaseUser?.uid,
            firebaseUserEmail: firebaseUser?.email,
          });

          if (firebaseUser) {
            try {
              // Firestoreからユーザープロファイルを取得
              const userProfile = await firestoreService.getUserProfile(
                firebaseUser.uid
              );
              logger.debug("Firestore Profile", {
                hasProfile: !!userProfile,
                profileName: userProfile?.name,
                userId: firebaseUser.uid,
              });

              if (userProfile) {
                setUser(userProfile);

                // ローカルストレージにも保存
                localStorage.setItem(
                  "takken_user",
                  JSON.stringify(userProfile)
                );
                logger.debug("Firebase user profile saved to localStorage", {
                  userId: firebaseUser.uid,
                });
              } else {
                // プロファイルが存在しない場合は初期データを作成
                const initialUserData = {
                  id: firebaseUser.uid,
                  name: firebaseUser.displayName || "ユーザー",
                  email: firebaseUser.email || "",
                  joinedAt: new Date().toISOString(),
                  streak: {
                    currentStreak: 0,
                    longestStreak: 0,
                    lastStudyDate: "",
                    studyDates: [],
                  },
                  progress: {
                    totalQuestions: 0,
                    correctAnswers: 0,
                    studyTimeMinutes: 0,
                    categoryProgress: {},
                  },
                  learningRecords: [],
                };
                await firestoreService.createUserProfile(
                  firebaseUser.uid,
                  initialUserData
                );
                setUser(initialUserData as UserProfile);
                localStorage.setItem(
                  "takken_user",
                  JSON.stringify(initialUserData)
                );
                logger.info("Initial user data created and saved", {
                  userId: firebaseUser.uid,
                });
              }
            } catch (error) {
              const err = error instanceof Error ? error : new Error(String(error));
              logger.error("Error loading user profile", err, { userId: firebaseUser?.uid });
              // Firebaseエラーの場合はローカルストレージ認証にフォールバック
              const localUserData = localStorage.getItem("takken_user");
              if (localUserData) {
                try {
                  const userData = JSON.parse(localUserData);
                  setUser(userData);
                  setLoading(false);
                  logger.debug("Fallback to local user data", { userId: userData.id });
                  return;
                } catch (parseError) {
                  const parseErr = parseError instanceof Error ? parseError : new Error(String(parseError));
                  logger.error("Error parsing local user data", parseErr);
                }
              }
              logger.debug("Redirecting to login page due to Firebase error");
              router.push("/auth/login");
              return;
            }
          } else {
            // Firebase認証されていない場合、ローカルストレージを再確認
            logger.debug("Firebase user not found, checking localStorage again");
            const localUserData = localStorage.getItem("takken_user");
            if (localUserData) {
              try {
                const userData = JSON.parse(localUserData);
                setUser(userData);
                setLoading(false);
                logger.debug("Using localStorage user data", { userId: userData.id });
                return;
              } catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger.error("Error parsing local user data", err);
                localStorage.removeItem("takken_user");
              }
            }
            // どちらの認証も失敗した場合はログインページへ
            logger.debug("No authentication found, redirecting to login");
            router.push("/auth/login");
            return;
          }
          setLoading(false);
        });
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("Error initializing auth", err);
        // Firebase初期化エラーの場合はローカルストレージ認証にフォールバック
        const localUserData = localStorage.getItem("takken_user");
        if (localUserData) {
          try {
            const userData = JSON.parse(localUserData);
            setUser(userData);
            setLoading(false);
            return;
          } catch (parseError) {
            const parseErr = parseError instanceof Error ? parseError : new Error(String(parseError));
            logger.error("Error parsing local user data", parseErr);
            localStorage.removeItem("takken_user");
          }
        }
        router.push("/auth/login");
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  // AI先生用のユーザーコンテキスト（植物機能削除に伴い簡略化）
  const userContext: UserContext = {
    name: user.name,
    streak: user.streak?.currentStreak || 0,
    petLevel: 0,
    petType: "none",
    petStage: 0,
    petXP: 0,
    recentPerformance: undefined, // UserProfileには stats がないため undefined
    weakAreas: undefined, // UserProfileには stats がないため undefined
    lastStudyDate: user.streak?.lastStudyDate || undefined,
    totalStudyDays: user.streak?.studyDates?.length || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* シンプルなヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>
              <div>
                <h1 className="text-lg font-medium text-gray-900">
                  こんにちは、{user?.name || "ユーザー"}さん！
                </h1>
                <p className="text-sm text-gray-600">
                  今日も学習を頑張りましょう
                </p>
              </div>
            </div>
            <SubscriptionBadge />
          </div>
          <AIUsageIndicator showUpgradeButton={false} />
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 pb-24">
        {/* 植物機能は削除 */}

        {/* AI Teacher Section */}
        <section className="mb-6">
          <AITeacher
            userContext={userContext}
            className="bg-white rounded-lg border border-gray-200"
          />
        </section>

        {/* 学習進捗セクション */}
        <section className="mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="text-green-600 text-2xl mr-3">📈</div>
                <div>
                  <h3 className="font-semibold text-gray-900">学習進捗</h3>
                  <p className="text-sm text-gray-600">今日の学習状況を確認</p>
                </div>
              </div>
              <Link href="/stats/progress">
                <div className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-2xl font-bold text-green-600">
                  {userContext.streak}
                </p>
                <p className="text-sm text-gray-600">連続学習日数</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-2xl font-bold text-blue-600">0</p>
                <p className="text-sm text-gray-600">今日の問題数</p>
              </div>
            </div>
          </div>
        </section>

        {/* 苦手分野セクション */}
        <section className="mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="text-orange-600 text-2xl mr-3">🎯</div>
                <div>
                  <h3 className="font-semibold text-gray-900">苦手分野</h3>
                  <p className="text-sm text-gray-600">
                    重点的に学習すべき分野
                  </p>
                </div>
              </div>
              <Link href="/weak-points">
                <div className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded">
              <p className="text-sm text-orange-700">
                苦手分野を特定するには、まず問題を解いてみましょう
              </p>
            </div>
          </div>
        </section>

        {/* Study Menu */}
        <section className="mb-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              学習を始めよう
            </h3>
            <p className="text-gray-600">
              宅建試験の合格を目指して学習しましょう
            </p>
          </div>

          <div className="space-y-4">
            {quickActions.map((action, index) => (
              <Link key={action.id} href={action.route}>
                <motion.div
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <i className={`${action.icon} text-primary text-lg`}></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {action.title}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {action.description}
                      </p>
                    </div>
                    <i className="ri-arrow-right-s-line text-gray-400"></i>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* プレミアムプランへの誘導 */}
        <section className="mb-6">
          <Link href="/subscription/pricing">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-4 text-white shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <i className="ri-vip-crown-line text-2xl"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">プレミアムプラン</h4>
                    <p className="text-sm text-white/80">
                      AI機能無制限・広告非表示
                    </p>
                  </div>
                </div>
                <i className="ri-arrow-right-s-line text-2xl"></i>
              </div>
            </motion.div>
          </Link>
        </section>

        {/* Study Information Section */}
        <section className="mb-6">
          <StudyInfoSection user={user} />
        </section>

        {/* AdSense Advertisement (Optional - can be removed or moved) */}
        {/* <section className="mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-3 text-center">
              💡 広告
            </p>
            <AdSense
              adSlot="1234567890"
              adFormat="horizontal"
              className="rounded-lg"
            />
          </div>
        </section> */}

        {/* 植物の進捗UIは削除 */}

        {/* Footer with Legal Links */}
        <footer className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center space-y-2">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-gray-500">
              <Link href="/subscription/pricing" className="hover:text-gray-700 font-medium text-purple-600">
                料金プラン
              </Link>
              <Link href="/legal" className="hover:text-gray-700">
                特定商取引法に基づく表記
              </Link>
              <Link href="/privacy" className="hover:text-gray-700">
                プライバシーポリシー
              </Link>
              <Link href="/terms" className="hover:text-gray-700">
                利用規約
              </Link>
            </div>
            <p className="text-xs text-gray-400">
              © 2025 宅建合格ロード. All rights reserved.
            </p>
          </div>
        </footer>
      </main>

      {/* シンプルなボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto px-4">
          <div className="flex justify-around items-center h-16">
            <Link
              href="/dashboard"
              className="flex flex-col items-center space-y-1 text-blue-600"
            >
              <i className="ri-home-line text-xl"></i>
              <span className="text-xs">ホーム</span>
            </Link>
            <Link
              href="/practice"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-gray-900"
            >
              <i className="ri-book-open-line text-xl"></i>
              <span className="text-xs">学習</span>
            </Link>
            <Link
              href="/subscription/pricing"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-gray-900"
            >
              <i className="ri-vip-crown-line text-xl"></i>
              <span className="text-xs">プラン</span>
            </Link>
            <Link
              href="/stats"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-gray-900"
            >
              <i className="ri-bar-chart-line text-xl"></i>
              <span className="text-xs">分析</span>
            </Link>
            <Link
              href="/profile"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-gray-900"
            >
              <i className="ri-user-line text-xl"></i>
              <span className="text-xs">設定</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}

// 植物部位の進捗表示コンポーネント（削除予定 - v1.1で削除）
// 現在は未使用 - gamification機能削除に伴い存続していたコンポーネント
