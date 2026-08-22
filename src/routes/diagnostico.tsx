import { createFileRoute } from "@tanstack/react-router";
import { VitoriaExperience } from "@/components/aprova/VitoriaExperience";

export const Route = createFileRoute("/diagnostico")({ component: Diagnostico });

function Diagnostico() {
  return <VitoriaExperience screen="diagnostic" />;
}
