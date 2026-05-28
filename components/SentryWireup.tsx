"use client";

/**
 * Sentry SDK を lib/error-reporter.ts の抽象に接続する client-only コンポーネント。
 *
 * - mount 時に registerExternalReporter() を一度だけ呼ぶ
 * - DSN 未設定なら Sentry.init は no-op なので、安全に dev/CI で動く
 * - 何も描画しない
 */

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

import { registerExternalReporter } from "@/lib/error-reporter";

export default function SentryWireup() {
  useEffect(() => {
    registerExternalReporter({
      captureException: (error, context) => {
        Sentry.captureException(error, (scope) => {
          if (context?.userId) scope.setUser({ id: context.userId });
          if (context?.tags) scope.setTags(context.tags);
          if (context?.extra) scope.setExtras(context.extra);
          if (context?.severity) scope.setLevel(context.severity);
          return scope;
        });
      },
      captureMessage: (message, context) => {
        Sentry.captureMessage(message, (scope) => {
          if (context?.userId) scope.setUser({ id: context.userId });
          if (context?.tags) scope.setTags(context.tags);
          if (context?.extra) scope.setExtras(context.extra);
          if (context?.severity) scope.setLevel(context.severity);
          return scope;
        });
      },
      setUser: (user) => {
        Sentry.setUser(user);
      },
    });

    return () => {
      // unmount 時は reporter をクリア（HMR で多重登録されないように）
      registerExternalReporter(null);
    };
  }, []);

  return null;
}
