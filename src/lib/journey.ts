import { useSyncExternalStore } from "react";
import type { Alternativa, BlocoDia, DisponibilidadeBloco } from "@/data/types";

export type ScheduleTaskKind = "teoria" | "revisao" | "questoes" | "simulado" | "etapa";

export interface ScheduleTask {
  id: string;
  day: number;
  title: string;
  discipline: string;
  minutes: number;
  kind: ScheduleTaskKind;
  completed: boolean;
}

export interface UploadedDocument {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  status: "analisado" | "processando";
  mappedSections: number;
}

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
  coins: number;
  nivel: number;
  sequencia: number;
  diasConcluidos: number[];
  premium: boolean;
  recompensasRecebidas: string[];
  itensResgatados: string[];
  editalEnviado: { nome: string; tamanho: string } | null;
  favoritos: string[];
  cadernoErros: string[];
  atividadesConcluidas: string[];
  documentosEnviados: UploadedDocument[];
  cronograma: ScheduleTask[];
  metaSemanal: number;
  somAtivo: boolean;
}

export const BLOCOS: { bloco: BlocoDia; label: string; hint: string }[] = [
  { bloco: "manha", label: "Manhã", hint: "antes do trabalho" },
  { bloco: "almoco", label: "Almoço", hint: "intervalo curto" },
  { bloco: "transporte", label: "Transporte", hint: "ônibus, metrô, carona" },
  { bloco: "noite", label: "Noite", hint: "depois do expediente" },
];

const CRONOGRAMA_INICIAL: ScheduleTask[] = [
  {
    id: "seg-crase",
    day: 0,
    title: "História visual da crase",
    discipline: "Português",
    minutes: 25,
    kind: "teoria",
    completed: false,
  },
  {
    id: "seg-questoes",
    day: 0,
    title: "Batalha de 12 questões",
    discipline: "Português",
    minutes: 20,
    kind: "questoes",
    completed: false,
  },
  {
    id: "ter-atos",
    day: 1,
    title: "Mapa dos atos administrativos",
    discipline: "Direito Administrativo",
    minutes: 35,
    kind: "teoria",
    completed: false,
  },
  {
    id: "qua-const",
    day: 2,
    title: "Direitos fundamentais",
    discipline: "Direito Constitucional",
    minutes: 40,
    kind: "revisao",
    completed: false,
  },
  {
    id: "qui-logica",
    day: 3,
    title: "Sequências e proposições",
    discipline: "Raciocínio Lógico",
    minutes: 35,
    kind: "questoes",
    completed: false,
  },
  {
    id: "sex-edital",
    day: 4,
    title: "Revisão do edital e prazos",
    discipline: "Estratégia",
    minutes: 20,
    kind: "etapa",
    completed: false,
  },
  {
    id: "sab-simulado",
    day: 5,
    title: "Simulado de checkpoint",
    discipline: "Misto",
    minutes: 90,
    kind: "simulado",
    completed: false,
  },
  {
    id: "dom-erros",
    day: 6,
    title: "Caderno de erros",
    discipline: "Revisão",
    minutes: 30,
    kind: "revisao",
    completed: false,
  },
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
  coins: 40,
  nivel: 1,
  sequencia: 0,
  diasConcluidos: [],
  premium: false,
  recompensasRecebidas: [],
  itensResgatados: [],
  editalEnviado: null,
  favoritos: [],
  cadernoErros: [],
  atividadesConcluidas: [],
  documentosEnviados: [],
  cronograma: CRONOGRAMA_INICIAL,
  metaSemanal: 420,
  somAtivo: false,
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
        itensResgatados: Array.isArray(saved.itensResgatados) ? saved.itensResgatados : [],
        favoritos: Array.isArray(saved.favoritos) ? saved.favoritos : [],
        cadernoErros: Array.isArray(saved.cadernoErros) ? saved.cadernoErros : [],
        atividadesConcluidas: Array.isArray(saved.atividadesConcluidas)
          ? saved.atividadesConcluidas
          : [],
        documentosEnviados: Array.isArray(saved.documentosEnviados) ? saved.documentosEnviados : [],
        cronograma: Array.isArray(saved.cronograma)
          ? saved.cronograma
          : CRONOGRAMA_INICIAL.map((task) => ({ ...task })),
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
    const uploaded: UploadedDocument = {
      id: `upload-${Date.now()}`,
      name: nome,
      size: tamanho,
      uploadedAt: new Date().toISOString(),
      status: "analisado",
      mappedSections: 12,
    };
    state = {
      ...state,
      editalEnviado: { nome, tamanho },
      documentosEnviados: [uploaded, ...state.documentosEnviados],
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
  premiar(id: string, amount: number, coins = Math.max(4, Math.round(amount / 8))) {
    if (state.recompensasRecebidas.includes(id)) return false;
    const xp = state.xp + amount;
    state = {
      ...state,
      xp,
      coins: state.coins + coins,
      nivel: Math.max(1, Math.floor(xp / 400) + 1),
      recompensasRecebidas: [...state.recompensasRecebidas, id],
    };
    emit();
    return true;
  },
  concluirAtividade(id: string, xp: number, coins: number) {
    if (state.atividadesConcluidas.includes(id)) return false;
    const totalXp = state.xp + xp;
    state = {
      ...state,
      xp: totalXp,
      coins: state.coins + coins,
      nivel: Math.max(1, Math.floor(totalXp / 400) + 1),
      sequencia: Math.max(1, state.sequencia),
      atividadesConcluidas: [...state.atividadesConcluidas, id],
      recompensasRecebidas: [...state.recompensasRecebidas, `atividade-${id}`],
    };
    emit();
    return true;
  },
  alternarFavorito(concursoId: string) {
    const favoritos = state.favoritos.includes(concursoId)
      ? state.favoritos.filter((id) => id !== concursoId)
      : [...state.favoritos, concursoId];
    state = { ...state, favoritos };
    emit();
  },
  alternarCadernoErro(questaoId: string) {
    const cadernoErros = state.cadernoErros.includes(questaoId)
      ? state.cadernoErros.filter((id) => id !== questaoId)
      : [...state.cadernoErros, questaoId];
    state = { ...state, cadernoErros };
    emit();
  },
  definirSom(ativo: boolean) {
    state = { ...state, somAtivo: ativo };
    emit();
  },
  removerDocumento(id: string) {
    state = {
      ...state,
      documentosEnviados: state.documentosEnviados.filter((document) => document.id !== id),
    };
    emit();
  },
  resgatarItem(id: string, custo: number) {
    if (state.itensResgatados.includes(id) || state.coins < custo) return false;
    state = {
      ...state,
      coins: state.coins - custo,
      itensResgatados: [...state.itensResgatados, id],
    };
    emit();
    return true;
  },
  definirMetaSemanal(minutos: number) {
    state = { ...state, metaSemanal: minutos };
    emit();
  },
  atualizarTarefa(id: string, patch: Partial<Omit<ScheduleTask, "id">>) {
    state = {
      ...state,
      cronograma: state.cronograma.map((task) => (task.id === id ? { ...task, ...patch } : task)),
    };
    emit();
  },
  adicionarTarefa(task: Omit<ScheduleTask, "id" | "completed">) {
    state = {
      ...state,
      cronograma: [
        ...state.cronograma,
        { ...task, id: `task-${Date.now()}-${state.cronograma.length}`, completed: false },
      ],
    };
    emit();
  },
  removerTarefa(id: string) {
    state = { ...state, cronograma: state.cronograma.filter((task) => task.id !== id) };
    emit();
  },
  restaurarCronograma() {
    state = { ...state, cronograma: CRONOGRAMA_INICIAL.map((task) => ({ ...task })) };
    emit();
  },
  reset() {
    state = {
      ...initial,
      disponibilidade: initial.disponibilidade.map((bloco) => ({ ...bloco })),
      diagnostico: [],
      diasConcluidos: [],
      recompensasRecebidas: [],
      itensResgatados: [],
      favoritos: [],
      cadernoErros: [],
      atividadesConcluidas: [],
      documentosEnviados: [],
      cronograma: CRONOGRAMA_INICIAL.map((task) => ({ ...task })),
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
