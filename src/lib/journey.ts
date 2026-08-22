import { useSyncExternalStore } from "react";
import type { Alternativa, BlocoDia, DisponibilidadeBloco } from "@/data/types";

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
  recompensasRecebidas: string[];
  editalEnviado: { nome: string; tamanho: string } | null;
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
  xp: 0,
  nivel: 1,
  sequencia: 0,
  diasConcluidos: [],
  premium: false,
  recompensasRecebidas: [],
  editalEnviado: null,
};

const KEY = "vitoria-em-foco.journey.v1";

let state: JourneyState = initial;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<JourneyState>;
      state = {
        ...initial,
        ...saved,
        disponibilidade: Array.isArray(saved.disponibilidade)
          ? saved.disponibilidade
          : initial.disponibilidade,
        diagnostico: Array.isArray(saved.diagnostico) ? saved.diagnostico : [],
        diasConcluidos: Array.isArray(saved.diasConcluidos) ? saved.diasConcluidos : [],
        recompensasRecebidas: Array.isArray(saved.recompensasRecebidas)
          ? saved.recompensasRecebidas
          : [],
      };
    }
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
  selecionarUf(uf: string) {
    state = { ...state, uf, cidadeId: null, concursoId: null, cargoId: null };
    emit();
  },
  selecionarCidade(cidadeId: string) {
    state = { ...state, cidadeId, concursoId: null, cargoId: null };
    emit();
  },
  selecionarConcurso(concursoId: string) {
    state = { ...state, concursoId, cargoId: null, editalEnviado: null };
    emit();
  },
  selecionarCargo(cargoId: string) {
    state = { ...state, cargoId };
    emit();
  },
  definirDisponibilidade(disponibilidade: DisponibilidadeBloco[]) {
    state = { ...state, disponibilidade };
    emit();
  },
  registrarEdital(nome: string, tamanho: string) {
    state = {
      ...state,
      concursoId: null,
      cargoId: null,
      editalEnviado: { nome, tamanho },
    };
    emit();
  },
  addXp(amount: number) {
    const xp = state.xp + amount;
    state = { ...state, xp, nivel: Math.max(1, Math.floor(xp / 400) + 1) };
    emit();
  },
  registrarDiagnostico(questaoId: string, escolha: Alternativa["letra"], correta: boolean) {
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
  premiar(id: string, amount: number) {
    if (state.recompensasRecebidas.includes(id)) return false;
    const xp = state.xp + amount;
    state = {
      ...state,
      xp,
      nivel: Math.max(1, Math.floor(xp / 400) + 1),
      recompensasRecebidas: [...state.recompensasRecebidas, id],
    };
    emit();
    return true;
  },
  reset() {
    state = {
      ...initial,
      disponibilidade: initial.disponibilidade.map((bloco) => ({ ...bloco })),
      diagnostico: [],
      diasConcluidos: [],
      recompensasRecebidas: [],
    };
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
