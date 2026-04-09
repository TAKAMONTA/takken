"use client";

import type { User } from "firebase/auth";
import { logger } from "@/lib/logger";

/**
 * Firebase ログイン成功後に Firestore プロファイルと takken_user を同期しダッシュボードへ遷移する。
 */
export async function persistTakkenSessionFromFirebaseUser(
  user: User,
  router: { push: (href: string) => void },
  opts?: {
    appleEmail?: string | null;
    appleGivenName?: string | null;
    appleFamilyName?: string | null;
  }
): Promise<void> {
  const { firestoreService } = await import("@/lib/firestore-service");

  let userProfile = null;
  try {
    userProfile = await firestoreService.getUserProfile(user.uid);
  } catch (e) {
    logger.error(
      "Firestore profile fetch failed",
      e instanceof Error ? e : new Error(String(e)),
      { userId: user.uid }
    );
  }

  const nameFromApple = [opts?.appleGivenName, opts?.appleFamilyName]
    .filter((x): x is string => typeof x === "string" && x.length > 0)
    .join(" ")
    .trim();

  const resolvedEmail =
    (opts?.appleEmail && opts.appleEmail.trim()) ||
    user.email ||
    "";

  if (!userProfile) {
    try {
      await firestoreService.createUserProfile(user.uid, {
        id: user.uid,
        name: nameFromApple || user.displayName || "ユーザー",
        email: resolvedEmail || user.email || "",
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
      });
      userProfile = await firestoreService.getUserProfile(user.uid);
    } catch (e) {
      logger.error(
        "createUserProfile failed",
        e instanceof Error ? e : new Error(String(e)),
        { userId: user.uid }
      );
    }
  }

  const userData = {
    id: user.uid,
    username: (
      userProfile?.name ||
      nameFromApple ||
      user.displayName ||
      "ユーザー"
    ).substring(0, 50),
    name: userProfile?.name || nameFromApple || user.displayName || "ユーザー",
    email: userProfile?.email || resolvedEmail || user.email || "",
    joinedAt: userProfile?.joinedAt || new Date().toISOString(),
    streak: userProfile?.streak || {
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: "",
      studyDates: [],
    },
    progress: userProfile?.progress || {
      totalQuestions: 0,
      correctAnswers: 0,
      studyTimeMinutes: 0,
      categoryProgress: {},
    },
    learningRecords: userProfile?.learningRecords || [],
  };

  localStorage.setItem("takken_user", JSON.stringify(userData));
  router.push("/dashboard");
}
