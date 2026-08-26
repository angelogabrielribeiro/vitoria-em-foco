import { createFileRoute } from "@tanstack/react-router";

import { VitoriaExperience } from "@/components/aprova/VitoriaExperience";

export const Route = createFileRoute("/central")({ component: Central });

function Central() {
  return <VitoriaExperience screen="dashboard" />;
}
