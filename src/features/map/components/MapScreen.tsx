import { PageHeader } from "@/components/layout/PageHeader";
import { MuscleMapView } from "@/features/muscle-map/components/MuscleMapView";

/** 端末だけで使える部位マップ。 */
export function MapScreen() {
  return (
    <div>
      <PageHeader title="部位マップ" subtitle="鍛えたい筋肉をタップ" />
      <MuscleMapView />
    </div>
  );
}
