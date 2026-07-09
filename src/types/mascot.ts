export type MascotContext =
  | "greeting"
  | "encourage"
  | "setDone"
  | "workoutSaved"
  | "pb"
  | "restDay"
  | "streak";

export interface MascotMessage {
  id: string;
  context: MascotContext;
  /** {exercise} {streak} などのプレースホルダを含められる */
  text: string;
  /** 出現率の重み（大きいほど出やすい） */
  weight: number;
}

export type MascotMood = "happy" | "excited" | "cheering" | "sleeping";
