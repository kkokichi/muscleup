"use client";

import { useCallback, useState } from "react";
import {
  getReminderSettings,
  notificationPermission,
  requestNotificationPermission,
  saveReminderSettings,
  type ReminderSettings,
} from "@/lib/notifications";
import { useHasMounted } from "@/hooks/useHasMounted";

/** リマインダー設定の読み書き＋通知許可 */
export function useReminderSettings() {
  const mounted = useHasMounted();
  const [settings, setSettings] = useState<ReminderSettings>(() =>
    getReminderSettings(),
  );
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");

  // マウント後に実際の権限状態を反映（SSR不一致回避）
  if (mounted && permission === "default" && notificationPermission() !== "default") {
    setPermission(notificationPermission());
  }

  const update = useCallback((patch: Partial<ReminderSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveReminderSettings(next);
      return next;
    });
  }, []);

  const enable = useCallback(async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    update({ enabled: true });
  }, [update]);

  return { settings, permission, mounted, update, enable };
}
