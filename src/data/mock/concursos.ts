import type { Cargo, Concurso, EtapaConcurso, UF } from "../types";
import { CIDADES, getCidade } from "./geografia";

/**
 * MOCK — dados simulados de concursos. Não representam editais reais.
 * A camada real (edital completo, banca, pesos, etapas) entra aqui depois.
 */

const hoje = new Date("2026-08-22T00:00:00Z");

function emDias(dias: number) {
  const d = new Date(hoje);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

function hash(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const BANCAS = ["Cebraspe", "FGV", "IBFC", "Vunesp", "Instituto AOCP", "FUNDATEC"];

const disc = (nome: string, questoes: number, peso: number, topicos: string[]) => ({
  id: nome.toLowerCase().replace(/\s+/g, "-"),
  nome,
  questoes,
  peso,
  topicos,
});

const BASE_COMUM = [
  disc("Língua Portuguesa", 15, 1, ["Interpretação", "Crase", "Concordância", "Regência"]),
  disc("Raciocínio Lógico", 10, 1, ["Proposições", "Sequências", "Probabilidade"]),
  disc("Informática", 8, 1, ["Windows", "Pacote Office", "Segurança"]),
];

const LEGISLACAO = [
  disc("Direito Constitucional", 15, 2, ["Direitos fundamentais", "Organização do Estado"]),
  disc("Direito Administrativo", 15, 2, ["Atos administrativos", "Licitações", "Servidores"]),
];

const ETAPAS_ADMIN: EtapaConcurso[] = [
  {
    id: "objetiva",
    tipo: "objetiva",
    titulo: "Prova objetiva",
    descricao: "Questões de múltipla escolha, caráter eliminatório e classificatório.",
    eliminatoria: true,
  },
  {
    id: "titulos",
    tipo: "titulos",
    titulo: "Prova de títulos",
    descricao: "Envio de certificados e cursos para pontuação extra.",
    eliminatoria: false,
  },
  {
    id: "documentacao",
    tipo: "documentacao",
    titulo: "Entrega de documentos",
    descricao: "Conferência de requisitos, escolaridade e nomeação.",
    eliminatoria: true,
  },
];

const ETAPAS_SEGURANCA: EtapaConcurso[] = [
  {
    id: "objetiva",
    tipo: "objetiva",
    titulo: "Prova objetiva",
    descricao: "Conhecimentos básicos e específicos, eliminatória.",
    eliminatoria: true,
  },
  {
    id: "redacao",
    tipo: "redacao",
    titulo: "Prova discursiva / redação",
    descricao: "Texto dissertativo-argumentativo com nota mínima.",
    eliminatoria: true,
  },
  {
    id: "taf",
    tipo: "taf",
    titulo: "Teste de aptidão física",
    descricao: "Corrida, flexões, abdominais e barra conforme índices do edital.",
    eliminatoria: true,
  },
  {
    id: "psicologico",
    tipo: "psicologico",
    titulo: "Avaliação psicológica",
    descricao: "Bateria de testes e perfil profissiográfico.",
    eliminatoria: true,
  },
  {
    id: "medico",
    tipo: "medico",
    titulo: "Exames médicos",
    descricao: "Exames laboratoriais e avaliação clínica.",
    eliminatoria: true,
  },
  {
    id: "investigacao_social",
    tipo: "investigacao_social",
    titulo: "Investigação social",
    descricao: "Análise de conduta, antecedentes e formulários.",
    eliminatoria: true,
  },
  {
    id: "curso_formacao",
    tipo: "curso_formacao",
    titulo: "Curso de formação",
    descricao: "Etapa final remunerada, com frequência mínima.",
    eliminatoria: true,
  },
];

type Molde = {
  slug: string;
  orgao: (local: string) => string;
  apelido: (local: string) => string;
  esfera: Concurso["esfera"];
  cargos: Omit<Cargo, "id">[];
  etapas: EtapaConcurso[];
  offset: number;
};

const MOLDES: Molde[] = [
  {
    slug: "prefeitura",
    orgao: (local) => `Prefeitura Municipal de ${local}`,
    apelido: (local) => `Prefeitura de ${local}`,
    esfera: "municipal",
    offset: 42,
    etapas: ETAPAS_ADMIN,
    cargos: [
      {
        nome: "Agente Administrativo",
        escolaridade: "medio",
        vagas: 24,
        salario: 2890,
        disciplinas: [...BASE_COMUM, ...LEGISLACAO.slice(0, 1)],
      },
      {
        nome: "Auxiliar de Serviços Gerais",
        escolaridade: "fundamental",
        vagas: 40,
        salario: 1680,
        disciplinas: BASE_COMUM.slice(0, 2),
      },
      {
        nome: "Professor de Ensino Fundamental",
        escolaridade: "superior",
        vagas: 18,
        salario: 4120,
        disciplinas: [
          ...BASE_COMUM.slice(0, 1),
          disc("Conhecimentos Pedagógicos", 20, 2, ["LDB", "ECA", "Didática", "BNCC"]),
        ],
      },
    ],
  },
  {
    slug: "guarda",
    orgao: (local) => `Guarda Civil Municipal de ${local}`,
    apelido: (local) => `Guarda Municipal — ${local}`,
    esfera: "municipal",
    offset: 63,
    etapas: ETAPAS_SEGURANCA,
    cargos: [
      {
        nome: "Guarda Civil Municipal",
        escolaridade: "medio",
        vagas: 60,
        salario: 3450,
        disciplinas: [
          ...BASE_COMUM,
          disc("Direitos Humanos", 8, 2, ["Uso da força", "Estatuto do Desarmamento"]),
          ...LEGISLACAO.slice(0, 1),
        ],
      },
    ],
  },
  {
    slug: "saude",
    orgao: (local) => `Secretaria Municipal de Saúde de ${local}`,
    apelido: (local) => `Saúde — ${local}`,
    esfera: "municipal",
    offset: 30,
    etapas: ETAPAS_ADMIN,
    cargos: [
      {
        nome: "Técnico de Enfermagem",
        escolaridade: "tecnico",
        vagas: 32,
        salario: 3120,
        disciplinas: [
          ...BASE_COMUM.slice(0, 1),
          disc("SUS e Saúde Pública", 15, 2, ["Lei 8.080", "Atenção básica", "Vigilância"]),
          disc("Enfermagem", 20, 2, ["Curativos", "Medicação", "Urgência"]),
        ],
      },
      {
        nome: "Agente Comunitário de Saúde",
        escolaridade: "medio",
        vagas: 55,
        salario: 2640,
        disciplinas: [
          ...BASE_COMUM.slice(0, 2),
          disc("SUS e Saúde Pública", 15, 2, ["ESF", "Territorialização"]),
        ],
      },
    ],
  },
];

const ESTADUAIS: Molde[] = [
  {
    slug: "pm",
    orgao: (uf) => `Polícia Militar do Estado (${uf})`,
    apelido: (uf) => `PM ${uf} — Soldado`,
    esfera: "estadual",
    offset: 78,
    etapas: ETAPAS_SEGURANCA,
    cargos: [
      {
        nome: "Soldado PM",
        escolaridade: "medio",
        vagas: 1200,
        salario: 4900,
        disciplinas: [...BASE_COMUM, ...LEGISLACAO],
      },
    ],
  },
  {
    slug: "tj",
    orgao: (uf) => `Tribunal de Justiça (${uf})`,
    apelido: (uf) => `TJ ${uf} — Técnico Judiciário`,
    esfera: "estadual",
    offset: 55,
    etapas: ETAPAS_ADMIN,
    cargos: [
      {
        nome: "Técnico Judiciário",
        escolaridade: "medio",
        vagas: 210,
        salario: 5300,
        disciplinas: [...BASE_COMUM, ...LEGISLACAO],
      },
      {
        nome: "Analista Judiciário",
        escolaridade: "superior",
        vagas: 46,
        salario: 12800,
        disciplinas: [
          ...BASE_COMUM.slice(0, 1),
          ...LEGISLACAO,
          disc("Direito Processual Civil", 15, 3, ["Prazos", "Recursos", "Execução"]),
        ],
      },
    ],
  },
];

const FEDERAIS: Molde[] = [
  {
    slug: "inss",
    orgao: () => "Instituto Nacional do Seguro Social",
    apelido: () => "INSS — Técnico do Seguro Social",
    esfera: "federal",
    offset: 96,
    etapas: ETAPAS_ADMIN,
    cargos: [
      {
        nome: "Técnico do Seguro Social",
        escolaridade: "medio",
        vagas: 1000,
        salario: 5905,
        disciplinas: [
          ...BASE_COMUM,
          ...LEGISLACAO,
          disc("Ética no Serviço Público", 5, 1, ["Código de ética", "Improbidade"]),
        ],
      },
    ],
  },
  {
    slug: "ifs",
    orgao: () => "Instituto Federal de Educação",
    apelido: () => "Institutos Federais — Administrativo",
    esfera: "federal",
    offset: 120,
    etapas: ETAPAS_ADMIN,
    cargos: [
      {
        nome: "Assistente em Administração",
        escolaridade: "medio",
        vagas: 130,
        salario: 3378,
        disciplinas: [...BASE_COMUM, ...LEGISLACAO.slice(1)],
      },
    ],
  },
];

function montar(molde: Molde, local: string, uf: UF, cidadeId: string | null): Concurso {
  const seed = hash(`${molde.slug}-${cidadeId ?? uf}`);
  const id = `${cidadeId ?? uf.toLowerCase()}-${molde.slug}`;
  const dias = molde.offset + (seed % 17);
  return {
    id,
    orgao: molde.orgao(local),
    apelido: molde.apelido(local),
    esfera: molde.esfera,
    uf,
    cidadeId,
    banca: BANCAS[seed % BANCAS.length] ?? "Banca a confirmar",
    statusEdital: seed % 3 === 0 ? "inscricoes_abertas" : seed % 3 === 1 ? "publicado" : "previsto",
    dataProva: emDias(dias),
    inscricoesAte: emDias(Math.max(6, Math.round(dias * 0.35))),
    vagasTotais: molde.cargos.reduce((total, cargo) => total + cargo.vagas, 0),
    cargos: molde.cargos.map((cargo) => ({
      ...cargo,
      id: `${id}-${cargo.nome.toLowerCase().replace(/\s+/g, "-")}`,
    })),
    etapas: molde.etapas,
  };
}

export function getConcursosPorCidade(cidadeId: string): Concurso[] {
  const cidade = getCidade(cidadeId);
  if (!cidade) return [];
  const seed = hash(cidadeId);
  const municipais = MOLDES.filter((_, i) => (seed >> i) % 4 !== 0).map((molde) =>
    montar(molde, cidade.nome, cidade.uf, cidade.id),
  );
  const estaduais = ESTADUAIS.map((molde) => montar(molde, cidade.uf, cidade.uf, null));
  const federais = FEDERAIS.map((molde) => montar(molde, "Brasil", cidade.uf, null));
  return [...municipais, ...estaduais, ...federais];
}

export function getConcurso(cidadeId: string, concursoId: string) {
  return getConcursosPorCidade(cidadeId).find((c) => c.id === concursoId);
}

/**
 * Catálogo demonstrativo nacional. Os concursos estaduais e federais são
 * deduplicados, enquanto cada município mantém suas próprias oportunidades.
 */
export function getCatalogoNacional(): Concurso[] {
  const catalogo = new Map<string, Concurso>();
  CIDADES.forEach((cidade) => {
    getConcursosPorCidade(cidade.id).forEach((concurso) => {
      if (!catalogo.has(concurso.id)) catalogo.set(concurso.id, concurso);
    });
  });
  return [...catalogo.values()];
}

export function getConcursoGlobal(concursoId: string) {
  return getCatalogoNacional().find((concurso) => concurso.id === concursoId);
}

export function getConcursosPorUf(uf: UF) {
  return getCatalogoNacional().filter((concurso) => concurso.uf === uf);
}

export function diasAte(data: string) {
  const alvo = new Date(`${data}T00:00:00Z`).getTime();
  return Math.max(0, Math.round((alvo - hoje.getTime()) / 86_400_000));
}

export function formatarData(data: string) {
  return new Date(`${data}T00:00:00Z`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export const ESFERA_LABEL: Record<Concurso["esfera"], string> = {
  federal: "Federal",
  estadual: "Estadual",
  municipal: "Municipal",
};

export const STATUS_LABEL: Record<Concurso["statusEdital"], string> = {
  publicado: "Edital publicado",
  previsto: "Edital previsto",
  inscricoes_abertas: "Inscrições abertas",
};
