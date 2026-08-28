import { lazy, Suspense, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Award,
  BookMarked,
  Brain,
  CalendarClock,
  Check,
  ChevronRight,
  CircleDot,
  Clock3,
  Coins,
  Crown,
  Dumbbell,
  FileCheck2,
  FileText,
  Flame,
  GraduationCap,
  HeartPulse,
  ListChecks,
  LockKeyhole,
  MapPin,
  Medal,
  Navigation,
  Palette,
  Play,
  Radio,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  UserCheck,
  Volume2,
  WandSparkles,
  Zap,
} from "lucide-react";

import type { EtapaTipo } from "@/data/types";
import { CIDADES } from "@/data/mock/geografia";
import { diasAte, getCatalogoNacional, getConcurso } from "@/data/mock/concursos";
import { TODAY_PLAYLIST, WEEKLY_SIGNAL } from "@/data/mock/content";
import { journey, useJourney, xpNoNivel } from "@/lib/journey";
import { cn } from "@/lib/utils";
import { AppShell, EmptyTarget } from "./CarnivalShell";
import type { ExperienceScreen } from "./experience";
import { LivingShader } from "./LivingShader";
import { soundEngine } from "./sound-engine";

const ApprovalPathScene = lazy(() => import("./ApprovalPathScene"));

const REWARDS = [
  {
    id: "theme-cartografia",
    icon: Palette,
    name: "Tema Cartografia Solar",
    cost: 80,
    type: "tema",
  },
  { id: "sound-vitoria", icon: Volume2, name: "Acorde de Vitória", cost: 55, type: "som" },
  { id: "badge-fundador", icon: Crown, name: "Emblema Desbravador", cost: 120, type: "emblema" },
];

export function CommandCenter({ go }: { go: (screen: ExperienceScreen) => void }) {
  const state = useJourney();
  const progress = xpNoNivel(state.xp);
  const contest =
    state.cidadeId && state.concursoId ? getConcurso(state.cidadeId, state.concursoId) : undefined;
  const suggestions = useMemo(() => getCatalogoNacional().slice(12, 18), []);
  const completed = TODAY_PLAYLIST.filter((activity) =>
    state.atividadesConcluidas.includes(activity.id),
  );
  const nextActivity =
    TODAY_PLAYLIST.find((activity) => !state.atividadesConcluidas.includes(activity.id)) ??
    TODAY_PLAYLIST[0]!;
  const [marketMessage, setMarketMessage] = useState<string | null>(null);

  return (
    <AppShell current="dashboard" go={go} fullBleed>
      <div className="command-dashboard">
        {!contest ? <EmptyTarget go={go} /> : null}

        <section className="mission-stage">
          <LivingShader energy={0.96} />
          <div className="mission-stage__3d" aria-hidden="true">
            <Suspense fallback={null}>
              <ApprovalPathScene />
            </Suspense>
          </div>
          <div className="mission-stage__edition">
            CENTRAL / DIA {String(Math.max(1, state.sequencia)).padStart(2, "0")} <i />
          </div>
          <div className="mission-stage__copy">
            <span>
              <Radio /> PRÓXIMA MISSÃO TRANSMITINDO
            </span>
            <h1>{nextActivity.title}</h1>
            <p>{nextActivity.description}</p>
            <button type="button" onClick={() => go("study")}>
              <Play fill="currentColor" /> entrar na missão <ArrowRight />
            </button>
          </div>
          <div className="mission-stage__orbit-stats">
            <span className="orbit-stat orbit-stat--one">
              <Clock3 />
              <b>{nextActivity.duration}</b>
              <small>MIN</small>
            </span>
            <span className="orbit-stat orbit-stat--two">
              <Zap />
              <b>+{nextActivity.xp}</b>
              <small>XP</small>
            </span>
            <span className="orbit-stat orbit-stat--three">
              <Target />
              <b>
                {completed.length}/{TODAY_PLAYLIST.length}
              </b>
              <small>MISSÃO</small>
            </span>
          </div>
          <div className="mission-stage__footer">
            <div>
              <span>RITMO DE HOJE</span>
              <i>
                <b style={{ width: `${(completed.length / TODAY_PLAYLIST.length) * 100}%` }} />
              </i>
              <strong>
                {completed.reduce((sum, item) => sum + item.duration, 0)} /{" "}
                {TODAY_PLAYLIST.reduce((sum, item) => sum + item.duration, 0)} min
              </strong>
            </div>
            <button type="button" onClick={() => go("schedule")}>
              <CalendarClock /> ajustar missão
            </button>
          </div>
        </section>

        <section className="edge-metrics">
          <div>
            <span>ALVO</span>
            <strong>{contest?.apelido ?? "não definido"}</strong>
            <small>
              <MapPin /> {contest ? contest.uf : "Brasil"}
            </small>
          </div>
          <div>
            <span>PROVA EM</span>
            <strong>
              {contest ? diasAte(contest.dataProva) : 82}
              <em> dias</em>
            </strong>
            <small>
              <Target /> contagem ativa
            </small>
          </div>
          <div>
            <span>NÍVEL {state.nivel}</span>
            <strong>
              {progress.pct}
              <em>%</em>
            </strong>
            <small>
              <Zap /> {progress.total - progress.atual} XP para subir
            </small>
          </div>
          <div>
            <span>FOCO ACUMULADO</span>
            <strong>
              {Math.round(state.xp / 7 + 96)}
              <em> min</em>
            </strong>
            <small>
              <Activity /> nesta temporada
            </small>
          </div>
        </section>

        <section className="today-track">
          <header>
            <div>
              <span>ROTEIRO DE HOJE / {TODAY_PLAYLIST.length} ATOS</span>
              <h2>Uma missão, várias formas de aprender.</h2>
            </div>
            <button type="button" onClick={() => go("study")}>
              abrir sala completa <ArrowRight />
            </button>
          </header>
          <div className="today-track__rail">
            {TODAY_PLAYLIST.map((activity, index) => {
              const done = state.atividadesConcluidas.includes(activity.id);
              return (
                <button
                  type="button"
                  key={activity.id}
                  className={cn(
                    done && "is-complete",
                    activity.id === nextActivity.id && "is-next",
                  )}
                  onClick={() => go("study")}
                >
                  <span>{done ? <Check /> : String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <small>{activity.eyebrow}</small>
                    <strong>{activity.title}</strong>
                    <p>
                      {activity.duration} min · +{activity.xp} XP · +{activity.coins} moedas
                    </p>
                  </div>
                  <i />
                </button>
              );
            })}
          </div>
        </section>

        <section className="dashboard-split">
          <div className="performance-signal">
            <header>
              <div>
                <span>SINAL DE DOMÍNIO / 7 DIAS</span>
                <h2>Seu conhecimento está ganhando forma.</h2>
              </div>
              <Brain />
            </header>
            <div className="signal-chart">
              {WEEKLY_SIGNAL.map((value, index) => (
                <motion.span
                  key={index}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${value}%` }}
                  viewport={{ once: true }}
                >
                  <i />
                  <small>{["S", "T", "Q", "Q", "S", "S", "D"][index]}</small>
                  <b>{value}</b>
                </motion.span>
              ))}
            </div>
            <div className="discipline-signals">
              {["Português", "Direito Administrativo", "Raciocínio Lógico", "Constitucional"].map(
                (name, index) => (
                  <div key={name}>
                    <span>{name}</span>
                    <i>
                      <b style={{ width: `${[78, 61, 48, 69][index]}%` }} />
                    </i>
                    <strong>{[78, 61, 48, 69][index]}%</strong>
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="stage-console">
            <header>
              <div>
                <span>MAPA DE ETAPAS</span>
                <h2>A prova é só o primeiro portal.</h2>
              </div>
              <button type="button" onClick={() => go("contest")}>
                <ArrowRight />
              </button>
            </header>
            <div>
              {(
                contest?.etapas ?? [
                  {
                    id: "objetiva",
                    tipo: "objetiva" as const,
                    titulo: "Prova objetiva",
                    descricao: "Conteúdo e estratégia",
                    eliminatoria: true,
                  },
                  {
                    id: "redacao",
                    tipo: "redacao" as const,
                    titulo: "Redação",
                    descricao: "Estrutura e repertório",
                    eliminatoria: true,
                  },
                  {
                    id: "taf",
                    tipo: "taf" as const,
                    titulo: "TAF",
                    descricao: "Preparação progressiva",
                    eliminatoria: true,
                  },
                  {
                    id: "documentacao",
                    tipo: "documentacao" as const,
                    titulo: "Documentos",
                    descricao: "Checklist de posse",
                    eliminatoria: true,
                  },
                ]
              ).map((stage, index) => {
                const Icon = stageIcon(stage.tipo);
                return (
                  <button
                    type="button"
                    key={stage.id}
                    onClick={() => go("contest")}
                    className={index === 0 ? "is-current" : undefined}
                  >
                    <span>{index === 0 ? <CircleDot /> : <Icon />}</span>
                    <div>
                      <small>
                        {index === 0 ? "EM PREPARAÇÃO" : index === 1 ? "PRÓXIMA" : "MAPEADA"}
                      </small>
                      <strong>{stage.titulo}</strong>
                      <p>{stage.descricao}</p>
                    </div>
                    <em>{index === 0 ? "64%" : "0%"}</em>
                    <ChevronRight />
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="reward-market">
          <header>
            <div>
              <span>COFRE DE RECOMPENSAS</span>
              <h2>Constância também muda o mundo ao redor.</h2>
              <p>Moedas de Foco vêm de missões e marcos — nunca de cliques repetidos.</p>
            </div>
            <strong>
              <Coins /> {state.coins}
            </strong>
          </header>
          {marketMessage ? (
            <motion.p
              className="market-message"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {marketMessage}
            </motion.p>
          ) : null}
          <div>
            {REWARDS.map((reward, index) => {
              const owned = state.itensResgatados.includes(reward.id);
              const canBuy = state.coins >= reward.cost;
              return (
                <article
                  key={reward.id}
                  className={cn(owned && "is-owned", `reward-card--${index + 1}`)}
                  title={
                    owned
                      ? `${reward.name} já faz parte da sua coleção.`
                      : canBuy
                        ? `Resgatar ${reward.name} por ${reward.cost} moedas.`
                        : `Faltam ${reward.cost - state.coins} moedas para liberar ${reward.name}.`
                  }
                >
                  <span>
                    <reward.icon />
                  </span>
                  <small>{reward.type}</small>
                  <h3>{reward.name}</h3>
                  <button
                    type="button"
                    disabled={owned || !canBuy}
                    onClick={() => {
                      const bought = journey.resgatarItem(reward.id, reward.cost);
                      if (bought) {
                        soundEngine.play("reward");
                        setMarketMessage(`${reward.name} entrou na sua coleção.`);
                      }
                    }}
                  >
                    {owned ? (
                      <>
                        <Check /> resgatado
                      </>
                    ) : canBuy ? (
                      <>
                        <Coins /> {reward.cost}
                      </>
                    ) : (
                      <>
                        <LockKeyhole /> faltam {reward.cost - state.coins}
                      </>
                    )}
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="discovery-strip">
          <header>
            <div>
              <span>OUTROS ALVOS NO RADAR</span>
              <h2>Você pode acompanhar mais de um concurso.</h2>
            </div>
            <button type="button" onClick={() => go("contests")}>
              abrir atlas <Navigation />
            </button>
          </header>
          <div>
            {suggestions.map((item) => (
              <button type="button" key={item.id} onClick={() => go("contests")}>
                <small>
                  {item.uf} · {item.banca}
                </small>
                <strong>{item.apelido}</strong>
                <span>
                  {item.vagasTotais} vagas · {item.cargos.length} cargos
                </span>
                <ArrowRight />
              </button>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function stageIcon(type: EtapaTipo) {
  const icons: Partial<Record<EtapaTipo, typeof FileText>> = {
    objetiva: ListChecks,
    discursiva: FileText,
    redacao: FileText,
    titulos: Award,
    taf: Dumbbell,
    psicologico: Brain,
    medico: HeartPulse,
    investigacao_social: UserCheck,
    documentacao: FileCheck2,
    curso_formacao: GraduationCap,
  };
  return icons[type] ?? ShieldCheck;
}
