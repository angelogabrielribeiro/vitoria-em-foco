import { createFileRoute } from "@tanstack/react-router";

import { VitoriaExperience } from "@/components/aprova/VitoriaExperience";

export const Route = createFileRoute("/cronograma")({ component: Cronograma });

function Cronograma() {
  return <VitoriaExperience screen="schedule" />;
}
