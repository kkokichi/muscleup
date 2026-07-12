import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
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

const GOOGLE_SESSION_KEY = "muscleup:v1:googleSession";

function rememberGoogleSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GOOGLE_SESSION_KEY, "true");
}

export function clearKnownGoogleSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(GOOGLE_SESSION_KEY);
}

export function hasKnownGoogleSession(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(GOOGLE_SESSION_KEY) === "true";
}

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

/** ログインが必要な操作でユーザー未ログインの時に投げるエラー */
export class NotSignedInError extends Error {
  constructor() {
    super("ログインが必要です");
    this.name = "NotSignedInError";
  }
}

export function isNotSignedInError(e: unknown): boolean {
  return (
    e instanceof NotSignedInError ||
    (e as { code?: string })?.code === "auth/admin-restricted-operation"
  );
}

/**
 * ログイン中ユーザーのUIDを返す。未ログインなら NotSignedInError を投げる。
 * （匿名認証は廃止。コミュニティ・アカウント保存はGoogleログイン前提）
 */
export async function getUid(): Promise<string> {
  const auth = getAuth(getFirebaseApp());
  if (auth.currentUser) return auth.currentUser.uid;
  const user = await onAuthReady();
  if (user) return user.uid;
  throw new NotSignedInError();
}

// --- Google ログイン（アカウント別データ保存用） ---

/** 最初の認証状態が確定するのを待つ（観測のみ） */
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
  rememberGoogleSession();
  return credential.user;
}

/** ポップアップが使えない環境（iOS Safari等）向けのリダイレクト方式 */
export async function signInWithGoogleRedirect(): Promise<void> {
  await signInWithRedirect(getAuth(getFirebaseApp()), new GoogleAuthProvider());
}

/** リダイレクト方式のログインから戻ってきた場合、そのユーザーを返す */
export async function getGoogleRedirectResult(): Promise<User | null> {
  const result = await getRedirectResult(getAuth(getFirebaseApp()));
  if (result?.user) rememberGoogleSession();
  return result?.user ?? null;
}

export async function signOutUser(): Promise<void> {
  await signOut(getAuth(getFirebaseApp()));
  clearKnownGoogleSession();
}

/** ポップアップ失敗時にリダイレクトへフォールバックすべきエラーか */
export function isPopupUnsupportedError(e: unknown): boolean {
  const code = (e as { code?: string })?.code ?? "";
  return (
    code === "auth/popup-blocked" ||
    code === "auth/operation-not-supported-in-this-environment" ||
    code === "auth/popup-closed-by-user"
  );
}

export function authErrorCode(e: unknown): string {
  return (e as { code?: string })?.code ?? "";
}
