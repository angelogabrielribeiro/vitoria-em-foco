import { createFileRoute } from "@tanstack/react-router";
import { VitoriaExperience } from "@/components/aprova/VitoriaExperience";

export const Route = createFileRoute("/disponibilidade")({ component: Disponibilidade });

function Disponibilidade() {
  return <VitoriaExperience screen="availability" />;
}
