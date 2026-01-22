import { createFileRoute } from "@tanstack/react-router";
import { StatsView } from "@/components/StatsView";

export const Route = createFileRoute("/stats")({
  component: StatsPage,
});

function StatsPage() {
  return <StatsView />;
}
