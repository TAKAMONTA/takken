// オフライン同期機能
import { logger } from './logger';

export interface StudyProgressData {
  id: string;
  userId: string;
  questionId: string;
  category: string;
  isCorrect: boolean;
  timeSpent: number;
  timestamp: Date;
  isOffline: boolean;
}

export class OfflineSyncManager {
  private static instance: OfflineSyncManager;
  private dbName = "TakkenStudyDB";
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  static getInstance(): OfflineSyncManager {
    if (!OfflineSyncManager.instance) {
      OfflineSyncManager.instance = new OfflineSyncManager();
    }
    return OfflineSyncManager.instance;
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 学習進捗のストア
        if (!db.objectStoreNames.contains("studyProgress")) {
          const progressStore = db.createObjectStore("studyProgress", {
            keyPath: "id",
            autoIncrement: true,
          });
          progressStore.createIndex("userId", "userId", { unique: false });
          progressStore.createIndex("timestamp", "timestamp", {
            unique: false,
          });
          progressStore.createIndex("isOffline", "isOffline", {
            unique: false,
          });
        }

        // オフライン問題のストア
        if (!db.objectStoreNames.contains("offlineQuestions")) {
          const questionsStore = db.createObjectStore("offlineQuestions", {
            keyPath: "id",
          });
          questionsStore.createIndex("category", "category", { unique: false });
        }
      };
    });
  }

  async saveStudyProgress(data: Omit<StudyProgressData, "id">): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    const progressData: StudyProgressData = {
      ...data,
      id: `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isOffline: !navigator.onLine,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["studyProgress"], "readwrite");
      const store = transaction.objectStore("studyProgress");
      const request = store.add(progressData);

      request.onsuccess = () => {
        resolve();
        // オフラインの場合はバックグラウンド同期を登録
        if (!navigator.onLine && "serviceWorker" in navigator) {
          this.registerBackgroundSync();
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getOfflineStudyProgress(): Promise<StudyProgressData[]> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["studyProgress"], "readonly");
      const store = transaction.objectStore("studyProgress");
      const index = store.index("isOffline");
      const request = index.getAll(IDBKeyRange.only(true)); // isOffline = true のデータを取得

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async clearSyncedProgress(progressIds: string[]): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["studyProgress"], "readwrite");
      const store = transaction.objectStore("studyProgress");

      let completed = 0;
      const total = progressIds.length;

      if (total === 0) {
        resolve();
        return;
      }

      progressIds.forEach((id) => {
        const request = store.delete(id);
        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            resolve();
          }
        };
        request.onerror = () => {
          reject(request.error);
        };
      });
    });
  }

  async cacheQuestionsForOffline(questions: any[]): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        ["offlineQuestions"],
        "readwrite"
      );
      const store = transaction.objectStore("offlineQuestions");

      let completed = 0;
      const total = questions.length;

      if (total === 0) {
        resolve();
        return;
      }

      questions.forEach((question) => {
        const request = store.put(question);
        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            resolve();
          }
        };
        request.onerror = () => {
          reject(request.error);
        };
      });
    });
  }

  async getCachedQuestions(category?: string): Promise<any[]> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        ["offlineQuestions"],
        "readonly"
      );
      const store = transaction.objectStore("offlineQuestions");

      let request: IDBRequest;
      if (category) {
        const index = store.index("category");
        request = index.getAll(category);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  private async registerBackgroundSync(): Promise<void> {
    if (
      !("serviceWorker" in navigator) ||
      !("sync" in window.ServiceWorkerRegistration.prototype)
    ) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register("study-progress-sync");
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Failed to register background sync", err);
    }
  }

  async syncWithServer(): Promise<boolean> {
    let offlineProgress: StudyProgressData[] = [];
    try {
      offlineProgress = await this.getOfflineStudyProgress();

      if (offlineProgress.length === 0) {
        return true;
      }

      const response = await fetch("/api/sync-progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(offlineProgress),
      });

      if (response.ok) {
        // 同期成功後はオフラインデータをクリア
        const progressIds = offlineProgress.map((p) => p.id);
        await this.clearSyncedProgress(progressIds);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      const userId = offlineProgress.length > 0 ? offlineProgress[0].userId : 'unknown';
      logger.error("Failed to sync with server", err, { userId });
      return false;
    }
  }

  // 接続状態の監視
  setupConnectionListener(): void {
    window.addEventListener("online", async () => {
      logger.info("Connection restored, syncing data");
      await this.syncWithServer();
    });

    window.addEventListener("offline", () => {
      logger.warn("Connection lost, switching to offline mode");
    });
  }
}
