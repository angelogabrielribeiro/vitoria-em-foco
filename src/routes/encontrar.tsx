import { createFileRoute } from "@tanstack/react-router";
import { VitoriaExperience } from "@/components/aprova/VitoriaExperience";

export const Route = createFileRoute("/encontrar")({ component: Encontrar });

function Encontrar() {
  return <VitoriaExperience screen="finder" />;
}
