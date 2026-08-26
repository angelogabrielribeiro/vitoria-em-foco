import { createFileRoute } from "@tanstack/react-router";

import { VitoriaExperience } from "@/components/aprova/VitoriaExperience";

export const Route = createFileRoute("/estudar")({ component: Estudar });

function Estudar() {
  return <VitoriaExperience screen="study" />;
}
