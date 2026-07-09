import type {
  Exercise,
  ExerciseRecord,
  MuscleCategoryId,
  UserProfile,
  WorkoutLog,
} from "@/types";

export interface WorkoutLogRepository {
  /** 日付降順 */
  getAll(): Promise<WorkoutLog[]>;
  getById(id: string): Promise<WorkoutLog | null>;
  /** upsert */
  save(log: WorkoutLog): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ExerciseRepository {
  /** シード種目 + カスタム種目 */
  getAll(): Promise<Exercise[]>;
  getById(id: string): Promise<Exercise | null>;
  getByCategory(categoryId: MuscleCategoryId): Promise<Exercise[]>;
  saveCustom(exercise: Exercise): Promise<void>;
}

export interface RecordRepository {
  getAll(): Promise<ExerciseRecord[]>;
  getByExercise(exerciseId: string): Promise<ExerciseRecord | null>;
  /** upsert（exerciseId 単位） */
  save(record: ExerciseRecord): Promise<void>;
}

export interface UserProfileRepository {
  get(): Promise<UserProfile>;
  save(profile: UserProfile): Promise<void>;
}

export interface Repositories {
  workoutLogs: WorkoutLogRepository;
  exercises: ExerciseRepository;
  records: RecordRepository;
  userProfile: UserProfileRepository;
}
