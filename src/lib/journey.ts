import { useSyncExternalStore } from "react";
import type { BlocoDia, DisponibilidadeBloco } from "@/data/types";

/**
 * Store leve da jornada do candidato (persistida localmente).
 * Substituível por Supabase/Postgres sem tocar na UI: mesma forma de dados.
 */

export interface JourneyState {
  uf: string | null;
  cidadeId: string | null;
  concursoId: string | null;
  cargoId: string | null;
  disponibilidade: DisponibilidadeBloco[];
  diagnostico: { questaoId: string; escolha: string; correta: boolean }[];
  xp: number;
  nivel: number;
  sequencia: number;
  diasConcluidos: number[];
  premium: boolean;
}

export const BLOCOS: { bloco: BlocoDia; label: string; hint: string }[] = [
  { bloco: "manha", label: "Manhã", hint: "antes do trabalho" },
  { bloco: "almoco", label: "Almoço", hint: "intervalo curto" },
  { bloco: "transporte", label: "Transporte", hint: "ônibus, metrô, carona" },
  { bloco: "noite", label: "Noite", hint: "depois do expediente" },
];

const initial: JourneyState = {
  uf: null,
  cidadeId: null,
  concursoId: null,
  cargoId: null,
  disponibilidade: BLOCOS.map(({ bloco }) => ({
    bloco,
    ativo: bloco === "noite",
    minutos: bloco === "noite" ? 60 : 30,
  })),
  diagnostico: [],
  xp: 1240,
  nivel: 4,
  sequencia: 3,
  diasConcluidos: [1, 2],
  premium: false,
};

const KEY = "aprova30.journey.v1";

let state: JourneyState = initial;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...initial, ...(JSON.parse(raw) as Partial<JourneyState>) };
  } catch {
    /* ignora storage indisponível */
  }
}

function emit() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* noop */
    }
  }
  listeners.forEach((l) => l());
}

export const journey = {
  get: () => state,
  subscribe(listener: () => void) {
    hydrate();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  set(patch: Partial<JourneyState>) {
    state = { ...state, ...patch };
    emit();
  },
  addXp(amount: number) {
    const xp = state.xp + amount;
    state = { ...state, xp, nivel: Math.max(1, Math.floor(xp / 400) + 1) };
    emit();
  },
  registrarDiagnostico(questaoId: string, escolha: string, correta: boolean) {
    const diagnostico = [
      ...state.diagnostico.filter((d) => d.questaoId !== questaoId),
      { questaoId, escolha, correta },
    ];
    state = { ...state, diagnostico };
    emit();
  },
  concluirDia(dia: number) {
    if (state.diasConcluidos.includes(dia)) return;
    state = { ...state, diasConcluidos: [...state.diasConcluidos, dia] };
    emit();
  },
  reset() {
    state = initial;
    emit();
  },
};

export function useJourney() {
  return useSyncExternalStore(
    journey.subscribe,
    () => {
      hydrate();
      return state;
    },
    () => initial,
  );
}

export function minutosPorDia(disponibilidade: DisponibilidadeBloco[]) {
  return disponibilidade.filter((b) => b.ativo).reduce((acc, b) => acc + b.minutos, 0);
}

export function xpNoNivel(xp: number) {
  const dentro = xp % 400;
  return { atual: dentro, total: 400, pct: Math.round((dentro / 400) * 100) };
}
