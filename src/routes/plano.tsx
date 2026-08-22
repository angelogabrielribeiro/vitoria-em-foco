import { createFileRoute } from "@tanstack/react-router";
import { VitoriaExperience } from "@/components/aprova/VitoriaExperience";

export const Route = createFileRoute("/plano")({ component: Plano });

function Plano() {
  return <VitoriaExperience screen="plan" />;
}
