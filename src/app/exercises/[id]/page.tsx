import { SEED_EXERCISES } from "@/data/exercises";
import { ExerciseDetail } from "@/features/exercises/components/ExerciseDetail";

/** 静的エクスポート用: シード種目の詳細ページを事前生成する */
export function generateStaticParams() {
  return SEED_EXERCISES.map((e) => ({ id: e.id }));
}

export const dynamicParams = false;

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ExerciseDetail exerciseId={id} />;
}
