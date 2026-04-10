"use client";

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { logger } from '@/lib/logger';

/**
 * AppTrackingTransparencyの権限を要求するコンポーネント
 * iOS環境でのみ動作します
 */
export default function TrackingPermission() {
  useEffect(() => {
    const requestTrackingPermission = async () => {
      // iOS以外、またはウェブ環境では何もしない
      if (Capacitor.getPlatform() !== 'ios') {
        return;
      }

      try {
        // iOS環境でのみ動的にインポート
        const { AppTrackingTransparency } = await import('capacitor-plugin-app-tracking-transparency');
        const status = await AppTrackingTransparency.getStatus();
        logger.info('Current tracking status:', status);

        if (status.status === 'notDetermined') {
          // 権限を要求
          const result = await AppTrackingTransparency.requestPermission();
          logger.info('Tracking permission result:', result);
        }
      } catch (error) {
        logger.error('Error requesting tracking permission', error instanceof Error ? error : new Error(String(error)));
      }
    };

    requestTrackingPermission();
  }, []);

  return null; // UIは表示しない
}
