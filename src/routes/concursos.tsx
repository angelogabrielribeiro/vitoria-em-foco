import { createFileRoute } from "@tanstack/react-router";

import { VitoriaExperience } from "@/components/aprova/VitoriaExperience";

export const Route = createFileRoute("/concursos")({ component: Concursos });

function Concursos() {
  return <VitoriaExperience screen="contests" />;
}
