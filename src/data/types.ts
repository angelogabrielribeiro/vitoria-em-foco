/**
 * Tipos de domínio do Vitória em Foco.
 * Esta camada é agnóstica de UI e de fonte de dados: hoje é alimentada por
 * mocks (src/data/mock/*), amanhã por PostgreSQL/Supabase + serviço de IA.
 */

export type UF =
  | "AC"
  | "AL"
  | "AP"
  | "AM"
  | "BA"
  | "CE"
  | "DF"
  | "ES"
  | "GO"
  | "MA"
  | "MT"
  | "MS"
  | "MG"
  | "PA"
  | "PB"
  | "PR"
  | "PE"
  | "PI"
  | "RJ"
  | "RN"
  | "RS"
  | "RO"
  | "RR"
  | "SC"
  | "SP"
  | "SE"
  | "TO";

export interface Estado {
  uf: UF;
  nome: string;
  regiao: "Norte" | "Nordeste" | "Centro-Oeste" | "Sudeste" | "Sul";
}

export interface Cidade {
  id: string;
  nome: string;
  uf: UF;
  capital?: boolean;
}

export type EsferaConcurso = "federal" | "estadual" | "municipal";

export type EtapaTipo =
  | "objetiva"
  | "discursiva"
  | "redacao"
  | "titulos"
  | "taf"
  | "psicologico"
  | "medico"
  | "investigacao_social"
  | "documentacao"
  | "curso_formacao";

export interface EtapaConcurso {
  id: string;
  tipo: EtapaTipo;
  titulo: string;
  descricao: string;
  data?: string;
  eliminatoria: boolean;
}

export interface DisciplinaEdital {
  id: string;
  nome: string;
  questoes: number;
  peso: number;
  topicos: string[];
}

export interface Cargo {
  id: string;
  nome: string;
  escolaridade: "fundamental" | "medio" | "tecnico" | "superior";
  vagas: number;
  salario: number;
  disciplinas: DisciplinaEdital[];
}

export interface Concurso {
  id: string;
  orgao: string;
  apelido: string;
  esfera: EsferaConcurso;
  uf: UF;
  cidadeId: string | null;
  banca: string;
  statusEdital: "publicado" | "previsto" | "inscricoes_abertas";
  dataProva: string;
  vagasTotais: number;
  inscricoesAte?: string;
  cargos: Cargo[];
  etapas: EtapaConcurso[];
}

export type BlocoDia = "manha" | "almoco" | "transporte" | "noite";

export interface DisponibilidadeBloco {
  bloco: BlocoDia;
  ativo: boolean;
  minutos: number;
}

export interface Alternativa {
  letra: "A" | "B" | "C" | "D";
  texto: string;
}

export interface Questao {
  id: string;
  disciplina: string;
  topico: string;
  nivel: "facil" | "media" | "dificil";
  enunciado: string;
  alternativas: Alternativa[];
  correta: "A" | "B" | "C" | "D";
  explicacao: string;
  memoria?: string;
}

export interface DiaPlano {
  dia: number;
  titulo: string;
  foco: string;
  disciplinas: string[];
  minutos: number;
  tipo: "aula" | "revisao" | "simulado" | "desafio" | "descanso";
  bloqueado: boolean;
  xp: number;
}

export interface Conquista {
  id: string;
  nome: string;
  descricao: string;
  icone: "flame" | "target" | "trophy" | "zap" | "shield" | "brain";
  desbloqueada: boolean;
}
