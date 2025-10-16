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

// シンプルな学習オプション
const quickActions = [
  {
    id: "practice",
    title: "学習開始",
    icon: "ri-book-open-line",
    description: "分野別に問題を解く",
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
  const [user, setUser] = useState<any>(null);
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
        console.error("PWA initialization failed:", error);
      }
    };

    initializePWA();

    // Firebase認証状態を監視
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      try {
        const { onAuthStateChanged } = await import("firebase/auth");
        const { initializeFirebase } = await import(
          "../../lib/firebase-client"
        );
        const { firestoreService } = await import(
          "../../lib/firestore-service"
        );
        const { auth } = initializeFirebase();

        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            try {
              // Firestoreからユーザープロファイルを取得
              const userProfile = await firestoreService.getUserProfile(
                firebaseUser.uid
              );
              if (userProfile) {
                setUser(userProfile);

                // 植物機能は削除。ユーザーのみ保存
                localStorage.setItem(
                  "takken_user",
                  JSON.stringify(userProfile)
                );
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
                setUser(initialUserData as any);
                localStorage.setItem(
                  "takken_user",
                  JSON.stringify(initialUserData)
                );
              }
            } catch (error) {
              console.error("Error loading user profile:", error);
              router.push("/auth/login");
              return;
            }
          } else {
            router.push("/");
            return;
          }
          setLoading(false);
        });
      } catch (error) {
        console.error("Error initializing auth:", error);
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
    name: user.username,
    streak: user.streak?.currentStreak || 0,
    petLevel: 0,
    petType: "none",
    petStage: 0,
    petXP: 0,
    recentPerformance: user.stats?.recentPerformance || undefined,
    weakAreas: user.stats?.weakAreas || undefined,
    lastStudyDate: user.lastStudyDate || undefined,
    totalStudyDays: user.stats?.totalStudyDays || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* シンプルなヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
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

        {/* AdSense Advertisement */}
        <section className="mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-3 text-center">
              💡 宅建試験の学習に役立つ情報
            </p>
            <AdSense
              adSlot="1234567890"
              adFormat="horizontal"
              className="rounded-lg"
            />
          </div>
        </section>

        {/* 植物の進捗UIは削除 */}

        {/* Footer with Legal Links */}
        <footer className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center space-y-2">
            <div className="flex justify-center space-x-4 text-xs text-gray-500">
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

// 植物部位の進捗表示コンポーネント
function PlantPartProgress({
  label,
  level,
  experience,
  nextLevelExp,
  color,
}: {
  label: string;
  level: number;
  experience: number;
  nextLevelExp: number;
  color: string;
}) {
  const progress = nextLevelExp > 0 ? (experience / nextLevelExp) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-medium text-gray-800">{label}</span>
        <span className="text-sm font-bold text-gray-600">Lv.{level}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-2 ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>EXP: {experience}</span>
        <span>次のレベルまで: {Math.max(0, nextLevelExp - experience)}</span>
      </div>
    </div>
  );
}
