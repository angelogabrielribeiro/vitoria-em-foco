import type { Questao } from "../types";

/** MOCK — banco de questões simulado para o diagnóstico e treinos. */
export const QUESTOES: Questao[] = [
  {
    id: "q1",
    disciplina: "Língua Portuguesa",
    topico: "Crase",
    nivel: "facil",
    enunciado:
      "Assinale a alternativa em que o uso da crase está correto conforme a norma-padrão.",
    alternativas: [
      { letra: "A", texto: "Entreguei o processo à secretaria do órgão." },
      { letra: "B", texto: "Fui à pé até a sala de provas." },
      { letra: "C", texto: "Começou à estudar cedo." },
      { letra: "D", texto: "Refiro-me à todos os candidatos." },
    ],
    correta: "A",
    explicacao:
      "Crase só ocorre com a preposição 'a' + artigo 'a'. 'À secretaria' tem artigo feminino. 'Pé', verbo no infinitivo e 'todos' não admitem artigo feminino.",
    memoria: "Regra do bolso: se der para trocar por 'ao', a crase existe.",
  },
  {
    id: "q2",
    disciplina: "Direito Constitucional",
    topico: "Direitos fundamentais",
    nivel: "media",
    enunciado:
      "Sobre os direitos e garantias fundamentais na Constituição de 1988, é correto afirmar que:",
    alternativas: [
      { letra: "A", texto: "São absolutos e nunca podem ser relativizados." },
      { letra: "B", texto: "Aplicam-se somente a brasileiros natos." },
      {
        letra: "C",
        texto: "Têm aplicação imediata, admitindo limites diante de outros direitos.",
      },
      { letra: "D", texto: "Dependem sempre de lei complementar para produzir efeitos." },
    ],
    correta: "C",
    explicacao:
      "O art. 5º, §1º garante aplicação imediata. Nenhum direito é absoluto: colisões se resolvem por ponderação.",
    memoria: "Direito fundamental é força, não muralha: vale já, mas cede quando bate em outro.",
  },
  {
    id: "q3",
    disciplina: "Raciocínio Lógico",
    topico: "Proposições",
    nivel: "media",
    enunciado: "A negação de 'Todos os aprovados estudaram' é:",
    alternativas: [
      { letra: "A", texto: "Nenhum aprovado estudou." },
      { letra: "B", texto: "Pelo menos um aprovado não estudou." },
      { letra: "C", texto: "Todos os aprovados não estudaram." },
      { letra: "D", texto: "Alguns que estudaram foram aprovados." },
    ],
    correta: "B",
    explicacao:
      "A negação de um 'todo' é um 'existe pelo menos um que não'. Não vira o oposto radical.",
    memoria: "Para derrubar um 'todos', basta um traidor.",
  },
  {
    id: "q4",
    disciplina: "Direito Administrativo",
    topico: "Atos administrativos",
    nivel: "media",
    enunciado: "São atributos do ato administrativo:",
    alternativas: [
      { letra: "A", texto: "Presunção de legitimidade, imperatividade e autoexecutoriedade." },
      { letra: "B", texto: "Onerosidade, bilateralidade e comutatividade." },
      { letra: "C", texto: "Publicidade, anterioridade e anualidade." },
      { letra: "D", texto: "Continuidade, alternância e temporalidade." },
    ],
    correta: "A",
    explicacao:
      "Os atributos clássicos são presunção de legitimidade, imperatividade, autoexecutoriedade e tipicidade.",
    memoria: "PIA-T: Presunção, Imperatividade, Autoexecutoriedade, Tipicidade.",
  },
  {
    id: "q5",
    disciplina: "Informática",
    topico: "Segurança",
    nivel: "facil",
    enunciado: "O golpe que usa mensagens falsas para capturar dados pessoais é chamado de:",
    alternativas: [
      { letra: "A", texto: "Backup incremental" },
      { letra: "B", texto: "Phishing" },
      { letra: "C", texto: "Firewall" },
      { letra: "D", texto: "Cache" },
    ],
    correta: "B",
    explicacao: "Phishing é a 'pescaria' de dados: isca falsa, vítima entrega a informação.",
    memoria: "Phishing = fishing. O criminoso joga a isca, você é o peixe.",
  },
  {
    id: "q6",
    disciplina: "Língua Portuguesa",
    topico: "Concordância",
    nivel: "media",
    enunciado: "Assinale a frase correta quanto à concordância verbal.",
    alternativas: [
      { letra: "A", texto: "Fazem dois anos que estudo para concursos." },
      { letra: "B", texto: "Houveram muitos candidatos na prova." },
      { letra: "C", texto: "Faz dois anos que estudo para concursos." },
      { letra: "D", texto: "Existe muitas vagas no edital." },
    ],
    correta: "C",
    explicacao:
      "'Fazer' indicando tempo é impessoal: fica no singular. 'Haver' de existência também. 'Existir' concorda com o sujeito.",
    memoria: "Tempo que passa não tem plural: FAZ dois anos.",
  },
  {
    id: "q7",
    disciplina: "Direito Constitucional",
    topico: "Organização do Estado",
    nivel: "dificil",
    enunciado: "Compete privativamente à União legislar sobre:",
    alternativas: [
      { letra: "A", texto: "Proteção ao patrimônio histórico local" },
      { letra: "B", texto: "Direito penal e processual" },
      { letra: "C", texto: "Proteção do meio ambiente" },
      { letra: "D", texto: "Educação, cultura e ensino" },
    ],
    correta: "B",
    explicacao:
      "Art. 22: direito civil, penal, processual e eleitoral é privativo da União. As demais alternativas são competência concorrente ou comum.",
    memoria: "CAPACETE DE PMs: Civil, Agrário, Penal, Aeronáutico, Comercial, Eleitoral, Trabalho...",
  },
  {
    id: "q8",
    disciplina: "Raciocínio Lógico",
    topico: "Probabilidade",
    nivel: "media",
    enunciado:
      "Em uma urna há 3 bolas verdes e 2 amarelas. Retirando uma bola, a probabilidade de ser verde é:",
    alternativas: [
      { letra: "A", texto: "2/5" },
      { letra: "B", texto: "1/2" },
      { letra: "C", texto: "3/5" },
      { letra: "D", texto: "2/3" },
    ],
    correta: "C",
    explicacao: "Casos favoráveis sobre casos totais: 3 verdes em 5 bolas = 3/5 (60%).",
    memoria: "Probabilidade é fração: o que eu quero em cima, o mundo todo embaixo.",
  },
  {
    id: "q9",
    disciplina: "Direito Administrativo",
    topico: "Servidores",
    nivel: "media",
    enunciado: "A estabilidade do servidor público efetivo é adquirida:",
    alternativas: [
      { letra: "A", texto: "Na posse" },
      { letra: "B", texto: "Após 3 anos de efetivo exercício e avaliação de desempenho" },
      { letra: "C", texto: "Após 2 anos de exercício" },
      { letra: "D", texto: "Após aprovação no concurso" },
    ],
    correta: "B",
    explicacao:
      "Art. 41 da CF: três anos de efetivo exercício, com avaliação especial de desempenho.",
    memoria: "3 anos = 3 letras de FIM do estágio probatório.",
  },
  {
    id: "q10",
    disciplina: "Ética no Serviço Público",
    topico: "Improbidade",
    nivel: "facil",
    enunciado: "Constitui ato de improbidade administrativa que causa enriquecimento ilícito:",
    alternativas: [
      { letra: "A", texto: "Receber vantagem econômica indevida em razão do cargo" },
      { letra: "B", texto: "Atrasar a entrega de um relatório interno" },
      { letra: "C", texto: "Discordar publicamente da chefia" },
      { letra: "D", texto: "Solicitar férias fora do período" },
    ],
    correta: "A",
    explicacao:
      "Enriquecimento ilícito exige vantagem patrimonial indevida ligada ao exercício do cargo, com dolo.",
    memoria: "Se o bolso do servidor cresce sem explicação, o nome é enriquecimento ilícito.",
  },
];

export const DIAGNOSTICO = QUESTOES;

export function getQuestao(id: string) {
  return QUESTOES.find((q) => q.id === id);
}
