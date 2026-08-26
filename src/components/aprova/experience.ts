export type ExperienceScreen =
  | "landing"
  | "finder"
  | "upload"
  | "availability"
  | "diagnostic"
  | "dashboard"
  | "question"
  | "plan"
  | "paywall"
  | "contests"
  | "contest"
  | "library"
  | "study"
  | "schedule";

export const EXPERIENCE_ROUTES: Record<ExperienceScreen, string> = {
  landing: "/",
  finder: "/encontrar",
  upload: "/enviar-edital",
  availability: "/disponibilidade",
  diagnostic: "/diagnostico",
  dashboard: "/central",
  question: "/questao/q1",
  plan: "/plano",
  paywall: "/plano-completo",
  contests: "/concursos",
  contest: "/concurso",
  library: "/biblioteca",
  study: "/estudar",
  schedule: "/cronograma",
};
