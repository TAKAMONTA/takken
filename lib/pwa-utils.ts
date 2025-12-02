// PWA and Push Notification utilities
import { logger } from './logger';

export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

// Custom NotificationAction interface
interface CustomNotificationAction {
  action: string;
  title: string;
  icon?: string;
}

// Extended NotificationOptions with additional properties
interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
  actions?: CustomNotificationAction[];
}

class PWAManager {
  private deferredPrompt: PWAInstallPrompt | null = null;
  private swRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.initializePWA();
    }
  }

  private async initializePWA() {
    // Register service worker
    await this.registerServiceWorker();

    // Listen for install prompt
    this.setupInstallPrompt();

    // Setup push notifications
    await this.setupPushNotifications();
  }

  // Register Service Worker
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        this.swRegistration = registration;
        logger.info("Service Worker registered successfully", { scope: registration.scope });

        // Listen for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New version available
                this.notifyUpdate();
              }
            });
          }
        });

        return registration;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("Service Worker registration failed", err);
        return null;
      }
    }
    return null;
  }

  // Setup install prompt
  private setupInstallPrompt() {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.deferredPrompt = e as unknown as PWAInstallPrompt;
      logger.debug("Install prompt ready");
    });

    window.addEventListener("appinstalled", () => {
      logger.info("PWA installed successfully");
      this.deferredPrompt = null;
    });
  }

  // Check if app can be installed
  canInstall(): boolean {
    return this.deferredPrompt !== null;
  }

  // Show install prompt
  async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        logger.info("User accepted the install prompt");
        return true;
      } else {
        logger.debug("User dismissed the install prompt");
        return false;
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error showing install prompt", err);
      return false;
    } finally {
      this.deferredPrompt = null;
    }
  }

  // Check if app is installed
  isInstalled(): boolean {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true
    );
  }

  // Setup push notifications
  async setupPushNotifications(): Promise<void> {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      logger.debug("Push notifications not supported");
      return;
    }

    // Wait for service worker to be ready
    if (!this.swRegistration) {
      await this.registerServiceWorker();
    }
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      return { granted: false, denied: true, default: false };
    }

    let permission = Notification.permission;

    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    return {
      granted: permission === "granted",
      denied: permission === "denied",
      default: permission === "default",
    };
  }

  // Subscribe to push notifications
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      logger.warn("Service Worker not registered");
      return null;
    }

    const permission = await this.requestNotificationPermission();
    if (!permission.granted) {
      logger.debug("Notification permission denied");
      return null;
    }

    try {
      // Get VAPID public key from environment or server
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        logger.warn("VAPID public key not configured");
        return null;
      }

      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          vapidPublicKey
        ) as BufferSource,
      });

      logger.info("Push subscription successful", { endpoint: subscription.endpoint });

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);

      return subscription;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Failed to subscribe to push notifications", err);
      return null;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.swRegistration) {
      return false;
    }

    try {
      const subscription =
        await this.swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        logger.info("Unsubscribed from push notifications");
        return true;
      }
      return false;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Failed to unsubscribe from push notifications", err);
      return false;
    }
  }

  // Get current push subscription
  async getPushSubscription(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      return null;
    }

    try {
      return await this.swRegistration.pushManager.getSubscription();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Failed to get push subscription", err);
      return null;
    }
  }

  // Schedule study reminder
  async scheduleStudyReminder(time: string): Promise<void> {
    const permission = await this.requestNotificationPermission();
    if (!permission.granted) {
      return;
    }

    // Validate time parameter
    if (!time || typeof time !== "string") {
      logger.warn("Invalid time parameter for study reminder", { time });
      return;
    }

    // Calculate delay until reminder time
    const now = new Date();
    const reminderTime = new Date();
    const timeParts = time.split(":");
    if (timeParts.length !== 2) {
      logger.warn("Invalid time format for study reminder", { time });
      return;
    }
    const [hours, minutes] = timeParts.map(Number);
    reminderTime.setHours(hours, minutes, 0, 0);

    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const delay = reminderTime.getTime() - now.getTime();

    // Use setTimeout for immediate reminders, or store for service worker
    if (delay < 24 * 60 * 60 * 1000) {
      // Less than 24 hours
      setTimeout(() => {
        this.showLocalNotification(
          "学習時間です！",
          "庭園の植物があなたを待っています 🌱",
          "/dashboard"
        );
      }, delay);
    }
  }

  // Show local notification
  async showLocalNotification(
    title: string,
    body: string,
    url: string = "/"
  ): Promise<void> {
    const permission = await this.requestNotificationPermission();
    if (!permission.granted) {
      return;
    }

    const options: ExtendedNotificationOptions = {
      body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/badge-72x72.png",
      data: { url },
      vibrate: [200, 100, 200],
      actions: [
        {
          action: "open",
          title: "アプリを開く",
        },
        {
          action: "dismiss",
          title: "後で",
        },
      ],
    };

    if (this.swRegistration) {
      await this.swRegistration.showNotification(title, options);
    } else {
      new Notification(title, options);
    }
  }

  // Notify about app update
  private notifyUpdate(): void {
    this.showLocalNotification(
      "アプリが更新されました",
      "新しい機能が利用できます。アプリを再起動してください。",
      "/"
    );
  }

  // Send subscription to server
  private async sendSubscriptionToServer(
    subscription: PushSubscription
  ): Promise<void> {
    try {
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription,
          userId: this.getCurrentUserId(),
        }),
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Failed to send subscription to server", err);
    }
  }

  // Get current user ID from localStorage
  private getCurrentUserId(): string | null {
    try {
      const userData = localStorage.getItem("takken_user");
      if (userData) {
        const user = JSON.parse(userData);
        return user.id;
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Failed to get user ID", err);
    }
    return null;
  }

  // Convert VAPID key
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
}

// Export singleton instance (only in browser)
export const pwaManager = typeof window !== 'undefined' ? new PWAManager() : null as any;

// Hook for React components
export const usePWA = () => {
  if (typeof window === 'undefined' || !pwaManager) {
    return {
      canInstall: () => false,
      install: () => Promise.resolve(false),
      isInstalled: () => false,
      subscribeToPush: () => Promise.resolve(null),
      unsubscribeFromPush: () => Promise.resolve(false),
      scheduleReminder: (time: string) => Promise.resolve(),
      showNotification: (title: string, body: string, url?: string) => Promise.resolve(),
    };
  }
  
  return {
    canInstall: () => pwaManager.canInstall(),
    install: () => pwaManager.showInstallPrompt(),
    isInstalled: () => pwaManager.isInstalled(),
    subscribeToPush: () => pwaManager.subscribeToPush(),
    unsubscribeFromPush: () => pwaManager.unsubscribeFromPush(),
    scheduleReminder: (time: string) => pwaManager.scheduleStudyReminder(time),
    showNotification: (title: string, body: string, url?: string) =>
      pwaManager.showLocalNotification(title, body, url),
  };
};
