import { createFileRoute } from "@tanstack/react-router";

import { VitoriaExperience } from "@/components/aprova/VitoriaExperience";

export const Route = createFileRoute("/biblioteca")({ component: Biblioteca });

function Biblioteca() {
  return <VitoriaExperience screen="library" />;
}
