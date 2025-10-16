// Firestore Database Service

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { UserProfile, StudySession } from "./types";
import { Question } from "./types/quiz";
import { UserSubscription } from "./subscription-service";

export interface FirestoreUser extends Omit<UserProfile, "id"> {
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface FirestoreStudySession
  extends Omit<StudySession, "id" | "startTime" | "endTime"> {
  startTime: any; // Firestore Timestamp
  endTime: any; // Firestore Timestamp
  createdAt: any; // Firestore Timestamp
}

export interface SyncStatus {
  lastSyncTime: Date;
  pendingChanges: number;
  isOnline: boolean;
}

class FirestoreService {
  private syncStatus: SyncStatus = {
    lastSyncTime: new Date(),
    pendingChanges: 0,
    isOnline: typeof window !== "undefined" ? navigator.onLine : false,
  };

  constructor() {
    // Monitor online status only in browser environment
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        this.syncStatus.isOnline = true;
        this.syncPendingChanges();
      });

      window.addEventListener("offline", () => {
        this.syncStatus.isOnline = false;
      });
    }
  }

  // 入力値検証関数
  private validateUserId(userId: string): boolean {
    return (
      typeof userId === "string" &&
      userId.trim().length > 0 &&
      userId.length <= 128
    );
  }

  private sanitizeUserData(data: any): any {
    if (!data || typeof data !== "object") return data;

    const sanitized = { ...data };

    // 文字列フィールドのサニタイズ
    if (sanitized.name && typeof sanitized.name === "string") {
      sanitized.name = sanitized.name.trim().substring(0, 50);
    }
    if (sanitized.email && typeof sanitized.email === "string") {
      sanitized.email = sanitized.email.trim().toLowerCase().substring(0, 100);
    }

    return sanitized;
  }

  // User Profile Operations
  async createUserProfile(userId: string, profile: UserProfile): Promise<void> {
    // 入力値検証
    if (!this.validateUserId(userId)) {
      throw new Error("Invalid user ID");
    }

    if (!profile || typeof profile !== "object") {
      throw new Error("Invalid profile data");
    }

    try {
      const userRef = doc(db, "users", userId);
      const sanitizedProfile = this.sanitizeUserData(profile);

      const firestoreProfile: FirestoreUser = {
        ...sanitizedProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(userRef, firestoreProfile);
      console.log("User profile created successfully for user:", userId);
    } catch (error) {
      console.error("Error creating user profile:", error);

      // 特定のエラーに対する詳細なハンドリング
      if (error instanceof Error) {
        if (error.message.includes("permission-denied")) {
          throw new Error("プロファイル作成の権限がありません");
        } else if (error.message.includes("network-request-failed")) {
          this.handleOfflineOperation("createUser", { userId, profile });
          throw new Error(
            "ネットワークエラーが発生しました。オフラインで保存されました"
          );
        } else if (error.message.includes("quota-exceeded")) {
          throw new Error("データベースの容量制限に達しました");
        }
      }

      this.handleOfflineOperation("createUser", { userId, profile });
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    // 入力値検証
    if (!this.validateUserId(userId)) {
      throw new Error("Invalid user ID");
    }

    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as FirestoreUser;

        // データの整合性チェック
        if (!data.name || !data.email) {
          console.warn("Incomplete user profile data for user:", userId);
        }

        return {
          id: userSnap.id,
          ...data,
          joinedAt:
            data.createdAt?.toDate?.()?.toISOString() ||
            new Date().toISOString(),
        };
      }

      return null;
    } catch (error) {
      console.error("Error getting user profile:", error);

      // 特定のエラーに対する詳細なハンドリング
      if (error instanceof Error) {
        if (error.message.includes("permission-denied")) {
          console.error("Permission denied for user profile access:", userId);
          return null;
        } else if (error.message.includes("network-request-failed")) {
          console.warn("Network error, falling back to local storage");
        }
      }

      // Fallback to localStorage
      return this.getLocalUserProfile(userId);
    }
  }

  async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<void> {
    // 入力値検証
    if (!this.validateUserId(userId)) {
      throw new Error("Invalid user ID");
    }

    if (!updates || typeof updates !== "object") {
      throw new Error("Invalid update data");
    }

    const sanitizedUpdates = this.sanitizeUserData(updates);

    try {
      const userRef = doc(db, "users", userId);

      const firestoreUpdates = {
        ...sanitizedUpdates,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(userRef, firestoreUpdates);

      // Also update localStorage
      this.updateLocalUserProfile(userId, sanitizedUpdates);

      console.log("User profile updated successfully for user:", userId);
    } catch (error) {
      console.error("Error updating user profile:", error);

      // 特定のエラーに対する詳細なハンドリング
      if (error instanceof Error) {
        if (error.message.includes("permission-denied")) {
          throw new Error("プロファイル更新の権限がありません");
        } else if (error.message.includes("not-found")) {
          throw new Error("ユーザープロファイルが見つかりません");
        } else if (error.message.includes("network-request-failed")) {
          this.handleOfflineOperation("updateUser", { userId, updates });
          // Update localStorage as fallback
          this.updateLocalUserProfile(userId, sanitizedUpdates);
          throw new Error(
            "ネットワークエラーが発生しました。オフラインで保存されました"
          );
        }
      }

      this.handleOfflineOperation("updateUser", { userId, updates });

      // Update localStorage as fallback
      this.updateLocalUserProfile(userId, sanitizedUpdates);
      throw error;
    }
  }

  // Study Session Operations
  async saveStudySession(session: StudySession): Promise<string> {
    try {
      const sessionsRef = collection(db, "studySessions");
      const firestoreSession: FirestoreStudySession = {
        ...session,
        startTime: new Date(session.startTime),
        endTime: new Date(session.endTime),
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(sessionsRef, firestoreSession);
      console.log("Study session saved successfully");
      return docRef.id;
    } catch (error) {
      console.error("Error saving study session:", error);
      this.handleOfflineOperation("saveSession", { session });

      // Save to localStorage as fallback
      this.saveLocalStudySession(session);
      return session.id;
    }
  }

  async getStudySessions(
    userId: string,
    limitCount: number = 50
  ): Promise<StudySession[]> {
    try {
      const sessionsRef = collection(db, "studySessions");
      const q = query(
        sessionsRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const sessions: StudySession[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirestoreStudySession;
        sessions.push({
          id: doc.id,
          ...data,
          startTime: data.startTime?.toDate?.() || new Date(),
          endTime: data.endTime?.toDate?.() || new Date(),
        });
      });

      return sessions;
    } catch (error) {
      console.error("Error getting study sessions:", error);
      // Fallback to localStorage
      return this.getLocalStudySessions(userId);
    }
  }

  // Real-time subscriptions
  subscribeToUserProfile(
    userId: string,
    callback: (profile: UserProfile | null) => void
  ): Unsubscribe {
    const userRef = doc(db, "users", userId);

    return onSnapshot(
      userRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data() as FirestoreUser;
          const profile: UserProfile = {
            id: doc.id,
            ...data,
            joinedAt:
              data.createdAt?.toDate?.()?.toISOString() ||
              new Date().toISOString(),
          };
          callback(profile);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error("Error in user profile subscription:", error);
        callback(null);
      }
    );
  }

  subscribeToStudySessions(
    userId: string,
    callback: (sessions: StudySession[]) => void
  ): Unsubscribe {
    const sessionsRef = collection(db, "studySessions");
    const q = query(
      sessionsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    return onSnapshot(
      q,
      (querySnapshot) => {
        const sessions: StudySession[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data() as FirestoreStudySession;
          sessions.push({
            id: doc.id,
            ...data,
            startTime: data.startTime?.toDate?.() || new Date(),
            endTime: data.endTime?.toDate?.() || new Date(),
          });
        });

        callback(sessions);
      },
      (error) => {
        console.error("Error in study sessions subscription:", error);
        callback([]);
      }
    );
  }

  // Sync operations
  async syncPendingChanges(): Promise<void> {
    if (!this.syncStatus.isOnline) {
      return;
    }

    try {
      const pendingOperations = this.getPendingOperations();

      for (const operation of pendingOperations) {
        await this.executePendingOperation(operation);
      }

      this.clearPendingOperations();
      this.syncStatus.lastSyncTime = new Date();
      this.syncStatus.pendingChanges = 0;

      console.log("Sync completed successfully");
    } catch (error) {
      console.error("Error during sync:", error);
    }
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // Offline operations handling
  private handleOfflineOperation(type: string, data: any): void {
    const operation = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: new Date().toISOString(),
    };

    const pendingOps = this.getPendingOperations();
    pendingOps.push(operation);

    localStorage.setItem("pending_operations", JSON.stringify(pendingOps));
    this.syncStatus.pendingChanges = pendingOps.length;
  }

  private getPendingOperations(): any[] {
    try {
      const ops = localStorage.getItem("pending_operations");
      return ops ? JSON.parse(ops) : [];
    } catch (error) {
      console.error("Error getting pending operations:", error);
      return [];
    }
  }

  private clearPendingOperations(): void {
    localStorage.removeItem("pending_operations");
  }

  private async executePendingOperation(operation: any): Promise<void> {
    switch (operation.type) {
      case "createUser":
        await this.createUserProfile(
          operation.data.userId,
          operation.data.profile
        );
        break;
      case "updateUser":
        await this.updateUserProfile(
          operation.data.userId,
          operation.data.updates
        );
        break;
      case "saveSession":
        await this.saveStudySession(operation.data.session);
        break;
      default:
        console.warn("Unknown operation type:", operation.type);
    }
  }

  // LocalStorage fallback methods
  private getLocalUserProfile(userId: string): UserProfile | null {
    try {
      const userData = localStorage.getItem("takken_user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting local user profile:", error);
      return null;
    }
  }

  private updateLocalUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): void {
    try {
      const userData = localStorage.getItem("takken_user");
      if (userData) {
        const profile = JSON.parse(userData);
        const updatedProfile = { ...profile, ...updates };
        localStorage.setItem("takken_user", JSON.stringify(updatedProfile));
      }
    } catch (error) {
      console.error("Error updating local user profile:", error);
    }
  }

  private saveLocalStudySession(session: StudySession): void {
    try {
      const sessions = this.getLocalStudySessions(session.userId);
      sessions.push(session);
      localStorage.setItem(
        `study_sessions_${session.userId}`,
        JSON.stringify(sessions)
      );
    } catch (error) {
      console.error("Error saving local study session:", error);
    }
  }

  private getLocalStudySessions(userId: string): StudySession[] {
    try {
      const sessions = localStorage.getItem(`study_sessions_${userId}`);
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      console.error("Error getting local study sessions:", error);
      return [];
    }
  }

  // Batch operations for efficiency
  async batchUpdateUserProfiles(
    updates: { userId: string; data: Partial<UserProfile> }[]
  ): Promise<void> {
    // Implementation would use Firestore batch operations
    console.log("Batch update not implemented yet");
  }

  // Question Data Operations
  async getQuestionsByCategory(category: string): Promise<Question[]> {
    try {
      const questionsRef = collection(db, "questions");
      const q = query(
        questionsRef,
        where("category", "==", category),
        orderBy("id", "asc")
      );

      const querySnapshot = await getDocs(q);
      const questions: Question[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as Question;
        questions.push({
          id: data.id,
          question: data.question,
          options: data.options,
          correctAnswer: data.correctAnswer,
          explanation: data.explanation,
          category: data.category,
          difficulty: data.difficulty,
          year: data.year,
        });
      });

      console.log(
        `${category}カテゴリの問題を${questions.length}問取得しました`
      );
      return questions;
    } catch (error) {
      console.error(`Error getting questions for category ${category}:`, error);
      // Fallback to local data
      return this.getLocalQuestionsByCategory(category);
    }
  }

  async getQuestionsByDifficulty(difficulty: string): Promise<Question[]> {
    try {
      const questionsRef = collection(db, "questions");
      const q = query(
        questionsRef,
        where("difficulty", "==", difficulty),
        orderBy("id", "asc")
      );

      const querySnapshot = await getDocs(q);
      const questions: Question[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as Question;
        questions.push(data);
      });

      return questions;
    } catch (error) {
      console.error(
        `Error getting questions for difficulty ${difficulty}:`,
        error
      );
      return [];
    }
  }

  async getQuestionsByCategoryAndDifficulty(
    category: string,
    difficulty: string
  ): Promise<Question[]> {
    try {
      const questionsRef = collection(db, "questions");
      const q = query(
        questionsRef,
        where("category", "==", category),
        where("difficulty", "==", difficulty),
        orderBy("id", "asc")
      );

      const querySnapshot = await getDocs(q);
      const questions: Question[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as Question;
        questions.push(data);
      });

      return questions;
    } catch (error) {
      console.error(
        `Error getting questions for ${category}/${difficulty}:`,
        error
      );
      return [];
    }
  }

  async getRandomQuestions(
    category?: string,
    count: number = 10
  ): Promise<Question[]> {
    try {
      let q;
      const questionsRef = collection(db, "questions");

      if (category) {
        q = query(
          questionsRef,
          where("category", "==", category),
          limit(count * 3) // Get more than needed for randomization
        );
      } else {
        q = query(questionsRef, limit(count * 3));
      }

      const querySnapshot = await getDocs(q);
      const questions: Question[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as Question;
        questions.push(data);
      });

      // Shuffle and return requested count
      const shuffled = questions.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    } catch (error) {
      console.error("Error getting random questions:", error);
      return [];
    }
  }

  // Local fallback for questions
  private getLocalQuestionsByCategory(category: string): Question[] {
    try {
      const questionsData = localStorage.getItem(`questions_${category}`);
      return questionsData ? JSON.parse(questionsData) : [];
    } catch (error) {
      console.error("Error getting local questions:", error);
      return [];
    }
  }

  private saveLocalQuestions(category: string, questions: Question[]): void {
    try {
      localStorage.setItem(`questions_${category}`, JSON.stringify(questions));
    } catch (error) {
      console.error("Error saving local questions:", error);
    }
  }

  // Data migration utilities
  async migrateLocalDataToFirestore(userId: string): Promise<void> {
    try {
      // Migrate user profile
      const localProfile = this.getLocalUserProfile(userId);
      if (localProfile) {
        await this.createUserProfile(userId, localProfile);
      }

      // Migrate study sessions
      const localSessions = this.getLocalStudySessions(userId);
      for (const session of localSessions) {
        await this.saveStudySession(session);
      }

      console.log("Data migration completed successfully");
    } catch (error) {
      console.error("Error during data migration:", error);
      throw error;
    }
  }

  // Subscription Management Methods

  /**
   * ユーザーのサブスクリプション情報を取得
   */
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const subscriptionRef = doc(db, "subscriptions", userId);
      const subscriptionSnap = await getDoc(subscriptionRef);

      if (subscriptionSnap.exists()) {
        const data = subscriptionSnap.data();
        return {
          userId,
          planId: data.planId,
          status: data.status,
          startDate: data.startDate.toDate(),
          endDate: data.endDate?.toDate(),
          autoRenew: data.autoRenew,
          transactionId: data.transactionId,
        };
      }

      return null;
    } catch (error) {
      console.error("Error getting user subscription:", error);
      return null;
    }
  }

  /**
   * ユーザーのサブスクリプション情報を保存
   */
  async saveUserSubscription(subscription: UserSubscription): Promise<void> {
    try {
      const subscriptionRef = doc(db, "subscriptions", subscription.userId);
      await setDoc(subscriptionRef, {
        planId: subscription.planId,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        autoRenew: subscription.autoRenew,
        transactionId: subscription.transactionId,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error saving user subscription:", error);
      throw error;
    }
  }

  /**
   * サブスクリプションステータスを更新
   */
  async updateUserSubscriptionStatus(
    userId: string,
    status: UserSubscription["status"]
  ): Promise<void> {
    try {
      const subscriptionRef = doc(db, "subscriptions", userId);
      await updateDoc(subscriptionRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating subscription status:", error);
      throw error;
    }
  }

  /**
   * AI機能の使用回数を取得（月単位）
   */
  async getAIUsageCount(userId: string, date: Date): Promise<number> {
    try {
      const year = date.getFullYear();
      const month = date.getMonth();
      const usageRef = doc(db, "ai_usage", `${userId}_${year}_${month}`);
      const usageSnap = await getDoc(usageRef);

      if (usageSnap.exists()) {
        return usageSnap.data().count || 0;
      }

      return 0;
    } catch (error) {
      console.error("Error getting AI usage count:", error);
      return 0;
    }
  }

  /**
   * AI機能の使用回数を増加
   */
  async incrementAIUsageCount(userId: string, date: Date): Promise<void> {
    try {
      const year = date.getFullYear();
      const month = date.getMonth();
      const usageRef = doc(db, "ai_usage", `${userId}_${year}_${month}`);
      const usageSnap = await getDoc(usageRef);

      if (usageSnap.exists()) {
        const currentCount = usageSnap.data().count || 0;
        await updateDoc(usageRef, {
          count: currentCount + 1,
          lastUsed: serverTimestamp(),
        });
      } else {
        await setDoc(usageRef, {
          userId,
          year,
          month,
          count: 1,
          lastUsed: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error incrementing AI usage count:", error);
      throw error;
    }
  }
}

export const firestoreService = new FirestoreService();
