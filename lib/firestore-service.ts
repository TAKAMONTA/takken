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
  Timestamp,
  FieldValue,
  Firestore,
} from "firebase/firestore";
import { initializeFirebaseWithFallback } from "./firebase-client";
import { UserProfile, StudySession } from "./types";
import { Question } from "./types/quiz";
import { UserSubscription } from "./subscription-service";
import { logger } from "./logger";
import { shuffleQuestions, uniqueQuestionsByText } from "./question-dedupe";
import {
  applyAttempt,
  questionStatDocId,
  QuestionAttempt,
  QuestionStat,
} from "./question-mastery";

type FirebaseInitializerResult = {
  fallback?: boolean;
  db?: Firestore | null;
};

type FirebaseInitializer = () =>
  | FirebaseInitializerResult
  | Promise<FirebaseInitializerResult>;

async function resolveFirestoreDb(
  initializer: FirebaseInitializer = initializeFirebaseWithFallback
): Promise<Firestore | null> {
  const firebase = await initializer();
  if (firebase.fallback || !firebase.db) {
    return null;
  }
  return firebase.db;
}

export interface FirestoreUser extends Omit<Partial<UserProfile>, "id"> {
  createdAt: Timestamp | FieldValue; // Firestore Timestamp (読み込み時) または FieldValue (書き込み時)
  updatedAt: Timestamp | FieldValue; // Firestore Timestamp (読み込み時) または FieldValue (書き込み時)
  // idは除外、その他のプロパティはオプショナル（Firestoreに保存する際は一部のプロパティが未定義でも可）
}

export interface FirestoreStudySession
  extends Omit<StudySession, "id" | "startTime" | "endTime"> {
  startTime: Timestamp | Date | FieldValue; // Firestore Timestamp/Date (読み込み時) または FieldValue (書き込み時)
  endTime: Timestamp | Date | FieldValue; // Firestore Timestamp/Date (読み込み時) または FieldValue (書き込み時)
  createdAt: Timestamp | FieldValue; // Firestore Timestamp (読み込み時) または FieldValue (書き込み時)
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

  private async getDb(): Promise<Firestore | null> {
    return resolveFirestoreDb();
  }

  // 入力値検証関数
  private validateUserId(userId: string): boolean {
    return (
      typeof userId === "string" &&
      userId.trim().length > 0 &&
      userId.length <= 128
    );
  }

  private sanitizeUserData(data: Partial<UserProfile>): Partial<UserProfile> {
    if (!data || typeof data !== "object") return data;

    const sanitized: Partial<UserProfile> = { ...data };

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
    const firestore = await this.getDb();
    if (!firestore) {
      throw new Error("Firestore is not initialized");
    }

    // 入力値検証
    if (!this.validateUserId(userId)) {
      throw new Error("Invalid user ID");
    }

    if (!profile || typeof profile !== "object") {
      throw new Error("Invalid profile data");
    }

    try {
      const userRef = doc(firestore, "users", userId);
      const sanitizedProfile = this.sanitizeUserData(profile);

      const firestoreProfile: FirestoreUser = {
        ...sanitizedProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(userRef, firestoreProfile);
      logger.info("User profile created successfully", { userId });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error creating user profile", err, { userId });

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
    const firestore = await this.getDb();
    if (!firestore) {
      throw new Error("Firestore is not initialized");
    }

    // 入力値検証
    if (!this.validateUserId(userId)) {
      throw new Error("Invalid user ID");
    }

    try {
      const userRef = doc(firestore, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as FirestoreUser;

        // データの整合性チェック
        if (!data.name || !data.email) {
          logger.warn("Incomplete user profile data", { userId });
        }

        // 必須プロパティのデフォルト値を設定
        const profile: UserProfile = {
          id: userSnap.id,
          name: data.name || '',
          email: data.email || '',
          streak: data.streak || {
            currentStreak: 0,
            longestStreak: 0,
            lastStudyDate: new Date().toISOString(),
            studyDates: [],
          },
          progress: data.progress || {
            totalQuestions: 0,
            correctAnswers: 0,
            studyTimeMinutes: 0,
            categoryProgress: {},
          },
          learningRecords: data.learningRecords || [],
          joinedAt: (data.createdAt && 'toDate' in data.createdAt) 
            ? data.createdAt.toDate().toISOString() 
            : new Date().toISOString(),
          studyHistory: data.studyHistory,
          totalStats: data.totalStats,
        };

        return profile;
      }

      return null;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error getting user profile", err, { userId });

      // 特定のエラーに対する詳細なハンドリング
      if (err instanceof Error) {
        if (err.message.includes("permission-denied")) {
          logger.error("Permission denied for user profile access", err, { userId });
          return null;
        } else if (err.message.includes("network-request-failed")) {
          logger.warn("Network error, falling back to local storage", { userId });
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
    const firestore = await this.getDb();
    if (!firestore) {
      throw new Error("Firestore is not initialized");
    }

    // 入力値検証
    if (!this.validateUserId(userId)) {
      throw new Error("Invalid user ID");
    }

    if (!updates || typeof updates !== "object") {
      throw new Error("Invalid update data");
    }

    const sanitizedUpdates = this.sanitizeUserData(updates);

    try {
      const userRef = doc(firestore, "users", userId);

      const firestoreUpdates = {
        ...sanitizedUpdates,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(userRef, firestoreUpdates);

      // Also update localStorage
      this.updateLocalUserProfile(userId, sanitizedUpdates);

      logger.info("User profile updated successfully", { userId });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error updating user profile", err, { userId });

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
    const firestore = await this.getDb();
    if (!firestore) {
      throw new Error("Firestore is not initialized");
    }

    try {
      const sessionsRef = collection(firestore, "studySessions");
      const firestoreSession: FirestoreStudySession = {
        ...session,
        startTime: new Date(session.startTime),
        endTime: new Date(session.endTime),
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(sessionsRef, firestoreSession);
      logger.info("Study session saved successfully", { sessionId: docRef.id });
      return docRef.id;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error saving study session", err, { sessionId: session.id });
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
    const firestore = await this.getDb();
    if (!firestore) {
      throw new Error("Firestore is not initialized");
    }

    try {
      const sessionsRef = collection(firestore, "studySessions");
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
        
        // startTimeとendTimeの型安全な変換
        const startTime = data.startTime 
          ? ('toDate' in data.startTime ? data.startTime.toDate() : data.startTime instanceof Date ? data.startTime : new Date())
          : new Date();
        const endTime = data.endTime 
          ? ('toDate' in data.endTime ? data.endTime.toDate() : data.endTime instanceof Date ? data.endTime : new Date())
          : new Date();
        
        sessions.push({
          id: doc.id,
          ...data,
          startTime,
          endTime,
        });
      });

      return sessions;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error getting study sessions", err, { userId, limit: limitCount });
      // Fallback to localStorage
      return this.getLocalStudySessions(userId);
    }
  }

  // Real-time subscriptions
  subscribeToUserProfile(
    userId: string,
    callback: (profile: UserProfile | null) => void
  ): Unsubscribe {
    let cancelled = false;
    let unsubscribe: Unsubscribe | undefined;

    this.getDb()
      .then((firestore) => {
        if (cancelled) return;

        if (!firestore) {
          logger.warn("Firestore is not initialized; subscribeToUserProfile returns noop", { userId });
          callback(null);
          return;
        }

        const userRef = doc(firestore, "users", userId);
        unsubscribe = onSnapshot(
          userRef,
          (doc) => {
            if (doc.exists()) {
              const data = doc.data() as FirestoreUser;
              // 必須プロパティのデフォルト値を設定
              const profile: UserProfile = {
                id: doc.id,
                name: data.name || '',
                email: data.email || '',
                streak: data.streak || {
                  currentStreak: 0,
                  longestStreak: 0,
                  lastStudyDate: new Date().toISOString(),
                  studyDates: [],
                },
                progress: data.progress || {
                  totalQuestions: 0,
                  correctAnswers: 0,
                  studyTimeMinutes: 0,
                  categoryProgress: {},
                },
                learningRecords: data.learningRecords || [],
                joinedAt: (data.createdAt && 'toDate' in data.createdAt)
                  ? data.createdAt.toDate().toISOString()
                  : new Date().toISOString(),
                studyHistory: data.studyHistory,
                totalStats: data.totalStats,
              };
              callback(profile);
            } else {
              callback(null);
            }
          },
          (error) => {
            const err = error instanceof Error ? error : new Error(String(error));
            logger.error("Error in user profile subscription", err, { userId });
            callback(null);
          }
        );
      })
      .catch((error) => {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("Failed to initialize Firestore subscription", err, { userId });
        callback(null);
      });

    return (() => {
      cancelled = true;
      if (unsubscribe) {
        unsubscribe();
      }
    }) as Unsubscribe;
  }

  subscribeToStudySessions(
    userId: string,
    callback: (sessions: StudySession[]) => void
  ): Unsubscribe {
    let cancelled = false;
    let unsubscribe: Unsubscribe | undefined;

    this.getDb()
      .then((firestore) => {
        if (cancelled) return;

        if (!firestore) {
          logger.warn("Firestore is not initialized; subscribeToStudySessions returns noop", { userId });
          callback([]);
          return;
        }

        const sessionsRef = collection(firestore, "studySessions");
        const q = query(
          sessionsRef,
          where("userId", "==", userId),
          orderBy("createdAt", "desc"),
          limit(50)
        );

        unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            const sessions: StudySession[] = [];

            querySnapshot.forEach((doc) => {
              const data = doc.data() as FirestoreStudySession;

              // startTimeとendTimeの型安全な変換
              const startTime = data.startTime
                ? ('toDate' in data.startTime ? data.startTime.toDate() : data.startTime instanceof Date ? data.startTime : new Date())
                : new Date();
              const endTime = data.endTime
                ? ('toDate' in data.endTime ? data.endTime.toDate() : data.endTime instanceof Date ? data.endTime : new Date())
                : new Date();

              sessions.push({
                id: doc.id,
                ...data,
                startTime,
                endTime,
              });
            });

            callback(sessions);
          },
          (error) => {
            const err = error instanceof Error ? error : new Error(String(error));
            logger.error("Error in study sessions subscription", err, { userId });
            callback([]);
          }
        );
      })
      .catch((error) => {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("Failed to initialize study session subscription", err, { userId });
        callback([]);
      });

    return (() => {
      cancelled = true;
      if (unsubscribe) {
        unsubscribe();
      }
    }) as Unsubscribe;
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

      logger.info("Sync completed successfully", { 
        syncedOperations: pendingOperations.length 
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error during sync", err);
    }
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // Offline operations handling
  private handleOfflineOperation(type: string, data: unknown): void {
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

  private getPendingOperations(): Array<{ id: string; type: string; data: unknown; timestamp: string }> {
    try {
      const ops = localStorage.getItem("pending_operations");
      return ops ? JSON.parse(ops) : [];
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error getting pending operations", err);
      return [];
    }
  }

  private clearPendingOperations(): void {
    localStorage.removeItem("pending_operations");
  }

  private async executePendingOperation(operation: { id: string; type: string; data: unknown; timestamp: string }): Promise<void> {
    switch (operation.type) {
      case "createUser": {
        const createData = operation.data as { userId: string; profile: UserProfile };
        await this.createUserProfile(
          createData.userId,
          createData.profile
        );
        break;
      }
      case "updateUser": {
        const updateData = operation.data as { userId: string; updates: Partial<UserProfile> };
        await this.updateUserProfile(
          updateData.userId,
          updateData.updates
        );
        break;
      }
      case "saveSession": {
        const sessionData = operation.data as { session: StudySession };
        await this.saveStudySession(sessionData.session);
        break;
      }
      default:
        logger.warn("Unknown operation type", { operationType: operation.type });
    }
  }

  // LocalStorage fallback methods
  private getLocalUserProfile(userId: string): UserProfile | null {
    try {
      const userData = localStorage.getItem("takken_user");
      if (!userData) return null;
      const profile = JSON.parse(userData);
      return profile?.id === userId ? profile : null;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error getting local user profile", err, { userId });
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
        if (profile?.id !== userId) {
          logger.warn("Skipping local profile update for mismatched user", {
            userId,
            cachedUserId: profile?.id,
          });
          return;
        }
        const updatedProfile = { ...profile, ...updates };
        localStorage.setItem("takken_user", JSON.stringify(updatedProfile));
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error updating local user profile", err, { userId });
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
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error saving local study session", err, { sessionId: session.id, userId: session.userId });
    }
  }

  private getLocalStudySessions(userId: string): StudySession[] {
    try {
      const sessions = localStorage.getItem(`study_sessions_${userId}`);
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error getting local study sessions", err, { userId });
      return [];
    }
  }

  // Batch operations for efficiency
  async batchUpdateUserProfiles(
    updates: { userId: string; data: Partial<UserProfile> }[]
  ): Promise<void> {
    // Implementation would use Firestore batch operations
    logger.warn("Batch update not implemented yet", { updateCount: updates.length });
  }

  // Question Data Operations
  async getQuestionsByCategory(category: string): Promise<Question[]> {
    const firestore = await this.getDb();
    if (!firestore) {
      logger.warn("Firestore is not initialized; getQuestionsByCategory returns empty array", { category });
      return [];
    }

    try {
      const questionsRef = collection(firestore, "questions");
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

      logger.debug(
        `${category}カテゴリの問題を${questions.length}問取得しました`,
        { category, count: questions.length }
      );
      return questions;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error getting questions for category ${category}`, err, { category });
      // Fallback to local data
      return this.getLocalQuestionsByCategory(category);
    }
  }

  async getQuestionsByDifficulty(difficulty: string): Promise<Question[]> {
    const firestore = await this.getDb();
    if (!firestore) {
      logger.warn("Firestore is not initialized; getQuestionsByDifficulty returns empty array", { difficulty });
      return [];
    }

    try {
      const questionsRef = collection(firestore, "questions");
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
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error getting questions for difficulty ${difficulty}`,
        err,
        { difficulty }
      );
      return [];
    }
  }

  async getQuestionsByCategoryAndDifficulty(
    category: string,
    difficulty: string
  ): Promise<Question[]> {
    const firestore = await this.getDb();
    if (!firestore) {
      logger.warn(
        "Firestore is not initialized; getQuestionsByCategoryAndDifficulty returns empty array",
        { category, difficulty }
      );
      return [];
    }

    try {
      const questionsRef = collection(firestore, "questions");
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
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error getting questions for ${category}/${difficulty}`,
        err,
        { category, difficulty }
      );
      return [];
    }
  }

  async getRandomQuestions(
    category?: string,
    count: number = 10
  ): Promise<Question[]> {
    const firestore = await this.getDb();
    if (!firestore) {
      logger.warn("Firestore is not initialized; getRandomQuestions returns empty array", { category, count });
      return [];
    }

    try {
      let q;
      const questionsRef = collection(firestore, "questions");

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
      const shuffled = shuffleQuestions(uniqueQuestionsByText(questions));
      return shuffled.slice(0, count);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error getting random questions", err, { category, count });
      return [];
    }
  }

  // Local fallback for questions
  private getLocalQuestionsByCategory(category: string): Question[] {
    try {
      const questionsData = localStorage.getItem(`questions_${category}`);
      return questionsData ? JSON.parse(questionsData) : [];
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error getting local questions", err, { category });
      return [];
    }
  }

  private saveLocalQuestions(category: string, questions: Question[]): void {
    try {
      localStorage.setItem(`questions_${category}`, JSON.stringify(questions));
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error saving local questions", err, { category, questionCount: questions.length });
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

      logger.info("Data migration completed successfully", { 
        userId,
        profileMigrated: !!localProfile,
        sessionsMigrated: localSessions.length,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error during data migration", err, { userId });
      throw error;
    }
  }

  // Subscription Management Methods

  /**
   * ユーザーのサブスクリプション情報を取得
   */
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const firestore = await this.getDb();
    if (!firestore) {
      logger.warn("Firestore is not initialized; getUserSubscription returns null", { userId });
      return null;
    }

    try {
      const subscriptionRef = doc(firestore, "subscriptions", userId);
      const subscriptionSnap = await getDoc(subscriptionRef);

      if (subscriptionSnap.exists()) {
        const data = subscriptionSnap.data();
        return {
          userId,
          planId: data.planId,
          status: data.status,
          startDate: data.startDate && 'toDate' in data.startDate 
            ? data.startDate.toDate() 
            : new Date(),
          endDate: data.endDate && 'toDate' in data.endDate 
            ? data.endDate.toDate() 
            : undefined,
          autoRenew: data.autoRenew,
          transactionId: data.transactionId,
        };
      }

      return null;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error getting user subscription", err, { userId });
      return null;
    }
  }

  /**
   * ユーザーのサブスクリプション情報を保存
   */
  async saveUserSubscription(subscription: UserSubscription): Promise<void> {
    const firestore = await this.getDb();
    if (!firestore) {
      throw new Error("Firestore is not initialized");
    }

    try {
      const subscriptionRef = doc(firestore, "subscriptions", subscription.userId);
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
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error saving user subscription", err, { userId: subscription.userId, planId: subscription.planId });
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
    const firestore = await this.getDb();
    if (!firestore) {
      throw new Error("Firestore is not initialized");
    }

    try {
      const subscriptionRef = doc(firestore, "subscriptions", userId);
      await updateDoc(subscriptionRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error updating subscription status", err, { userId, status });
      throw error;
    }
  }

  /**
   * AI機能の使用回数を取得（月単位）
   */
  async getAIUsageCount(userId: string, date: Date): Promise<number> {
    const firestore = await this.getDb();
    if (!firestore) {
      logger.warn("Firestore is not initialized; getAIUsageCount returns 0", { userId, date: date.toISOString() });
      return 0;
    }

    try {
      const year = date.getFullYear();
      const month = date.getMonth();
      const usageRef = doc(firestore, "ai_usage", `${userId}_${year}_${month}`);
      const usageSnap = await getDoc(usageRef);

      if (usageSnap.exists()) {
        return usageSnap.data().count || 0;
      }

      return 0;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error getting AI usage count", err, { userId, date: date.toISOString() });
      return 0;
    }
  }

  /**
   * AI機能の使用回数を増加
   */
  async incrementAIUsageCount(userId: string, date: Date): Promise<void> {
    const firestore = await this.getDb();
    if (!firestore) {
      throw new Error("Firestore is not initialized");
    }

    try {
      const year = date.getFullYear();
      const month = date.getMonth();
      const usageRef = doc(firestore, "ai_usage", `${userId}_${year}_${month}`);
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
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error incrementing AI usage count", err, { userId, date: date.toISOString() });
      throw error;
    }
  }

  // ============================================================================
  // Per-question mastery (questionStats collection)
  //
  // 1問ごとの解答履歴を upsert で持つ。doc id = {userId}_{questionId}（ai_usage と
  // 同じ規約）。純粋ロジックは lib/question-mastery.ts。Firestore に書く際は
  // undefined を持つフィールドが拒否されるので serialize で除去する。
  // ============================================================================

  /**
   * 1問の解答を記録し、習熟度レコードを upsert する。
   * read → applyAttempt（純粋）→ write の順で実行。
   * Firestore 未初期化・失敗時は localStorage にフォールバックして継続。
   */
  async recordQuestionAnswer(
    userId: string,
    attempt: QuestionAttempt,
  ): Promise<QuestionStat> {
    if (!this.validateUserId(userId)) {
      throw new Error("Invalid user ID");
    }

    const now = new Date();
    const firestore = await this.getDb();

    if (!firestore) {
      const prev = this.getLocalQuestionStat(userId, attempt.questionId);
      const next = applyAttempt(prev, attempt, now);
      this.saveLocalQuestionStat(userId, next);
      return next;
    }

    try {
      const statRef = doc(
        firestore,
        "questionStats",
        questionStatDocId(userId, attempt.questionId),
      );
      const snap = await getDoc(statRef);
      const prev = snap.exists()
        ? this.deserializeQuestionStat(snap.data())
        : null;
      const next = applyAttempt(prev, attempt, now);

      await setDoc(statRef, {
        ...this.serializeQuestionStat(next),
        userId,
        updatedAt: serverTimestamp(),
      });

      // 並行 localStorage 更新（オフライン読み出し性能、再ログイン時の即時表示）
      this.saveLocalQuestionStat(userId, next);
      return next;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error recording question answer", err, {
        userId,
        questionId: attempt.questionId,
      });
      // Firestore 失敗時も localStorage に保存して学習体験を止めない
      const prev = this.getLocalQuestionStat(userId, attempt.questionId);
      const next = applyAttempt(prev, attempt, now);
      this.saveLocalQuestionStat(userId, next);
      return next;
    }
  }

  /**
   * ユーザーの全習熟度レコードを取得。最大 ~問題総数 件で有界。
   * 弱点クイズ・カテゴリ別集計・進捗ページの土台。
   */
  async getQuestionStats(userId: string): Promise<QuestionStat[]> {
    if (!this.validateUserId(userId)) {
      return [];
    }

    const firestore = await this.getDb();
    if (!firestore) {
      return this.getLocalQuestionStats(userId);
    }

    try {
      const statsRef = collection(firestore, "questionStats");
      const q = query(statsRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const stats: QuestionStat[] = [];
      querySnapshot.forEach((d) => {
        stats.push(this.deserializeQuestionStat(d.data()));
      });
      return stats;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error getting question stats", err, { userId });
      return this.getLocalQuestionStats(userId);
    }
  }

  /**
   * QuestionStat を Firestore 用に正規化（undefined を除去）。
   * Firestore Web SDK は undefined をエラーにするため optional は省略する。
   */
  private serializeQuestionStat(stat: QuestionStat): Record<string, unknown> {
    const out: Record<string, unknown> = {
      questionId: stat.questionId,
      category: stat.category,
      attempts: stat.attempts,
      correctCount: stat.correctCount,
      lastSelectedAnswer: stat.lastSelectedAnswer,
      lastIsCorrect: stat.lastIsCorrect,
      lastAnsweredAt: stat.lastAnsweredAt,
      consecutiveCorrect: stat.consecutiveCorrect,
      isWeak: stat.isWeak,
      nextReviewAt: stat.nextReviewAt,
    };
    if (stat.topic !== undefined) out.topic = stat.topic;
    if (stat.difficulty !== undefined) out.difficulty = stat.difficulty;
    return out;
  }

  /** Firestore raw doc を QuestionStat に rehydrate。欠損値は安全なデフォルト。 */
  private deserializeQuestionStat(raw: unknown): QuestionStat {
    const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    return {
      questionId: Number(r.questionId) || 0,
      category: typeof r.category === "string" ? r.category : "",
      topic: typeof r.topic === "string" ? r.topic : undefined,
      difficulty: typeof r.difficulty === "string" ? r.difficulty : undefined,
      attempts: Number(r.attempts) || 0,
      correctCount: Number(r.correctCount) || 0,
      lastSelectedAnswer: Number(r.lastSelectedAnswer) || 0,
      lastIsCorrect: Boolean(r.lastIsCorrect),
      lastAnsweredAt: Number(r.lastAnsweredAt) || 0,
      consecutiveCorrect: Number(r.consecutiveCorrect) || 0,
      isWeak: Boolean(r.isWeak),
      nextReviewAt: Number(r.nextReviewAt) || 0,
    };
  }

  /** localStorage フォールバック: 単一 question の stat 取得 */
  private getLocalQuestionStat(
    userId: string,
    questionId: number,
  ): QuestionStat | null {
    const all = this.getLocalQuestionStats(userId);
    return all.find((s) => s.questionId === questionId) ?? null;
  }

  /** localStorage フォールバック: 全 stat 取得 */
  private getLocalQuestionStats(userId: string): QuestionStat[] {
    try {
      if (typeof localStorage === "undefined") return [];
      const raw = localStorage.getItem(`question_stats_${userId}`);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error getting local question stats", err, { userId });
      return [];
    }
  }

  /** localStorage フォールバック: 単一 stat の upsert */
  private saveLocalQuestionStat(userId: string, stat: QuestionStat): void {
    try {
      if (typeof localStorage === "undefined") return;
      const all = this.getLocalQuestionStats(userId);
      const idx = all.findIndex((s) => s.questionId === stat.questionId);
      if (idx >= 0) {
        all[idx] = stat;
      } else {
        all.push(stat);
      }
      localStorage.setItem(`question_stats_${userId}`, JSON.stringify(all));
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error saving local question stat", err, {
        userId,
        questionId: stat.questionId,
      });
    }
  }
}

export const firestoreService = new FirestoreService();
export const __private__ = {
  resolveFirestoreDb,
};
