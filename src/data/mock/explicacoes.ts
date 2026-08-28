import type { Alternativa, Questao } from "../types";

export interface ExplicacaoDidatica {
  objetivo: string;
  passos: string[];
  pegadinha: string;
  alternativas: Partial<Record<Alternativa["letra"], string>>;
  exemplo: string;
  microDesafio: { pergunta: string; resposta: string };
  fundamento?: string;
}

const EXPLICACOES: Record<string, ExplicacaoDidatica> = {
  q1: {
    objetivo: "Descobrir se o primeiro ‘a’ é preposição e o segundo é artigo feminino.",
    passos: [
      "O verbo ‘entregar’ pede a preposição a: quem entrega, entrega algo a alguém.",
      "‘Secretaria’ aceita artigo feminino: a secretaria.",
      "A soma a + a vira à. O teste ‘ao setor’ confirma a fusão.",
    ],
    pegadinha:
      "A banca espalha acento grave antes de verbo, palavra masculina e pronome no plural.",
    alternativas: {
      A: "Correta: a preposição exigida pelo verbo encontra o artigo de ‘secretaria’.",
      B: "‘Pé’ é masculino. A expressão correta é ‘a pé’, sem crase.",
      C: "Antes de verbo no infinitivo não há artigo: ‘começou a estudar’.",
      D: "‘Todos’ não admite artigo feminino singular: ‘refiro-me a todos’.",
    },
    exemplo:
      "Entreguei ao setor → entreguei à secretaria. Se ‘ao’ funciona, a crase aparece no feminino.",
    microDesafio: {
      pergunta: "Vou __ biblioteca depois da aula.",
      resposta: "à — porque ‘vou ao arquivo’ também funciona.",
    },
    fundamento: "Regência verbal + emprego do artigo definido.",
  },
  q2: {
    objetivo: "Separar aplicação imediata de caráter absoluto.",
    passos: [
      "A Constituição manda aplicar os direitos fundamentais imediatamente.",
      "Aplicação imediata não significa que um direito vence qualquer conflito.",
      "Quando direitos colidem, o caso concreto exige proporcionalidade e ponderação.",
    ],
    pegadinha:
      "Trocar ‘aplicação imediata’ por ‘efeito ilimitado’ ou exigir sempre uma lei complementar.",
    alternativas: {
      A: "Errada: direitos fundamentais podem sofrer limites constitucionais e colidir entre si.",
      B: "Errada: a proteção não se restringe aos brasileiros natos.",
      C: "Correta: aplicação imediata e possibilidade de limites convivem.",
      D: "Errada: nem todo direito depende de lei complementar para produzir efeitos.",
    },
    exemplo:
      "Liberdade de expressão é protegida, mas não autoriza ameaça ou violação da honra sem consequência.",
    microDesafio: {
      pergunta: "Aplicação imediata torna um direito absoluto?",
      resposta: "Não. Ele vale desde já, mas pode ser ponderado.",
    },
    fundamento: "Constituição Federal, art. 5º, §1º.",
  },
  q3: {
    objetivo: "Negar um quantificador universal sem exagerar a conclusão.",
    passos: [
      "A frase original afirma que cada aprovado estudou.",
      "Para derrubá-la, basta encontrar um único aprovado que não estudou.",
      "Por isso ‘todos’ vira ‘pelo menos um não’.",
    ],
    pegadinha: "Transformar a negação em extremo oposto: ‘ninguém estudou’.",
    alternativas: {
      A: "Forte demais: diz que zero aprovados estudaram.",
      B: "Correta: um contraexemplo já torna falso o ‘todos’.",
      C: "Também é extrema; equivale a dizer que nenhum aprovado estudou.",
      D: "Muda a relação e não nega a proposição apresentada.",
    },
    exemplo: "Negar ‘todos chegaram cedo’ é dizer ‘alguém não chegou cedo’.",
    microDesafio: {
      pergunta: "Negue: ‘Todo edital tem prova objetiva’.",
      resposta: "Pelo menos um edital não tem prova objetiva.",
    },
    fundamento: "Negação de proposições quantificadas.",
  },
  q4: {
    objetivo: "Reconhecer o conjunto clássico de atributos do ato administrativo.",
    passos: [
      "Presunção: o ato nasce presumidamente legítimo e verdadeiro.",
      "Imperatividade: pode impor obrigações; autoexecutoriedade: em certos casos, executa sem ordem judicial.",
      "Tipicidade completa o conjunto mais cobrado: o ato deve corresponder a figura prevista.",
    ],
    pegadinha:
      "Misturar atributos de contratos, princípios tributários ou ideias sem relação com o ato.",
    alternativas: {
      A: "Correta: reúne três atributos clássicos do ato administrativo.",
      B: "São características associadas a contratos, não atributos do ato.",
      C: "Publicidade é princípio; anterioridade e anualidade aparecem em outros ramos.",
      D: "O conjunto não corresponde à teoria dos atos administrativos.",
    },
    exemplo:
      "Uma multa presume-se legítima; a Administração pode exigi-la, mas o cidadão ainda pode contestar.",
    microDesafio: {
      pergunta: "Qual letra ajuda a lembrar os quatro atributos?",
      resposta: "PIA-T: Presunção, Imperatividade, Autoexecutoriedade e Tipicidade.",
    },
    fundamento: "Teoria geral dos atos administrativos.",
  },
  q5: {
    objetivo: "Identificar engenharia social disfarçada de comunicação legítima.",
    passos: [
      "O criminoso cria uma isca: mensagem, site ou aviso falso.",
      "A vítima é pressionada a clicar, informar senha ou entregar dados.",
      "Essa captura por engano é phishing; firewall e backup são mecanismos defensivos.",
    ],
    pegadinha: "Colocar ferramentas reais de informática ao lado do nome do ataque.",
    alternativas: {
      A: "Backup incremental guarda apenas alterações; não é golpe.",
      B: "Correta: phishing usa isca falsa para capturar informações.",
      C: "Firewall controla tráfego de rede e ajuda na proteção.",
      D: "Cache guarda dados temporários para acelerar acesso.",
    },
    exemplo: "‘Sua conta será bloqueada em 5 minutos: clique aqui’ é uma isca típica.",
    microDesafio: {
      pergunta: "Qual é o primeiro sinal de alerta?",
      resposta: "Urgência artificial acompanhada de pedido de dados ou clique.",
    },
    fundamento: "Segurança da informação e engenharia social.",
  },
  q6: {
    objetivo: "Distinguir verbos impessoais de verbos que concordam com o sujeito.",
    passos: [
      "‘Fazer’ indicando tempo decorrido não possui sujeito e fica no singular.",
      "‘Haver’ no sentido de existir também é impessoal: ‘houve candidatos’.",
      "‘Existir’ é pessoal e concorda: ‘existem muitas vagas’.",
    ],
    pegadinha:
      "Concordar o verbo com a palavra plural que aparece depois, sem checar se ele é impessoal.",
    alternativas: {
      A: "Errada: tempo decorrido pede ‘faz’, no singular.",
      B: "Errada: ‘haver’ com sentido de existir fica no singular: ‘houve’.",
      C: "Correta: ‘faz dois anos’ é construção impessoal.",
      D: "Errada: ‘vagas’ é sujeito; o correto é ‘existem muitas vagas’.",
    },
    exemplo: "Faz três meses, houve mudanças e existem novas regras.",
    microDesafio: {
      pergunta: "Complete: ___ muitas dúvidas ontem.",
      resposta: "Houve — haver no sentido de existir é impessoal.",
    },
    fundamento: "Concordância verbal e verbos impessoais.",
  },
  q7: {
    objetivo: "Reconhecer as matérias legislativas privativas da União.",
    passos: [
      "O art. 22 concentra ramos jurídicos estruturais na União.",
      "Direito civil, penal, processual, eleitoral e do trabalho aparecem no núcleo da lista.",
      "Meio ambiente, educação e patrimônio envolvem competências comuns ou concorrentes.",
    ],
    pegadinha:
      "Usar temas importantes nacionalmente que, apesar disso, são compartilhados entre entes.",
    alternativas: {
      A: "Proteção do patrimônio local envolve atuação municipal e competência comum.",
      B: "Correta: direito penal e processual estão no art. 22.",
      C: "Proteção ambiental aparece como competência comum e matéria concorrente.",
      D: "Educação e cultura não são exclusividade legislativa da União.",
    },
    exemplo:
      "A União legisla sobre direito penal; estados não podem criar um novo crime por lei estadual.",
    microDesafio: {
      pergunta: "Direito eleitoral entra na mesma lista?",
      resposta: "Sim, é matéria legislativa privativa da União.",
    },
    fundamento: "Constituição Federal, art. 22.",
  },
  q8: {
    objetivo: "Montar a fração casos favoráveis ÷ total de casos possíveis.",
    passos: [
      "Conte o que interessa: há 3 bolas verdes.",
      "Conte o universo: 3 verdes + 2 amarelas = 5 bolas.",
      "A probabilidade é 3/5, equivalente a 60%.",
    ],
    pegadinha: "Inverter a fração ou dividir pelo número de cores em vez do total de objetos.",
    alternativas: {
      A: "Conta as amarelas, não o evento pedido.",
      B: "Seria correto apenas se metade das bolas fosse verde.",
      C: "Correta: 3 resultados favoráveis em 5 possíveis.",
      D: "Usa uma relação que não corresponde ao total da urna.",
    },
    exemplo: "Em 10 cartões, 4 premiados: chance de prêmio = 4/10 = 40%.",
    microDesafio: {
      pergunta: "2 azuis em 8 bolas representam qual chance?",
      resposta: "2/8 = 1/4 = 25%.",
    },
    fundamento: "Probabilidade clássica em espaço equiprovável.",
  },
  q9: {
    objetivo: "Diferenciar aprovação, posse, exercício e aquisição de estabilidade.",
    passos: [
      "A aprovação habilita o candidato; a posse investe no cargo.",
      "A estabilidade exige três anos de efetivo exercício.",
      "Também depende de avaliação especial de desempenho por comissão.",
    ],
    pegadinha: "Antecipar a estabilidade para o momento da aprovação ou da posse.",
    alternativas: {
      A: "Posse inicia o vínculo, mas não concede estabilidade.",
      B: "Correta: reúne prazo constitucional e avaliação de desempenho.",
      C: "Dois anos era referência antiga; a Constituição passou a exigir três.",
      D: "Aprovação no concurso não equivale a estabilidade no cargo.",
    },
    exemplo:
      "O servidor toma posse hoje, entra em exercício e completa o requisito após três anos avaliados.",
    microDesafio: {
      pergunta: "Só o tempo basta?",
      resposta: "Não. Há também avaliação especial de desempenho.",
    },
    fundamento: "Constituição Federal, art. 41.",
  },
  q10: {
    objetivo: "Reconhecer vantagem patrimonial indevida ligada ao cargo público.",
    passos: [
      "Procure um ganho econômico que o agente não deveria receber.",
      "Verifique a ligação entre a vantagem e o exercício da função.",
      "Na disciplina atual da improbidade, a conduta exige dolo.",
    ],
    pegadinha:
      "Confundir irregularidade administrativa ou conflito profissional com enriquecimento ilícito.",
    alternativas: {
      A: "Correta: vantagem econômica indevida em razão do cargo é o núcleo da conduta.",
      B: "Atraso pode gerar responsabilidade, mas não prova enriquecimento ilícito.",
      C: "Discordância da chefia não cria vantagem patrimonial indevida.",
      D: "Pedido de férias fora do período não representa ganho ilícito ligado ao cargo.",
    },
    exemplo:
      "Receber pagamento de particular para praticar ato funcional cria vantagem indevida ligada ao cargo.",
    microDesafio: {
      pergunta: "Toda falha do servidor é improbidade?",
      resposta: "Não. É preciso enquadramento legal e, hoje, dolo.",
    },
    fundamento: "Lei de Improbidade Administrativa.",
  },
};

export function getExplicacaoDidatica(question: Questao): ExplicacaoDidatica {
  return (
    EXPLICACOES[question.id] ?? {
      objetivo: question.explicacao,
      passos: [question.explicacao, question.memoria ?? "Converta a regra em uma frase curta."],
      pegadinha: "Leia cada alternativa testando a regra central, não apenas a aparência da frase.",
      alternativas: {},
      exemplo: question.memoria ?? question.explicacao,
      microDesafio: {
        pergunta: `Qual é a ideia central de ${question.topico}?`,
        resposta: question.memoria ?? question.explicacao,
      },
    }
  );
}
