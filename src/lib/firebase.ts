import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  type User,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Firebase 接続設定。NEXT_PUBLIC_FIREBASE_* が未設定の場合、
 * アプリはローカル（localStorage）Repositoryで動作する。
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  );
}

function getFirebaseApp(): FirebaseApp {
  const existing = getApps()[0];
  if (existing) return existing;
  return initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
}

export function getDb(): Firestore {
  return getFirestore(getFirebaseApp());
}

/**
 * 匿名認証でUIDを取得する（MVPは匿名運用。
 * フェーズ1.5でGoogle/Apple連携へアップグレード可能）。
 */
export async function getUid(): Promise<string> {
  const auth = getAuth(getFirebaseApp());
  if (auth.currentUser) return auth.currentUser.uid;

  const user = await new Promise<User | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      unsubscribe();
      resolve(u);
    });
  });
  if (user) return user.uid;

  const credential = await signInAnonymously(auth);
  return credential.user.uid;
}

/**
 * Firebase設定時は匿名UID、未設定時は端末固有の擬似IDを返す。
 * コミュニティ投稿の author 識別に使う。
 */
export async function getAuthorId(): Promise<string> {
  if (isFirebaseConfigured()) return getUid();
  return getLocalDeviceId();
}

const LOCAL_DEVICE_KEY = "muscleup:v1:deviceId";

function getLocalDeviceId(): string {
  if (typeof window === "undefined") return "local";
  let id = window.localStorage.getItem(LOCAL_DEVICE_KEY);
  if (!id) {
    id = `local-${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(LOCAL_DEVICE_KEY, id);
  }
  return id;
}
