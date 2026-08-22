import type { Cidade, Estado, UF } from "../types";

/** Mock: 27 unidades federativas reais + amostra de municípios por UF. */
export const ESTADOS: Estado[] = [
  { uf: "AC", nome: "Acre", regiao: "Norte" },
  { uf: "AL", nome: "Alagoas", regiao: "Nordeste" },
  { uf: "AP", nome: "Amapá", regiao: "Norte" },
  { uf: "AM", nome: "Amazonas", regiao: "Norte" },
  { uf: "BA", nome: "Bahia", regiao: "Nordeste" },
  { uf: "CE", nome: "Ceará", regiao: "Nordeste" },
  { uf: "DF", nome: "Distrito Federal", regiao: "Centro-Oeste" },
  { uf: "ES", nome: "Espírito Santo", regiao: "Sudeste" },
  { uf: "GO", nome: "Goiás", regiao: "Centro-Oeste" },
  { uf: "MA", nome: "Maranhão", regiao: "Nordeste" },
  { uf: "MT", nome: "Mato Grosso", regiao: "Centro-Oeste" },
  { uf: "MS", nome: "Mato Grosso do Sul", regiao: "Centro-Oeste" },
  { uf: "MG", nome: "Minas Gerais", regiao: "Sudeste" },
  { uf: "PA", nome: "Pará", regiao: "Norte" },
  { uf: "PB", nome: "Paraíba", regiao: "Nordeste" },
  { uf: "PR", nome: "Paraná", regiao: "Sul" },
  { uf: "PE", nome: "Pernambuco", regiao: "Nordeste" },
  { uf: "PI", nome: "Piauí", regiao: "Nordeste" },
  { uf: "RJ", nome: "Rio de Janeiro", regiao: "Sudeste" },
  { uf: "RN", nome: "Rio Grande do Norte", regiao: "Nordeste" },
  { uf: "RS", nome: "Rio Grande do Sul", regiao: "Sul" },
  { uf: "RO", nome: "Rondônia", regiao: "Norte" },
  { uf: "RR", nome: "Roraima", regiao: "Norte" },
  { uf: "SC", nome: "Santa Catarina", regiao: "Sul" },
  { uf: "SP", nome: "São Paulo", regiao: "Sudeste" },
  { uf: "SE", nome: "Sergipe", regiao: "Nordeste" },
  { uf: "TO", nome: "Tocantins", regiao: "Norte" },
];

const MUNICIPIOS: Record<UF, string[]> = {
  AC: ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira", "Feijó"],
  AL: ["Maceió", "Arapiraca", "Palmeira dos Índios", "Penedo"],
  AP: ["Macapá", "Santana", "Laranjal do Jari", "Oiapoque"],
  AM: ["Manaus", "Parintins", "Itacoatiara", "Manacapuru"],
  BA: ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Juazeiro"],
  CE: ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Sobral", "Maracanaú"],
  DF: ["Brasília", "Ceilândia", "Taguatinga", "Gama"],
  ES: ["Vitória", "Vila Velha", "Serra", "Cariacica", "Linhares"],
  GO: ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde"],
  MA: ["São Luís", "Imperatriz", "Timon", "Caxias"],
  MT: ["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop"],
  MS: ["Campo Grande", "Dourados", "Três Lagoas", "Corumbá"],
  MG: ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim", "Montes Claros"],
  PA: ["Belém", "Ananindeua", "Santarém", "Marabá"],
  PB: ["João Pessoa", "Campina Grande", "Santa Rita", "Patos"],
  PR: ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel"],
  PE: ["Recife", "Jaboatão dos Guararapes", "Olinda", "Caruaru", "Petrolina"],
  PI: ["Teresina", "Parnaíba", "Picos", "Floriano"],
  RJ: ["Rio de Janeiro", "Niterói", "São Gonçalo", "Duque de Caxias", "Campos dos Goytacazes"],
  RN: ["Natal", "Mossoró", "Parnamirim", "Caicó"],
  RS: ["Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas", "Santa Maria"],
  RO: ["Porto Velho", "Ji-Paraná", "Ariquemes", "Vilhena"],
  RR: ["Boa Vista", "Rorainópolis", "Caracaraí", "Mucajaí"],
  SC: ["Florianópolis", "Joinville", "Blumenau", "Chapecó", "Criciúma"],
  SP: ["São Paulo", "Campinas", "Guarulhos", "Santos", "Ribeirão Preto", "São José dos Campos"],
  SE: ["Aracaju", "Nossa Senhora do Socorro", "Lagarto", "Itabaiana"],
  TO: ["Palmas", "Araguaína", "Gurupi", "Porto Nacional"],
};

const slug = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const CIDADES: Cidade[] = ESTADOS.flatMap((estado) =>
  MUNICIPIOS[estado.uf].map((nome, index) => ({
    id: `${estado.uf.toLowerCase()}-${slug(nome)}`,
    nome,
    uf: estado.uf,
    capital: index === 0,
  })),
);

export function getEstado(uf: string) {
  return ESTADOS.find((e) => e.uf === uf);
}

export function getCidadesPorUf(uf: string) {
  return CIDADES.filter((c) => c.uf === uf);
}

export function getCidade(id: string) {
  return CIDADES.find((c) => c.id === id);
}
