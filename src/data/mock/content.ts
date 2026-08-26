import type { Concurso } from "../types";

export type DocumentKind = "edital" | "retificacao" | "prova" | "gabarito" | "manual";

export interface ContestDocument {
  id: string;
  concursoId: string;
  kind: DocumentKind;
  title: string;
  subtitle: string;
  publishedAt: string;
  pages: number;
  size: string;
  year: number;
  color: "lime" | "gold" | "ember" | "ice";
  highlights: string[];
  sections: { heading: string; body: string }[];
}

export type ActivityKind = "explicacao" | "mapa" | "flashcards" | "questoes" | "audio" | "simulado";

export interface LearningActivity {
  id: string;
  kind: ActivityKind;
  eyebrow: string;
  title: string;
  description: string;
  duration: number;
  xp: number;
  coins: number;
  discipline: string;
  completed?: boolean;
}

export interface ExplanationScene {
  id: string;
  kicker: string;
  title: string;
  body: string;
  formula: string;
  note: string;
}

const date = (daysAgo: number) => {
  const base = new Date("2026-08-22T12:00:00Z");
  base.setUTCDate(base.getUTCDate() - daysAgo);
  return base.toISOString().slice(0, 10);
};

export function getContestDocuments(concurso: Concurso): ContestDocument[] {
  const cargo = concurso.cargos[0]?.nome ?? "cargo principal";
  const subject = concurso.cargos[0]?.disciplinas[0]?.nome ?? "Conhecimentos gerais";
  const baseSections = [
    {
      heading: "O que realmente importa",
      body: `${concurso.vagasTotais} vagas distribuídas entre ${concurso.cargos.length} cargo(s). A prova está prevista para ${new Date(`${concurso.dataProva}T00:00:00Z`).toLocaleDateString("pt-BR", { timeZone: "UTC" })}, com organização da ${concurso.banca}.`,
    },
    {
      heading: "Regra de corte",
      body: "O candidato precisa alcançar o mínimo global e não pode zerar nenhum bloco. A rota de estudos destaca automaticamente os tópicos de maior peso e risco.",
    },
    {
      heading: "Mapa de conteúdo",
      body: `${subject} abre a trilha, seguido das disciplinas específicas do cargo de ${cargo}. Cada tópico pode ser convertido em aula, revisão ativa, flashcards ou bateria de questões.`,
    },
  ];

  return [
    {
      id: `${concurso.id}-edital`,
      concursoId: concurso.id,
      kind: "edital",
      title: "Edital verticalizado",
      subtitle: `${concurso.orgao} · versão analisada`,
      publishedAt: date(18),
      pages: 86,
      size: "4,8 MB",
      year: 2026,
      color: "lime",
      highlights: ["datas extraídas", "pesos mapeados", "etapas conectadas"],
      sections: baseSections,
    },
    {
      id: `${concurso.id}-retificacao`,
      concursoId: concurso.id,
      kind: "retificacao",
      title: "Retificação nº 01",
      subtitle: "Mudanças comparadas com o edital original",
      publishedAt: date(9),
      pages: 7,
      size: "630 KB",
      year: 2026,
      color: "ember",
      highlights: ["2 datas alteradas", "1 requisito atualizado", "sem mudança no conteúdo"],
      sections: [
        {
          heading: "Radar de mudanças",
          body: "O período de recursos foi ampliado em dois dias e a documentação de títulos ganhou um novo formato de envio. O conteúdo programático permanece igual.",
        },
        {
          heading: "Impacto no seu plano",
          body: "Nenhuma matéria precisa ser recalculada. A agenda de documentos foi movida automaticamente para a nova janela.",
        },
      ],
    },
    {
      id: `${concurso.id}-prova-2024`,
      concursoId: concurso.id,
      kind: "prova",
      title: "Prova anterior · tipo A",
      subtitle: `${concurso.banca} · cargo equivalente`,
      publishedAt: "2024-09-15",
      pages: 24,
      size: "2,1 MB",
      year: 2024,
      color: "gold",
      highlights: ["80 questões", "nível intermediário", "tempo sugerido 3h30"],
      sections: [
        {
          heading: "Raio-X da prova",
          body: "A banca concentrou interpretação, aplicação literal da lei e situações práticas. Questões longas aparecem em blocos, por isso o treino inclui ritmo e marcação de tempo.",
        },
        {
          heading: "Comece um simulado",
          body: "Você pode reproduzir a prova inteira ou gerar um recorte apenas com os assuntos que ainda estão abaixo da meta.",
        },
      ],
    },
    {
      id: `${concurso.id}-gabarito-2024`,
      concursoId: concurso.id,
      kind: "gabarito",
      title: "Gabarito definitivo · 2024",
      subtitle: "Respostas, anuladas e recursos aceitos",
      publishedAt: "2024-10-02",
      pages: 5,
      size: "410 KB",
      year: 2024,
      color: "ice",
      highlights: ["3 anuladas", "2 respostas alteradas", "comentários disponíveis"],
      sections: [
        {
          heading: "Leitura inteligente",
          body: "Além da alternativa correta, o leitor mostra o motivo das anulações e transforma cada recurso aceito em uma regra de prova para revisão.",
        },
      ],
    },
    {
      id: `${concurso.id}-prova-2022`,
      concursoId: concurso.id,
      kind: "prova",
      title: "Prova histórica · 2022",
      subtitle: "Mesmo eixo de conteúdo",
      publishedAt: "2022-07-10",
      pages: 22,
      size: "1,9 MB",
      year: 2022,
      color: "ember",
      highlights: ["60 questões", "ênfase em legislação", "comentada no acervo"],
      sections: baseSections.slice(1),
    },
    {
      id: `${concurso.id}-manual`,
      concursoId: concurso.id,
      kind: "manual",
      title: "Manual das outras etapas",
      subtitle: "TAF, títulos, exames e documentação",
      publishedAt: date(4),
      pages: 18,
      size: "1,2 MB",
      year: 2026,
      color: "ice",
      highlights: ["checklists", "prazos", "treino físico"],
      sections: concurso.etapas.map((stage) => ({
        heading: stage.titulo,
        body: `${stage.descricao} ${stage.eliminatoria ? "Etapa eliminatória: a preparação entra no calendário desde agora." : "Etapa classificatória: vale organizar os comprovantes com antecedência."}`,
      })),
    },
  ];
}

export const TODAY_PLAYLIST: LearningActivity[] = [
  {
    id: "story-crase",
    kind: "explicacao",
    eyebrow: "história visual",
    title: "O encontro secreto da crase",
    description: "Veja dois 'a' virarem um só em uma cena de 4 movimentos.",
    duration: 7,
    xp: 80,
    coins: 12,
    discipline: "Português",
  },
  {
    id: "mapa-adm",
    kind: "mapa",
    eyebrow: "mapa mental vivo",
    title: "Atos administrativos sem decorar no escuro",
    description: "Monte o mapa arrastando atributos para o lugar certo.",
    duration: 9,
    xp: 110,
    coins: 18,
    discipline: "Direito Administrativo",
  },
  {
    id: "cards-const",
    kind: "flashcards",
    eyebrow: "memória ativa",
    title: "Direitos fundamentais em 5 cartas",
    description: "Vire, responda em voz alta e marque o que ainda escapou.",
    duration: 6,
    xp: 70,
    coins: 10,
    discipline: "Direito Constitucional",
  },
  {
    id: "battle-crase",
    kind: "questoes",
    eyebrow: "batalha relâmpago",
    title: "8 questões contra a banca",
    description: "Feedback imediato e explicação diferente para cada erro.",
    duration: 12,
    xp: 160,
    coins: 24,
    discipline: "Português",
  },
  {
    id: "audio-revisao",
    kind: "audio",
    eyebrow: "revisão sonora",
    title: "Resumo de bolso para o transporte",
    description: "Uma revisão guiada com pausas para você completar a regra.",
    duration: 8,
    xp: 60,
    coins: 8,
    discipline: "Direito Administrativo",
  },
  {
    id: "mini-simulado",
    kind: "simulado",
    eyebrow: "checkpoint",
    title: "Mini-simulado adaptativo",
    description: "10 itens mistos para fechar a missão e recalibrar amanhã.",
    duration: 18,
    xp: 240,
    coins: 35,
    discipline: "Misto",
  },
];

export const CRASE_SCENES: ExplanationScene[] = [
  {
    id: "convite",
    kicker: "Cena 01 · o convite",
    title: "A preposição abre a porta.",
    body: "O verbo pede destino: quem vai, vai a algum lugar. Esse primeiro A nasce do verbo.",
    formula: "VOU  →  A",
    note: "Teste rápido: troque por VOLTO DE.",
  },
  {
    id: "anfitria",
    kicker: "Cena 02 · a anfitriã",
    title: "O artigo já estava esperando.",
    body: "A palavra feminina aceita artigo: a escola, a sala, a repartição. Esse é o segundo A.",
    formula: "A  +  ESCOLA",
    note: "Se no masculino aparece AO, existe artigo.",
  },
  {
    id: "fusao",
    kicker: "Cena 03 · a fusão",
    title: "Dois sinais ocupam o mesmo lugar.",
    body: "Preposição A + artigo A. O acento grave marca o encontro; ele não é um enfeite de palavra feminina.",
    formula: "A  +  A  =  À",
    note: "Vou AO fórum → vou À escola.",
  },
  {
    id: "armadilha",
    kicker: "Cena 04 · a armadilha",
    title: "Sem artigo, não existe encontro.",
    body: "Antes de verbo, palavra masculina ou expressão que não admite artigo, um dos convidados falta. Sem dupla, sem crase.",
    formula: "COMEÇOU A ESTUDAR",
    note: "Verbo não usa artigo: nunca 'à estudar'.",
  },
];

export const MEMORY_CARDS = [
  { front: "Vou ___ escola.", back: "À · porque volto DA escola." },
  { front: "Começou ___ revisar.", back: "A · antes de verbo, sem artigo." },
  { front: "Entreguei ___ diretora.", back: "À · entreguei AO diretor." },
  { front: "Fui ___ pé.", back: "A · palavra masculina, sem fusão." },
  { front: "Cheguei ___ uma hora.", back: "À · indicação exata de hora." },
];

export const WEEKLY_SIGNAL = [42, 58, 67, 54, 76, 84, 91];
