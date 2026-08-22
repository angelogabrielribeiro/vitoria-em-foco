import { createFileRoute } from "@tanstack/react-router";
import { VitoriaExperience } from "@/components/aprova/VitoriaExperience";

export const Route = createFileRoute("/plano-completo")({ component: PlanoCompleto });

function PlanoCompleto() {
  return <VitoriaExperience screen="paywall" />;
}
