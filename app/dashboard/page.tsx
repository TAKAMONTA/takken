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
import {
  getTodayQuestionsAnswered,
  getWeaknessItems,
} from "@/lib/weakness-helper";

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
  {
    id: "mock-exam",
    title: "模試",
    icon: "ri-file-list-3-line",
    description: "本番配分50問で実力チェック",
    route: "/mock-exam",
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
        // localStorageは表示キャッシュとしてだけ使い、ログイン判定はFirebase Authで行う。
        const localUserData = localStorage.getItem("takken_user");
        logger.debug("Dashboard Auth Debug", {
          environment: process.env.NODE_ENV,
          hasLocalUserData: !!localUserData,
          localUserData: localUserData ? "exists" : "null",
          currentUrl:
            typeof window !== "undefined" ? window.location.href : "server",
        });

        const { onAuthStateChanged } = await import("firebase/auth");
        const { initializeFirebaseWithFallback } = await import(
          "../../lib/firebase-client"
        );
        const { firestoreService } = await import(
          "../../lib/firestore-service"
        );
        const firebase = await initializeFirebaseWithFallback();

        if (firebase.fallback || !firebase.auth) {
          logger.warn("Firebase Auth is unavailable; redirecting to login");
          router.push("/auth/login");
          setLoading(false);
          return;
        }

        unsubscribe = onAuthStateChanged(firebase.auth, async firebaseUser => {
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
              const localUserData = localStorage.getItem("takken_user");
              if (localUserData) {
                try {
                  const userData = JSON.parse(localUserData);
                  if (userData.id === firebaseUser.uid) {
                    setUser(userData);
                    setLoading(false);
                    logger.debug("Using cached profile for authenticated Firebase user", { userId: userData.id });
                    return;
                  }
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
            logger.debug("No authentication found, redirecting to login");
            localStorage.removeItem("takken_user");
            router.push("/auth/login");
            return;
          }
          setLoading(false);
        });
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("Error initializing auth", err);
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
    <div className="study-shell">
      {/* シンプルなヘッダー */}
      <header className="border-b border-study-border bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-md space-y-3 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-study-accent">
                <span className="text-lg font-bold text-white">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-study-ink">
                  こんにちは、{user?.name || "ユーザー"}さん！
                </h1>
                <p className="text-sm text-study-muted">
                  今日も学習を頑張りましょう
                </p>
              </div>
            </div>
            <SubscriptionBadge />
          </div>
          <AIUsageIndicator showUpgradeButton={false} />
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-6 pb-safe-nav">
        {/* 植物機能は削除 */}

        {/* AI Teacher Section */}
        <section className="mb-6">
          <AITeacher
            userContext={userContext}
            className="study-card"
          />
        </section>

        {/* 学習進捗セクション */}
        <section className="mb-6">
          <div className="study-card p-4">
            <div className="mb-3 flex items-center">
              <div className="mr-3 text-2xl text-study-accent">📈</div>
              <div>
                <h3 className="font-semibold text-study-ink">学習進捗</h3>
                <p className="text-sm text-study-muted">今日の学習状況を確認</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-study-accent-soft p-3 text-center">
                <p className="text-2xl font-bold text-study-accent">
                  {userContext.streak}
                </p>
                <p className="text-sm text-study-muted">連続学習日数</p>
              </div>
              <div className="rounded-lg bg-study-accent-soft p-3 text-center">
                <p className="text-2xl font-bold text-study-accent">
                  {getTodayQuestionsAnswered(user)}
                </p>
                <p className="text-sm text-study-muted">今日の問題数</p>
              </div>
            </div>
          </div>
        </section>

        {/* 苦手分野セクション */}
        <section className="mb-6">
          <div className="study-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-3 text-2xl text-study-accent">🎯</div>
                <div>
                  <h3 className="font-semibold text-study-ink">苦手分野</h3>
                  <p className="text-sm text-study-muted">
                    重点的に学習すべき分野
                  </p>
                </div>
              </div>
              <Link href="/weak-points">
                <div className="cursor-pointer text-study-muted hover:text-study-ink">
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
            {(() => {
              const items = user ? getWeaknessItems(user.id) : [];
              const top = items[0];
              if (!top || top.isDefault) {
                return (
                  <div className="rounded-lg bg-study-accent-soft p-3 text-center">
                    <p className="mb-2 text-sm text-study-ink">
                      まずは宅建業法から始めてみましょう
                    </p>
                    <Link
                      href="/practice/quiz?category=takkengyouhou&level=beginner"
                      className="inline-block text-sm font-medium text-study-accent"
                    >
                      基礎5問を解く →
                    </Link>
                  </div>
                );
              }
              return (
                <div className="rounded-lg bg-study-accent-soft p-3">
                  <p className="text-sm font-medium text-study-ink">
                    {top.icon} {top.name}（正答率 {top.accuracy}%）
                  </p>
                  <p className="mb-2 mt-1 text-xs text-study-muted">{top.reason}</p>
                  <Link
                    href={`/weak-points`}
                    className="text-sm font-medium text-study-accent"
                  >
                    弱点克服を始める →
                  </Link>
                </div>
              );
            })()}
          </div>
        </section>

        {/* 初回ワンタップ */}
        <section className="mb-6">
          <Link href="/practice/quiz?category=takkengyouhou&level=beginner">
            <div className="study-cta">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm text-white/80">今日のおすすめ（頻出A）</p>
                  <p className="text-lg font-bold">宅建業法 基礎をサクッと</p>
                  <p className="mt-1 text-sm text-white/80">約5問・ワンタップで開始</p>
                </div>
                <i className="ri-play-circle-fill text-4xl text-white/70"></i>
              </div>
            </div>
          </Link>
        </section>

        {/* Study Menu */}
        <section className="mb-8">
          <div className="text-center mb-6">
            <h3 className="mb-2 text-xl font-bold text-study-ink">
              学習を始めよう
            </h3>
            <p className="text-study-muted">
              宅建試験の合格を目指して学習しましょう
            </p>
          </div>

          <div className="space-y-4">
            {quickActions.map((action, index) => (
              <Link key={action.id} href={action.route}>
                <motion.div
                  className="study-card p-4 transition-colors hover:bg-study-accent-soft/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-study-accent-soft">
                      <i className={`${action.icon} text-xl text-study-accent`} aria-hidden />
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-1 font-medium text-study-ink">
                        {action.title}
                      </h4>
                      <p className="text-sm text-study-muted">
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
              className="study-premium"
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
              <Link href="/subscription/pricing" className="font-medium text-study-accent hover:opacity-80">
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
              © {new Date().getFullYear()} 宅建合格ロード. All rights reserved.
            </p>
          </div>
        </footer>
      </main>

      {/* シンプルなボトムナビゲーション */}
      <nav className="study-bottom-nav" aria-label="メインメニュー">
        <div className="study-bottom-nav-inner">
          <Link href="/dashboard" className="study-nav-item study-nav-item-active">
            <i className="ri-home-line text-xl"></i>
            <span>ホーム</span>
          </Link>
          <Link href="/practice" className="study-nav-item">
            <i className="ri-book-open-line text-xl"></i>
            <span>学習</span>
          </Link>
          <Link href="/mock-exam" className="study-nav-item">
            <i className="ri-file-list-3-line text-xl"></i>
            <span>模試</span>
          </Link>
          <Link href="/weak-points" className="study-nav-item">
            <i className="ri-target-line text-xl"></i>
            <span>弱点</span>
          </Link>
          <Link href="/profile" className="study-nav-item">
            <i className="ri-user-line text-xl"></i>
            <span>設定</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

// 植物部位の進捗表示コンポーネント（削除予定 - v1.1で削除）
// 現在は未使用 - gamification機能削除に伴い存続していたコンポーネント
