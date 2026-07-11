import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Firebase 接続設定。
 * Firebaseのウェブ設定（apiKey等）は公開情報であり、クライアントバンドルに
 * 含まれる前提のもの。セキュリティは Firestore ルール + 認証で担保する
 * （docs/13-backend-setup.md, firestore.rules）。そのため既定値をコードに
 * 埋め込み、環境変数（NEXT_PUBLIC_FIREBASE_*）があればそれで上書きする。
 */
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBjY99pz342UbDYBk8nYbwbg4lalqt3LxA",
  authDomain: "muscleup-c3f46.firebaseapp.com",
  projectId: "muscleup-c3f46",
  storageBucket: "muscleup-c3f46.firebasestorage.app",
  messagingSenderId: "411709345538",
  appId: "1:411709345538:web:5ac3850bdbac106af53c1b",
} as const;

function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
    authDomain:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
      DEFAULT_FIREBASE_CONFIG.authDomain,
    projectId:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      DEFAULT_FIREBASE_CONFIG.projectId,
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      DEFAULT_FIREBASE_CONFIG.storageBucket,
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
      DEFAULT_FIREBASE_CONFIG.messagingSenderId,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
  };
}

/** Firebase 設定が揃っているか（既定値があるため通常true） */
export function isFirebaseConfigured(): boolean {
  const config = getFirebaseConfig();
  return Boolean(config.apiKey && config.projectId);
}

function getFirebaseApp(): FirebaseApp {
  const existing = getApps()[0];
  if (existing) return existing;
  return initializeApp(getFirebaseConfig());
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

// --- Google ログイン（アカウント別データ保存用） ---

/** 最初の認証状態が確定するのを待つ（匿名サインインはしない・観測のみ） */
export function onAuthReady(): Promise<User | null> {
  const auth = getAuth(getFirebaseApp());
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      unsubscribe();
      resolve(u);
    });
  });
}

/** ログイン中のGoogleユーザー（匿名は除外）。未ログインなら null */
export async function getSignedInUser(): Promise<User | null> {
  const user = await onAuthReady();
  return user && !user.isAnonymous ? user : null;
}

export function subscribeAuth(cb: (user: User | null) => void): () => void {
  return onAuthStateChanged(getAuth(getFirebaseApp()), cb);
}

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(getAuth(getFirebaseApp()), provider);
  return credential.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(getAuth(getFirebaseApp()));
}
