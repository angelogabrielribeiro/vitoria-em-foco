import type { Cargo, Conquista, DiaPlano } from "../types";

/** MOCK — geração determinística do "Plano Intensivo de Aprovação". */

const TIPOS: DiaPlano["tipo"][] = ["aula", "aula", "revisao", "aula", "desafio", "revisao", "simulado"];

const FOCOS = [
  "Fundamentos e vocabulário da banca",
  "Questões guiadas com correção imediata",
  "Revisão ativa por flashcards",
  "Pegadinhas clássicas do tema",
  "Simulado cronometrado curto",
  "Consolidação e mapa mental",
];

export interface PlanoIntensivo {
  dias: DiaPlano[];
  minutosTotais: number;
  diasDisponiveis: number;
  gratuitosAte: number;
}

export function gerarPlano(
  cargo: Cargo | undefined,
  diasAteProva: number,
  minutosPorDia: number,
): PlanoIntensivo {
  const total = Math.min(30, Math.max(7, diasAteProva));
  const disciplinas = cargo?.disciplinas.length
    ? cargo.disciplinas
    : [
        { id: "portugues", nome: "Língua Portuguesa", questoes: 15, peso: 1, topicos: [] },
        { id: "rlm", nome: "Raciocínio Lógico", questoes: 10, peso: 1, topicos: [] },
      ];

  const pesos = disciplinas.flatMap((d) => Array<string>(Math.max(1, Math.round(d.peso))).fill(d.nome));

  const dias: DiaPlano[] = Array.from({ length: total }, (_, index) => {
    const dia = index + 1;
    const tipo = dia % 7 === 0 ? "simulado" : TIPOS[index % TIPOS.length];
    const principais =
      tipo === "simulado"
        ? disciplinas.slice(0, 3).map((d) => d.nome)
        : [pesos[index % pesos.length], pesos[(index + 2) % pesos.length]].filter(
            (nome, i, arr) => arr.indexOf(nome) === i,
          );
    return {
      dia,
      titulo:
        tipo === "simulado"
          ? `Desafio semanal · Simulado ${Math.ceil(dia / 7)}`
          : `Dia ${dia} · ${principais[0]}`,
      foco: tipo === "simulado" ? "Prova cronometrada com relatório de pontos fracos" : FOCOS[index % FOCOS.length],
      disciplinas: principais,
      minutos: tipo === "simulado" ? Math.round(minutosPorDia * 1.2) : minutosPorDia,
      tipo,
      bloqueado: dia > 3,
      xp: tipo === "simulado" ? 320 : tipo === "desafio" ? 210 : 120,
    };
  });

  return {
    dias,
    diasDisponiveis: total,
    minutosTotais: dias.reduce((acc, d) => acc + d.minutos, 0),
    gratuitosAte: 3,
  };
}

export const CONQUISTAS: Conquista[] = [
  {
    id: "primeiro-passo",
    nome: "Primeiro passo",
    descricao: "Concluiu o diagnóstico inicial",
    icone: "zap",
    desbloqueada: true,
  },
  {
    id: "chama-3",
    nome: "Chama acesa",
    descricao: "3 dias seguidos de estudo",
    icone: "flame",
    desbloqueada: true,
  },
  {
    id: "sniper",
    nome: "Mira calibrada",
    descricao: "70% de acerto em um bloco",
    icone: "target",
    desbloqueada: true,
  },
  {
    id: "blindado",
    nome: "Blindado",
    descricao: "Revisou 50 questões erradas",
    icone: "shield",
    desbloqueada: false,
  },
  {
    id: "memoria",
    nome: "Palácio da memória",
    descricao: "Criou 10 mnemônicos próprios",
    icone: "brain",
    desbloqueada: false,
  },
  {
    id: "aprovado",
    nome: "Reta final",
    descricao: "Completou o plano de 30 dias",
    icone: "trophy",
    desbloqueada: false,
  },
];
