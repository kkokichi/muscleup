import {
  collection,
  deleteDoc,
  doc,
  endAt,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  setDoc,
  startAt,
  updateDoc,
  where,
} from "firebase/firestore";
import type {
  Checkin,
  CheckinComment,
  CheckinReaction,
  Exercise,
  ExerciseAdvice,
  ExerciseRecord,
  PublicProfile,
  UserProfile,
  WorkoutLog,
  WorkoutTemplate,
} from "@/types";
import { SEED_EXERCISES } from "@/data/exercises";
import { getUid } from "@/lib/firebase";
import { getDb } from "@/lib/firestoreDb";
import type { Repositories } from "../interfaces";

/**
 * Firestore 実装（docs/05-database-design.md のコレクション設計に対応）。
 * users/{uid}/workoutLogs, users/{uid}/records, users/{uid}/customExercises
 * このモジュールは Firebase 設定時のみ動的 import される（バンドル肥大防止）。
 */
export function createFirestoreRepositories(): Repositories {
  const userCol = async (name: string) =>
    collection(getDb(), "users", await getUid(), name);

  return {
    workoutLogs: {
      async getAll() {
        const snap = await getDocs(
          query(await userCol("workoutLogs"), orderBy("date", "desc")),
        );
        return snap.docs.map((d) => d.data() as WorkoutLog);
      },
      async getById(id) {
        const snap = await getDoc(doc(await userCol("workoutLogs"), id));
        return snap.exists() ? (snap.data() as WorkoutLog) : null;
      },
      async save(log) {
        await setDoc(doc(await userCol("workoutLogs"), log.id), log);
      },
      async delete(id) {
        await deleteDoc(doc(await userCol("workoutLogs"), id));
      },
    },

    exercises: {
      async getAll() {
        const snap = await getDocs(await userCol("customExercises"));
        return [...SEED_EXERCISES, ...snap.docs.map((d) => d.data() as Exercise)];
      },
      async getById(id) {
        const seed = SEED_EXERCISES.find((e) => e.id === id);
        if (seed) return seed;
        const snap = await getDoc(doc(await userCol("customExercises"), id));
        return snap.exists() ? (snap.data() as Exercise) : null;
      },
      async getByCategory(categoryId) {
        const all = await this.getAll();
        return all.filter((e) => e.categoryId === categoryId);
      },
      async saveCustom(exercise) {
        await setDoc(doc(await userCol("customExercises"), exercise.id), {
          ...exercise,
          isCustom: true,
        });
      },
      async deleteCustom(id) {
        await deleteDoc(doc(await userCol("customExercises"), id));
      },
    },

    records: {
      async getAll() {
        const snap = await getDocs(await userCol("records"));
        return snap.docs.map((d) => d.data() as ExerciseRecord);
      },
      async getByExercise(exerciseId) {
        const snap = await getDoc(doc(await userCol("records"), exerciseId));
        return snap.exists() ? (snap.data() as ExerciseRecord) : null;
      },
      async save(record) {
        await setDoc(doc(await userCol("records"), record.exerciseId), record);
      },
      async replaceAll(records) {
        const col = await userCol("records");
        const snap = await getDocs(col);
        await Promise.all(snap.docs.map((item) => deleteDoc(item.ref)));
        await Promise.all(
          records.map((record) =>
            setDoc(doc(col, record.exerciseId), record),
          ),
        );
      },
    },

    userProfile: {
      async get() {
        const ref = doc(getDb(), "users", await getUid());
        const snap = await getDoc(ref);
        if (snap.exists()) return snap.data() as UserProfile;
        const fresh: UserProfile = {
          displayName: "トレーニー",
          xp: 0,
          createdAt: new Date().toISOString(),
        };
        // 初期プロフィールの作成は待たない（fire-and-forget）。
        // オフライン起動時、Firestore の書き込み Promise は接続が戻るまで
        // 解決しないため、await するとホームの読み込みが固まってしまう。
        void setDoc(ref, fresh).catch((e) =>
          console.error("初期プロフィールの保存に失敗", e),
        );
        return fresh;
      },
      async save(profile) {
        const uid = await getUid();
        await setDoc(doc(getDb(), "users", uid), profile, { merge: true });
        // 表示名だけは公開ミラー（publicProfiles）にも反映する。
        // フレンド検索・表示は users/{uid}（私的）を読めないため、ここで同期する。
        await setDoc(
          doc(getDb(), "publicProfiles", uid),
          { uid, displayName: profile.displayName, updatedAt: new Date().toISOString() },
          { merge: true },
        ).catch((e) => console.error("公開プロフィールの同期に失敗", e));
      },
    },

    workoutTemplates: {
      async getAll() {
        const snap = await getDocs(
          query(await userCol("workoutTemplates"), orderBy("updatedAt", "desc")),
        );
        return snap.docs.map((d) => d.data() as WorkoutTemplate);
      },
      async getById(id) {
        const snap = await getDoc(doc(await userCol("workoutTemplates"), id));
        return snap.exists() ? (snap.data() as WorkoutTemplate) : null;
      },
      async save(template) {
        await setDoc(doc(await userCol("workoutTemplates"), template.id), template);
      },
      async delete(id) {
        await deleteDoc(doc(await userCol("workoutTemplates"), id));
      },
    },

    // --- 共有コレクション（全ユーザー間） ---
    checkins: {
      async getAll() {
        await getUid(); // 読み取りにも認証が必要
        const snap = await getDocs(
          query(collection(getDb(), "checkins"), orderBy("createdAt", "desc")),
        );
        return snap.docs.map((d) => d.data() as Checkin);
      },
      async create(checkin) {
        await setDoc(doc(getDb(), "checkins", checkin.id), checkin);
      },
      async delete(id) {
        await deleteDoc(doc(getDb(), "checkins", id));
      },
      async getReactions(checkinId) {
        const snap = await getDocs(
          collection(getDb(), "checkins", checkinId, "reactions"),
        );
        return snap.docs.map((d) => d.data() as CheckinReaction);
      },
      async setReaction(checkinId, userId, reaction) {
        const ref = doc(getDb(), "checkins", checkinId, "reactions", userId);
        if (reaction === null) {
          await deleteDoc(ref);
          return;
        }
        await setDoc(ref, { ...reaction, userId });
      },
      async getComments(checkinId) {
        const snap = await getDocs(
          query(
            collection(getDb(), "checkins", checkinId, "comments"),
            orderBy("createdAt", "desc"),
          ),
        );
        return snap.docs.map((d) => d.data() as CheckinComment);
      },
      async addComment(checkinId, comment) {
        await setDoc(
          doc(getDb(), "checkins", checkinId, "comments", comment.id),
          comment,
        );
      },
      async deleteComment(checkinId, commentId) {
        await deleteDoc(
          doc(getDb(), "checkins", checkinId, "comments", commentId),
        );
      },
    },

    advice: {
      async getByExercise(exerciseId) {
        await getUid();
        const snap = await getDocs(
          query(
            collection(getDb(), "exerciseAdvice"),
            where("exerciseId", "==", exerciseId),
            orderBy("createdAt", "desc"),
          ),
        );
        return snap.docs.map((d) => d.data() as ExerciseAdvice);
      },
      async create(advice) {
        await setDoc(doc(getDb(), "exerciseAdvice", advice.id), advice);
      },
      async delete(id) {
        await deleteDoc(doc(getDb(), "exerciseAdvice", id));
      },
      async updateLikes(id, delta) {
        await updateDoc(doc(getDb(), "exerciseAdvice", id), {
          likeCount: increment(delta),
        });
      },
    },

    social: {
      async getPublicProfile(uid) {
        const snap = await getDoc(doc(getDb(), "publicProfiles", uid));
        return snap.exists() ? (snap.data() as PublicProfile) : null;
      },
      async searchProfilesByName(prefix, limitN = 20) {
        const term = prefix.trim();
        if (!term) return [];
        // 表示名の前方一致（Firestore の範囲クエリ）。末尾に高コードポイントの
        // 番兵(\uf8ff)を付けて前方一致の範囲にする定番手法。
        const snap = await getDocs(
          query(
            collection(getDb(), "publicProfiles"),
            orderBy("displayName"),
            startAt(term),
            endAt(term + "\uf8ff"),
            limit(limitN),
          ),
        );
        return snap.docs.map((d) => d.data() as PublicProfile);
      },
    },
  };
}
