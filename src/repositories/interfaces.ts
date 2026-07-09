import type {
  Checkin,
  Exercise,
  ExerciseAdvice,
  ExerciseRecord,
  MuscleCategoryId,
  UserProfile,
  WorkoutLog,
  WorkoutTemplate,
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
  replaceAll(records: ExerciseRecord[]): Promise<void>;
}

export interface UserProfileRepository {
  get(): Promise<UserProfile>;
  save(profile: UserProfile): Promise<void>;
}

export interface WorkoutTemplateRepository {
  getAll(): Promise<WorkoutTemplate[]>;
  getById(id: string): Promise<WorkoutTemplate | null>;
  save(template: WorkoutTemplate): Promise<void>;
  delete(id: string): Promise<void>;
}

/** ジムチェックイン（共有） */
export interface CheckinRepository {
  /** 新しい順 */
  getAll(): Promise<Checkin[]>;
  create(checkin: Checkin): Promise<void>;
  delete(id: string): Promise<void>;
}

/** 種目アドバイス（共有） */
export interface AdviceRepository {
  /** 種目ごと、新しい順 */
  getByExercise(exerciseId: string): Promise<ExerciseAdvice[]>;
  create(advice: ExerciseAdvice): Promise<void>;
  delete(id: string): Promise<void>;
  /** いいね数を delta（+1 / -1）だけ増減する */
  updateLikes(id: string, delta: number): Promise<void>;
}

export interface Repositories {
  workoutLogs: WorkoutLogRepository;
  exercises: ExerciseRepository;
  records: RecordRepository;
  userProfile: UserProfileRepository;
  workoutTemplates: WorkoutTemplateRepository;
  checkins: CheckinRepository;
  advice: AdviceRepository;
}
