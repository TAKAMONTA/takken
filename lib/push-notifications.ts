// プッシュ通知機能
export class PushNotificationManager {
  private static instance: PushNotificationManager;
  private registration: ServiceWorkerRegistration | null = null;

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager();
    }
    return PushNotificationManager.instance;
  }

  async initialize(): Promise<boolean> {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.log("Push notifications are not supported");
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.ready;
      return true;
    } catch (error) {
      console.error("Failed to initialize push notifications:", error);
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.registration) {
      throw new Error("Push notifications not initialized");
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  async subscribe(): Promise<PushSubscription | null> {
    if (!this.registration) {
      throw new Error("Push notifications not initialized");
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""
        ) as BufferSource,
      });

      // サーバーにサブスクリプションを送信
      await this.sendSubscriptionToServer(subscription);

      return subscription;
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
      return null;
    }
  }

  async scheduleStudyReminder(hour: number, minute: number = 0): Promise<void> {
    if (!this.registration) {
      throw new Error("Push notifications not initialized");
    }

    // 学習リマインダーのスケジュール設定
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hour, minute, 0, 0);

    // 今日の時間が過ぎている場合は明日に設定
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    // バックグラウンド同期でリマインダーを登録
    await (this.registration as any).sync.register("study-reminder");

    // ローカルストレージにリマインダー設定を保存
    localStorage.setItem(
      "studyReminder",
      JSON.stringify({
        hour,
        minute,
        enabled: true,
      })
    );
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private async sendSubscriptionToServer(
    subscription: PushSubscription
  ): Promise<void> {
    try {
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });
    } catch (error) {
      console.error("Failed to send subscription to server:", error);
    }
  }
}

// 学習リマインダーの管理
export class StudyReminderManager {
  private static instance: StudyReminderManager;

  static getInstance(): StudyReminderManager {
    if (!StudyReminderManager.instance) {
      StudyReminderManager.instance = new StudyReminderManager();
    }
    return StudyReminderManager.instance;
  }

  async setupReminder(hour: number, minute: number = 0): Promise<boolean> {
    try {
      const pushManager = PushNotificationManager.getInstance();
      await pushManager.initialize();

      const permission = await pushManager.requestPermission();
      if (permission !== "granted") {
        return false;
      }

      await pushManager.scheduleStudyReminder(hour, minute);
      return true;
    } catch (error) {
      console.error("Failed to setup study reminder:", error);
      return false;
    }
  }

  getReminderSettings(): {
    hour: number;
    minute: number;
    enabled: boolean;
  } | null {
    const settings = localStorage.getItem("studyReminder");
    return settings ? JSON.parse(settings) : null;
  }

  disableReminder(): void {
    localStorage.removeItem("studyReminder");
  }
}
