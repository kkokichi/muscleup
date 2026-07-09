import { ExerciseList } from "@/features/exercises/components/ExerciseList";

export default async function ExercisesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  return <ExerciseList initialCategory={category} />;
}
