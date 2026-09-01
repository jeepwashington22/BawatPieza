import TileLoader from "@/components/TileLoader";

export default function DashboardLoading() {
  return (
    <div className="flex h-full min-h-screen w-full items-center justify-center bg-[var(--background)]">
      <TileLoader label="Loading dashboard..." size="lg" />
    </div>
  );
}
