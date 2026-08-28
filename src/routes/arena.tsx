import { createFileRoute } from "@tanstack/react-router";

import { VitoriaExperience } from "@/components/aprova/VitoriaExperience";

export const Route = createFileRoute("/arena")({ component: Arena });

function Arena() {
  return <VitoriaExperience screen="arena" />;
}
