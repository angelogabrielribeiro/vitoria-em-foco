import { createFileRoute } from "@tanstack/react-router";
import { VitoriaExperience } from "@/components/aprova/VitoriaExperience";

export const Route = createFileRoute("/questao/$questaoId")({ component: Questao });

function Questao() {
  const { questaoId } = Route.useParams();
  return <VitoriaExperience screen="question" questionId={questaoId} />;
}
