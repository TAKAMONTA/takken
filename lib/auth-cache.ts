"use client";

import type { User } from "firebase/auth";
import { logger } from "@/lib/logger";

export async function getCurrentFirebaseUser(): Promise<User | null> {
  try {
    const { initializeFirebaseWithFallback } = await import("@/lib/firebase-client");
    const firebase = await initializeFirebaseWithFallback();

    if (firebase.fallback || !firebase.auth) {
      return null;
    }

    if (firebase.auth.currentUser) {
      return firebase.auth.currentUser;
    }

    const { onAuthStateChanged } = await import("firebase/auth");
    return await new Promise<User | null>((resolve) => {
      const unsubscribe = onAuthStateChanged(firebase.auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("Failed to resolve Firebase auth user", err);
    return null;
  }
}

export async function getCachedUserForCurrentAuth<T extends { id?: string } = { id?: string }>(): Promise<T | null> {
  const firebaseUser = await getCurrentFirebaseUser();
  if (!firebaseUser) {
    clearCachedUser();
    return null;
  }

  try {
    const cached = localStorage.getItem("takken_user");
    if (!cached) {
      return null;
    }

    const parsed = JSON.parse(cached) as T;
    if (parsed?.id !== firebaseUser.uid) {
      logger.warn("Cached user does not match Firebase user; clearing cache", {
        firebaseUid: firebaseUser.uid,
        cachedUserId: parsed?.id,
      });
      clearCachedUser();
      return null;
    }

    return parsed;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("Failed to read cached user", err);
    clearCachedUser();
    return null;
  }
}

export async function requireCachedUserForCurrentAuth<T extends { id?: string } = { id?: string }>(
  onUnauthenticated: () => void
): Promise<T | null> {
  const user = await getCachedUserForCurrentAuth<T>();
  if (!user) {
    onUnauthenticated();
    return null;
  }
  return user;
}

export function setCachedUser(user: unknown): void {
  localStorage.setItem("takken_user", JSON.stringify(user));
}

export function clearCachedUser(): void {
  localStorage.removeItem("takken_user");
}
