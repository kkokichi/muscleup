import { ExerciseDetail } from "@/features/exercises/components/ExerciseDetail";

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ExerciseDetail exerciseId={id} />;
}
