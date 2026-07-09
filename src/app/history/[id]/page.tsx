import { WorkoutDetail } from "@/features/history/components/WorkoutDetail";

export default async function HistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <WorkoutDetail logId={id} />;
}
