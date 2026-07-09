import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import type {
  Exercise,
  ExerciseRecord,
  UserProfile,
  WorkoutLog,
} from "@/types";
import { SEED_EXERCISES } from "@/data/exercises";
import { getDb, getUid } from "@/lib/firebase";
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
        await setDoc(ref, fresh);
        return fresh;
      },
      async save(profile) {
        await setDoc(doc(getDb(), "users", await getUid()), profile, {
          merge: true,
        });
      },
    },
  };
}
