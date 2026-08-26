import { createFileRoute } from "@tanstack/react-router";

import { VitoriaExperience } from "@/components/aprova/VitoriaExperience";

export const Route = createFileRoute("/concurso")({ component: Concurso });

function Concurso() {
  return <VitoriaExperience screen="contest" />;
}
