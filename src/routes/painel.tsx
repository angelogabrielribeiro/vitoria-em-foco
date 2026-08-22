import { createFileRoute } from "@tanstack/react-router";
import { VitoriaExperience } from "@/components/aprova/VitoriaExperience";

export const Route = createFileRoute("/painel")({ component: Painel });

function Painel() {
  return <VitoriaExperience screen="dashboard" />;
}
