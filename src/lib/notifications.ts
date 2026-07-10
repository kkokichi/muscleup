import { readStorage, writeStorage } from "@/repositories/local/storage";
import { todayISO } from "@/utils/date";

export interface ReminderSettings {
  enabled: boolean;
  /** "HH:MM" */
  time: string;
  /** 最後に通知した日 YYYY-MM-DD（1日1回に制限） */
  lastRemindedDate?: string;
}

const KEY = "reminderSettings";

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: false,
  time: "19:00",
};

export function getReminderSettings(): ReminderSettings {
  return { ...DEFAULT_SETTINGS, ...readStorage<Partial<ReminderSettings>>(KEY, {}) };
}

export function saveReminderSettings(settings: ReminderSettings): void {
  writeStorage(KEY, settings);
}

/** ブラウザ通知が使えるか（iOS SafariのブラウザタブではNotification未対応） */
export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<
  NotificationPermission | "unsupported"
> {
  if (!notificationsSupported()) return "unsupported";
  return Notification.requestPermission();
}

function currentHHMM(now = new Date()): string {
  return `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes(),
  ).padStart(2, "0")}`;
}

/**
 * 「今日まだトレーニングしておらず、リマインド時刻を過ぎているか」。
 * アプリ内のナッジ表示に使う（権限不要・全プラットフォームで動作）。
 */
export function shouldNudge(
  settings: ReminderSettings,
  trainedToday: boolean,
  now = new Date(),
): boolean {
  if (!settings.enabled || trainedToday) return false;
  return currentHHMM(now) >= settings.time;
}

/**
 * 条件を満たせばブラウザ通知を発火する（フォアグラウンド/対応環境のみ）。
 * 1日1回まで。発火したら true。
 */
export function maybeFireBrowserNotification(
  trainedToday: boolean,
  now = new Date(),
): boolean {
  const settings = getReminderSettings();
  if (!shouldNudge(settings, trainedToday, now)) return false;
  if (notificationPermission() !== "granted") return false;

  const today = todayISO();
  if (settings.lastRemindedDate === today) return false;

  try {
    new Notification("MuscleUp 💪", {
      body: "今日のトレーニングはまだッス！5分だけでも動こう！",
    });
    saveReminderSettings({ ...settings, lastRemindedDate: today });
    return true;
  } catch {
    return false;
  }
}
