import { createFileRoute } from "@tanstack/react-router";
import { VitoriaExperience } from "@/components/aprova/VitoriaExperience";

export const Route = createFileRoute("/enviar-edital")({ component: EnviarEdital });

function EnviarEdital() {
  return <VitoriaExperience screen="upload" />;
}
