import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  CalendarDays,
  Check,
  ChevronRight,
  CircleCheck,
  Clock3,
  Dumbbell,
  FileCheck2,
  FileText,
  Flame,
  Gauge,
  GraduationCap,
  HeartPulse,
  ListChecks,
  LockKeyhole,
  MapPin,
  Menu,
  Navigation,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  UploadCloud,
  UserCheck,
  X,
  Zap,
} from "lucide-react";

import type { Alternativa, BlocoDia, EtapaTipo } from "@/data/types";
import { ESTADOS, getCidade, getCidadesPorUf, getEstado } from "@/data/mock/geografia";
import {
  ESFERA_LABEL,
  STATUS_LABEL,
  diasAte,
  formatarData,
  getConcurso,
  getConcursosPorCidade,
} from "@/data/mock/concursos";
import { CONQUISTAS, gerarPlano } from "@/data/mock/plano";
import { DIAGNOSTICO, getQuestao } from "@/data/mock/questoes";
import { BLOCOS, journey, minutosPorDia, useJourney, xpNoNivel } from "@/lib/journey";
import { cn } from "@/lib/utils";
import {
  Action,
  Plate,
  ProgressBar,
  ProgressRing,
  SelectRow,
  Tag,
  actionVariants,
} from "./primitives";
import { FadeIn, WordReveal } from "./WordReveal";

const ApprovalPathScene = lazy(() => import("./ApprovalPathScene"));

export type ExperienceScreen =
  | "landing"
  | "finder"
  | "upload"
  | "availability"
  | "diagnostic"
  | "dashboard"
  | "question"
  | "plan"
  | "paywall";

const ROUTES: Record<ExperienceScreen, string> = {
  landing: "/",
  finder: "/encontrar",
  upload: "/enviar-edital",
  availability: "/disponibilidade",
  diagnostic: "/diagnostico",
  dashboard: "/painel",
  question: "/questao/q1",
  plan: "/plano",
  paywall: "/plano-completo",
};

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="brand-mark" aria-hidden="true">
        <Navigation className="size-4" strokeWidth={2.3} />
      </div>
      <div className="leading-none">
        <strong
          className={cn(
            "block font-display font-bold tracking-[-0.045em]",
            compact ? "text-sm" : "text-base",
          )}
        >
          Vitória em Foco
        </strong>
        {!compact ? (
          <span className="mt-1 block font-mono text-[0.52rem] uppercase tracking-[0.2em] text-muted-foreground">
            concursos do Brasil
          </span>
        ) : null}
      </div>
    </div>
  );
}

function SceneSlot() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted)
    return (
      <div className="scene-loading grid h-full place-items-center">
        <span />
      </div>
    );
  return (
    <Suspense
      fallback={
        <div className="scene-loading grid h-full place-items-center">
          <span />
        </div>
      }
    >
      <ApprovalPathScene />
    </Suspense>
  );
}

function MockNotice({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[0.58rem] uppercase tracking-[0.13em] text-muted-foreground",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-accent" />
      demonstração com dados simulados
    </div>
  );
}

function Landing({ go }: { go: (screen: ExperienceScreen) => void }) {
  return (
    <div className="landing-shell min-h-screen overflow-hidden">
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Brand />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go("dashboard")}
              className="hidden rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Já comecei
            </button>
            <button
              type="button"
              onClick={() => go("finder")}
              className={actionVariants({ variant: "outline", size: "sm" })}
            >
              Encontrar concurso
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate min-h-[880px] pt-28 lg:min-h-screen lg:pt-20">
          <div className="hero-aurora hero-aurora--one" />
          <div className="hero-aurora hero-aurora--two" />
          <div className="pointer-events-none absolute inset-0 grid-floor opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />

          <div className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] max-w-[1440px] items-center gap-12 px-5 pb-16 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-12">
            <div className="max-w-2xl pt-8 lg:pt-0">
              <FadeIn>
                <div className="mb-7 flex flex-wrap items-center gap-3">
                  <Tag tone="primary">
                    <span className="animate-live-dot size-1.5 rounded-full bg-primary" /> rota
                    ativa
                  </Tag>
                  <span className="eyebrow">federal · estadual · municipal</span>
                </div>
              </FadeIn>
              <h1 className="max-w-[760px] text-[clamp(3.25rem,7.2vw,7.8rem)] font-black leading-[0.88] tracking-[-0.075em]">
                <WordReveal
                  text="Do edital à posse, cada passo entra em foco."
                  highlight={["foco"]}
                />
              </h1>
              <FadeIn delay={0.48}>
                <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Encontre concursos em todo o Brasil e transforme páginas, prazos e etapas em uma
                  missão diária que cabe na sua rotina.
                </p>
              </FadeIn>
              <FadeIn delay={0.58} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Action size="lg" onClick={() => go("finder")}>
                  Encontrar meu concurso <ArrowRight className="size-4" />
                </Action>
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="group inline-flex h-14 items-center justify-center gap-2 rounded-full px-6 font-display text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="grid size-8 place-items-center rounded-full border border-border-strong bg-surface/60 transition-colors group-hover:border-primary/50">
                    <Play className="ml-0.5 size-3.5" fill="currentColor" />
                  </span>
                  Ver a jornada
                </button>
              </FadeIn>
              <FadeIn delay={0.7} className="mt-10">
                <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs text-muted-foreground">
                  {["27 estados", "todas as esferas", "plano adaptado", "todas as etapas"].map(
                    (item) => (
                      <span key={item} className="inline-flex items-center gap-2">
                        <Check className="size-3.5 text-primary" /> {item}
                      </span>
                    ),
                  )}
                </div>
              </FadeIn>
            </div>

            <FadeIn delay={0.2} className="relative min-h-[480px] lg:min-h-[690px]">
              <div className="scene-frame absolute inset-0 overflow-hidden rounded-[2rem]">
                <div className="absolute left-5 top-5 z-10 flex items-center gap-2 sm:left-7 sm:top-7">
                  <span className="animate-live-dot size-2 rounded-full bg-primary" />
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                    rota de aprovação · ao vivo
                  </span>
                </div>
                <SceneSlot />
              </div>
              <motion.div
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                className="absolute -right-2 top-[21%] z-20 w-44 rounded-2xl border border-border-strong bg-background/90 p-4 shadow-2xl backdrop-blur-md sm:right-5"
              >
                <div className="flex items-center justify-between">
                  <span className="eyebrow">ritmo hoje</span>
                  <Zap className="size-3.5 text-accent" />
                </div>
                <div className="mt-3 flex items-end gap-2">
                  <strong className="font-display text-3xl">60</strong>
                  <span className="pb-1 text-xs text-muted-foreground">minutos</span>
                </div>
                <ProgressBar value={62} className="mt-3 h-1.5" tone="accent" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.25, duration: 0.6 }}
                className="absolute -bottom-4 left-2 z-20 flex items-center gap-3 rounded-2xl border border-primary/25 bg-background/92 p-3 pr-5 shadow-[var(--shadow-glow)] backdrop-blur-md sm:bottom-8 sm:left-5"
              >
                <div className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <Target className="size-5" />
                </div>
                <div>
                  <div className="font-display text-sm font-bold">Missão desbloqueada</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    Crase · 12 questões · +120 XP
                  </div>
                </div>
              </motion.div>
            </FadeIn>
          </div>
        </section>

        <section
          id="como-funciona"
          className="relative border-t border-border bg-surface/35 py-24 sm:py-32"
        >
          <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
            <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <FadeIn>
                  <span className="eyebrow">um caminho, sem complicação</span>
                </FadeIn>
                <FadeIn delay={0.08}>
                  <h2 className="mt-5 text-4xl font-black leading-[0.98] sm:text-6xl">
                    O concurso inteiro.{" "}
                    <span className="text-gradient-aprova">Uma missão por vez.</span>
                  </h2>
                </FadeIn>
                <FadeIn delay={0.14}>
                  <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
                    Sem planilhas infinitas ou menus que parecem cockpit. Você diz onde está,
                    escolhe a prova e recebe o próximo passo claro.
                  </p>
                </FadeIn>
              </div>
              <div className="story-rail">
                {[
                  {
                    number: "01",
                    icon: MapPin,
                    title: "Encontre o alvo",
                    text: "Estado, cidade, concurso e cargo. Federal, estadual ou municipal — tudo dentro do mesmo fluxo.",
                    meta: "catálogo nacional",
                  },
                  {
                    number: "02",
                    icon: FileCheck2,
                    title: "O edital vira rota",
                    text: "Matérias, pesos, datas, redação, TAF, psicológico, exames, títulos e documentos entram no mapa.",
                    meta: "análise completa",
                  },
                  {
                    number: "03",
                    icon: Zap,
                    title: "Cumpra a missão de hoje",
                    text: "Seu tempo disponível decide o tamanho da missão. Acertos geram XP; consistência abre o próximo marco.",
                    meta: "progresso real",
                  },
                ].map((item, index) => (
                  <FadeIn key={item.number} delay={index * 0.08}>
                    <article className="story-step">
                      <div className="story-step__number">{item.number}</div>
                      <div className="story-step__body">
                        <div className="mb-7 flex items-center justify-between">
                          <div className="grid size-12 place-items-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                            <item.icon className="size-5" />
                          </div>
                          <span className="eyebrow">{item.meta}</span>
                        </div>
                        <h3 className="text-2xl font-bold sm:text-3xl">{item.title}</h3>
                        <p className="mt-3 max-w-lg leading-relaxed text-muted-foreground">
                          {item.text}
                        </p>
                      </div>
                    </article>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-24 sm:py-32">
          <div className="hero-aurora hero-aurora--three" />
          <div className="relative mx-auto max-w-[1120px] px-5 text-center sm:px-8">
            <FadeIn>
              <MockNotice />
            </FadeIn>
            <FadeIn delay={0.08}>
              <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-[0.98] sm:text-6xl">
                Sua aprovação não precisa começar com um plano perfeito.
                <span className="mt-2 block text-gradient-aprova">Precisa começar hoje.</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.16} className="mt-9">
              <Action size="lg" onClick={() => go("finder")}>
                Montar minha rota <ArrowRight className="size-4" />
              </Action>
            </FadeIn>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 px-5 text-center sm:flex-row sm:px-8 sm:text-left">
          <Brand compact />
          <p className="text-xs text-muted-foreground">
            Protótipo navegável · nome provisório · sem pagamento real
          </p>
        </div>
      </footer>
    </div>
  );
}

function AppHeader({ go }: { go: (screen: ExperienceScreen) => void }) {
  const state = useJourney();
  return (
    <header className="app-header sticky top-0 z-40 border-b border-border bg-background/86 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-4 sm:px-6">
        <button type="button" onClick={() => go("landing")} aria-label="Ir para o início">
          <Brand compact />
        </button>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 sm:flex">
            <Flame className="size-3.5 text-ember" fill="currentColor" />
            <span className="font-mono text-[0.65rem] font-bold">{state.sequencia} DIAS</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 py-1.5 pl-2 pr-3">
            <span className="grid size-6 place-items-center rounded-full bg-primary font-mono text-[0.62rem] font-black text-primary-foreground">
              {state.nivel}
            </span>
            <span className="font-mono text-[0.65rem] font-bold text-primary">{state.xp} XP</span>
          </div>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-surface-2 hover:text-foreground"
            aria-label="Abrir menu"
          >
            <Menu className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

function PageIntro({
  eyebrow,
  title,
  text,
  back,
}: {
  eyebrow: string;
  title: string;
  text: string;
  back?: () => void;
}) {
  return (
    <div className="mb-8">
      {back ? (
        <button
          type="button"
          onClick={back}
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Voltar
        </button>
      ) : null}
      <span className="eyebrow">{eyebrow}</span>
      <h1 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">{title}</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

function JourneyLayout({
  go,
  children,
  wide = false,
}: {
  go: (screen: ExperienceScreen) => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader go={go} />
      <div className="pointer-events-none fixed inset-0 grid-floor opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
      <main
        className={cn(
          "relative mx-auto px-4 py-8 sm:px-6 sm:py-12",
          wide ? "max-w-[1180px]" : "max-w-3xl",
        )}
      >
        {children}
      </main>
    </div>
  );
}

const finderLabels = ["Estado", "Cidade", "Concurso", "Cargo"];

function Finder({ go }: { go: (screen: ExperienceScreen) => void }) {
  const state = useJourney();
  const [step, setStep] = useState(() => {
    if (!state.uf) return 0;
    if (!state.cidadeId) return 1;
    if (!state.concursoId) return 2;
    return 3;
  });
  const [query, setQuery] = useState("");
  const cidades = state.uf ? getCidadesPorUf(state.uf) : [];
  const concursos = state.cidadeId ? getConcursosPorCidade(state.cidadeId) : [];
  const concurso =
    state.cidadeId && state.concursoId ? getConcurso(state.cidadeId, state.concursoId) : undefined;

  const advance = (next: number) => {
    setQuery("");
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredStates = ESTADOS.filter((estado) =>
    `${estado.nome} ${estado.uf}`.toLowerCase().includes(query.toLowerCase()),
  );
  const filteredCities = cidades.filter((cidade) =>
    cidade.nome.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <JourneyLayout go={go}>
      <div className="mb-9 flex items-center gap-2" aria-label={`Etapa ${step + 1} de 4`}>
        {finderLabels.map((label, index) => (
          <div key={label} className="flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              disabled={index > step}
              onClick={() => index <= step && advance(index)}
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full border font-mono text-[0.62rem] font-bold",
                index < step && "border-primary bg-primary text-primary-foreground",
                index === step &&
                  "border-primary text-primary shadow-[0_0_0_4px_oklch(0.82_0.185_146_/_12%)]",
                index > step && "border-border text-muted-foreground",
              )}
            >
              {index < step ? <Check className="size-3" /> : index + 1}
            </button>
            <span
              className={cn(
                "hidden truncate text-[0.68rem] sm:block",
                index === step ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {index < finderLabels.length - 1 ? <span className="h-px flex-1 bg-border" /> : null}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.26 }}
        >
          {step === 0 ? (
            <>
              <PageIntro
                eyebrow="01 · localização"
                title="Onde você quer conquistar sua vaga?"
                text="Escolha seu estado. Depois mostramos municípios e também oportunidades estaduais e federais disponíveis para a região."
                back={() => go("landing")}
              />
              <SearchField
                value={query}
                onChange={setQuery}
                placeholder="Busque por estado ou sigla"
              />
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {filteredStates.map((estado, index) => (
                  <SelectRow
                    key={estado.uf}
                    title={estado.nome}
                    subtitle={estado.regiao}
                    index={index}
                    selected={state.uf === estado.uf}
                    icon={<span className="font-mono text-xs font-black">{estado.uf}</span>}
                    onClick={() => {
                      journey.selecionarUf(estado.uf);
                      advance(1);
                    }}
                  />
                ))}
              </div>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <PageIntro
                eyebrow="02 · cidade"
                title={`Qual cidade em ${getEstado(state.uf ?? "")?.nome ?? "seu estado"}?`}
                text="A cidade ajuda a priorizar concursos municipais sem esconder as opções estaduais e federais."
                back={() => advance(0)}
              />
              <SearchField value={query} onChange={setQuery} placeholder="Busque sua cidade" />
              <div className="mt-4 grid gap-2">
                {filteredCities.map((cidade, index) => (
                  <SelectRow
                    key={cidade.id}
                    title={cidade.nome}
                    subtitle={cidade.capital ? "Capital" : `${cidade.uf} · município`}
                    index={index}
                    selected={state.cidadeId === cidade.id}
                    icon={<MapPin className="size-4" />}
                    onClick={() => {
                      journey.selecionarCidade(cidade.id);
                      advance(2);
                    }}
                  />
                ))}
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <PageIntro
                eyebrow="03 · alvo"
                title={`Concursos para ${getCidade(state.cidadeId ?? "")?.nome ?? "você"}`}
                text="Nesta demonstração, os editais abaixo são simulados. A versão real reunirá fontes oficiais e a análise integral de cada edital."
                back={() => advance(1)}
              />
              <MockNotice className="mb-5" />
              <div className="grid gap-3">
                {concursos.map((item, index) => (
                  <motion.button
                    key={item.id}
                    type="button"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.035, 0.3) }}
                    onClick={() => {
                      journey.selecionarConcurso(item.id);
                      advance(3);
                    }}
                    className="group rounded-2xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-[var(--shadow-lift)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="mb-3 flex flex-wrap gap-2">
                          <Tag
                            tone={
                              item.esfera === "federal"
                                ? "primary"
                                : item.esfera === "estadual"
                                  ? "accent"
                                  : "neutral"
                            }
                          >
                            {ESFERA_LABEL[item.esfera]}
                          </Tag>
                          <Tag
                            tone={item.statusEdital === "inscricoes_abertas" ? "ember" : "neutral"}
                          >
                            {STATUS_LABEL[item.statusEdital]}
                          </Tag>
                        </div>
                        <h2 className="font-display text-lg font-bold sm:text-xl">
                          {item.apelido}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.banca} · {item.vagasTotais} vagas simuladas
                        </p>
                      </div>
                      <div className="text-right">
                        <strong className="font-display text-2xl text-primary">
                          {diasAte(item.dataProva)}
                        </strong>
                        <span className="block font-mono text-[0.55rem] uppercase tracking-wider text-muted-foreground">
                          dias para a prova
                        </span>
                      </div>
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                      <span>Prova em {formatarData(item.dataProva)}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                        Ver cargos{" "}
                        <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </motion.button>
                ))}
                <button
                  type="button"
                  onClick={() => go("upload")}
                  className="flex items-center gap-4 rounded-2xl border border-dashed border-border-strong p-5 text-left transition-colors hover:border-primary/55 hover:bg-primary/5"
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-surface-2 text-primary">
                    <UploadCloud className="size-5" />
                  </span>
                  <span className="flex-1">
                    <strong className="block font-display text-sm">
                      Não encontrou o concurso?
                    </strong>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Envie o PDF do edital para entrar na fila de análise.
                    </span>
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </button>
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <PageIntro
                eyebrow="04 · cargo"
                title="Qual vaga é a sua?"
                text="O cargo define matérias, pesos, requisitos e o formato do seu plano intensivo."
                back={() => advance(2)}
              />
              <div className="grid gap-3">
                {concurso?.cargos.map((cargo, index) => (
                  <motion.button
                    key={cargo.id}
                    type="button"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      journey.selecionarCargo(cargo.id);
                      go("availability");
                    }}
                    className="group rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-primary/50 hover:bg-surface"
                  >
                    <div className="flex items-start gap-4">
                      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                        <GraduationCap className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="block font-display text-lg">{cargo.nome}</strong>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {cargo.escolaridade} · {cargo.vagas} vagas · {cargo.disciplinas.length}{" "}
                          disciplinas
                        </span>
                        <span className="mt-4 block font-display text-xl font-bold text-accent">
                          {formatMoney(cargo.salario)}
                          <small className="ml-1 text-xs font-normal text-muted-foreground">
                            /mês
                          </small>
                        </span>
                      </span>
                      <ChevronRight className="mt-2 size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </JourneyLayout>
  );
}

function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-13 w-full rounded-2xl border border-border bg-surface pl-11 pr-10 text-sm ring-focus placeholder:text-muted-foreground/65"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Limpar busca"
          className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-surface-3"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </label>
  );
}

function UploadEdital({ go }: { go: (screen: ExperienceScreen) => void }) {
  const state = useJourney();
  const [file, setFile] = useState<{ name: string; size: string } | null>(
    state.editalEnviado
      ? { name: state.editalEnviado.nome, size: state.editalEnviado.tamanho }
      : null,
  );
  const input = useRef<HTMLInputElement>(null);
  const chooseFile = (selected?: File) => {
    if (!selected) return;
    setFile({
      name: selected.name,
      size: `${Math.max(0.1, selected.size / 1_048_576).toFixed(1)} MB`,
    });
  };
  return (
    <JourneyLayout go={go}>
      <PageIntro
        eyebrow="edital fora do catálogo"
        title="Mande o edital. A rota começa por ele."
        text="Nesta demonstração o arquivo não é enviado a um servidor. Guardamos apenas o nome local para mostrar o próximo passo."
        back={() => go("finder")}
      />
      <MockNotice className="mb-5" />
      <input
        ref={input}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={(event) => chooseFile(event.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDrop={(event) => {
          event.preventDefault();
          chooseFile(event.dataTransfer.files[0]);
        }}
        onDragOver={(event) => event.preventDefault()}
        className={cn(
          "group grid min-h-64 w-full place-items-center rounded-3xl border border-dashed p-8 text-center transition-colors",
          file
            ? "border-primary/45 bg-primary/6"
            : "border-border-strong bg-card hover:border-primary/50",
        )}
      >
        {file ? (
          <div>
            <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <FileCheck2 className="size-7" />
            </span>
            <strong className="mt-5 block break-all font-display text-lg">{file.name}</strong>
            <span className="mt-1 block text-sm text-muted-foreground">
              {file.size} · PDF pronto para a simulação
            </span>
            <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-primary">
              <UploadCloud className="size-3.5" /> Trocar arquivo
            </span>
          </div>
        ) : (
          <div>
            <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-surface-2 text-primary transition-transform group-hover:-translate-y-1">
              <UploadCloud className="size-7" />
            </span>
            <strong className="mt-5 block font-display text-lg">Toque para escolher o PDF</strong>
            <span className="mt-2 block text-sm text-muted-foreground">
              ou arraste o edital para esta área
            </span>
          </div>
        )}
      </button>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {["Datas e requisitos", "Matérias e pesos", "Todas as etapas"].map((item, index) => (
          <div
            key={item}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-3 py-3 text-xs text-muted-foreground"
          >
            <span className="font-mono text-primary">0{index + 1}</span>
            {item}
          </div>
        ))}
      </div>
      <Action
        size="block"
        className="mt-7"
        disabled={!file}
        onClick={() => {
          if (!file) return;
          journey.registrarEdital(file.name, file.size);
          go("availability");
        }}
      >
        Simular análise do edital <ArrowRight className="size-4" />
      </Action>
    </JourneyLayout>
  );
}

function Availability({ go }: { go: (screen: ExperienceScreen) => void }) {
  const state = useJourney();
  const total = minutosPorDia(state.disponibilidade);
  const update = (bloco: BlocoDia, patch: { ativo?: boolean; minutos?: number }) => {
    journey.definirDisponibilidade(
      state.disponibilidade.map((item) => (item.bloco === bloco ? { ...item, ...patch } : item)),
    );
  };
  return (
    <JourneyLayout go={go}>
      <PageIntro
        eyebrow="seu ritmo"
        title="Quando o estudo cabe no seu dia?"
        text="Marque os blocos possíveis. Não precisa prometer uma rotina impossível — o plano se adapta ao tempo real."
        back={() => (state.editalEnviado ? go("upload") : go("finder"))}
      />
      <div className="mb-5 flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/7 p-4">
        <div>
          <span className="eyebrow">tempo diário</span>
          <strong className="mt-1 block font-display text-2xl text-primary">{total} minutos</strong>
        </div>
        <Clock3 className="size-7 text-primary" />
      </div>
      <div className="grid gap-3">
        {BLOCOS.map(({ bloco, label, hint }) => {
          const current = state.disponibilidade.find((item) => item.bloco === bloco)!;
          return (
            <Plate
              key={bloco}
              className={cn("transition-colors", current.ativo && "border-primary/40 bg-primary/6")}
            >
              <div className="flex items-start justify-between gap-4">
                <button
                  type="button"
                  onClick={() => update(bloco, { ativo: !current.ativo })}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-xl border",
                      current.ativo
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border-strong bg-surface-2 text-muted-foreground",
                    )}
                  >
                    {current.ativo ? <Check className="size-4" /> : <Clock3 className="size-4" />}
                  </span>
                  <span>
                    <strong className="block font-display">{label}</strong>
                    <span className="text-xs text-muted-foreground">{hint}</span>
                  </span>
                </button>
                <span
                  className={cn(
                    "font-mono text-xs",
                    current.ativo ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {current.ativo ? `${current.minutos} MIN` : "DESLIGADO"}
                </span>
              </div>
              {current.ativo ? (
                <div
                  className="mt-4 flex gap-2 border-t border-border pt-4"
                  aria-label={`Minutos no bloco ${label}`}
                >
                  {[20, 30, 45, 60, 90].map((minutes) => (
                    <button
                      key={minutes}
                      type="button"
                      onClick={() => update(bloco, { minutos: minutes })}
                      className={cn(
                        "h-9 flex-1 rounded-xl border font-mono text-[0.65rem] font-bold transition-colors",
                        current.minutos === minutes
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-surface-2 text-muted-foreground hover:border-border-strong",
                      )}
                    >
                      {minutes}
                    </button>
                  ))}
                </div>
              ) : null}
            </Plate>
          );
        })}
      </div>
      <Action size="block" className="mt-7" disabled={total <= 0} onClick={() => go("diagnostic")}>
        Fazer diagnóstico rápido <ArrowRight className="size-4" />
      </Action>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        10 questões · cerca de 6 minutos
      </p>
    </JourneyLayout>
  );
}

function Diagnostic({ go }: { go: (screen: ExperienceScreen) => void }) {
  const state = useJourney();
  const firstMissing = DIAGNOSTICO.findIndex(
    (item) => !state.diagnostico.some((answer) => answer.questaoId === item.id),
  );
  const [index, setIndex] = useState(firstMissing === -1 ? 0 : firstMissing);
  const [choice, setChoice] = useState<Alternativa["letra"] | null>(null);
  const [finished, setFinished] = useState(
    firstMissing === -1 && state.diagnostico.length >= DIAGNOSTICO.length,
  );
  const question = DIAGNOSTICO[index] ?? DIAGNOSTICO[0]!;
  const score = state.diagnostico.filter((item) => item.correta).length;

  useEffect(() => {
    const saved = state.diagnostico.find((item) => item.questaoId === question.id);
    setChoice((saved?.escolha as Alternativa["letra"] | undefined) ?? null);
  }, [index, question.id, state.diagnostico]);

  const next = () => {
    if (!choice) return;
    journey.registrarDiagnostico(question.id, choice, choice === question.correta);
    if (index >= DIAGNOSTICO.length - 1) {
      journey.premiar("diagnostico-inicial", 250);
      setFinished(true);
      return;
    }
    setIndex((current) => current + 1);
  };

  if (finished) {
    const finalState = journey.get();
    const finalScore = finalState.diagnostico.filter((item) => item.correta).length;
    return (
      <JourneyLayout go={go}>
        <div className="py-8 text-center sm:py-16">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 17 }}
            className="mx-auto grid size-24 place-items-center rounded-[2rem] border border-primary/25 bg-primary/10 text-primary shadow-[var(--shadow-glow)]"
          >
            <Target className="size-10" />
          </motion.div>
          <span className="eyebrow mt-8 block">diagnóstico concluído</span>
          <h1 className="mt-4 text-4xl font-black sm:text-6xl">
            Sua mira está <span className="text-gradient-aprova">calibrada.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
            Você acertou {finalScore} de {DIAGNOSTICO.length}. O plano vai começar reforçando os
            tópicos que mais podem devolver pontos.
          </p>
          <div className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-3 text-left">
            <Plate>
              <span className="eyebrow">resultado</span>
              <strong className="mt-2 block font-display text-3xl">
                {Math.round((finalScore / DIAGNOSTICO.length) * 100)}%
              </strong>
            </Plate>
            <Plate>
              <span className="eyebrow">recompensa</span>
              <strong className="mt-2 block font-display text-3xl text-primary">+250 XP</strong>
            </Plate>
          </div>
          <Action size="lg" className="mt-9" onClick={() => go("dashboard")}>
            Abrir meu painel <ArrowRight className="size-4" />
          </Action>
        </div>
      </JourneyLayout>
    );
  }

  return (
    <JourneyLayout go={go}>
      <div className="mb-7 flex items-center justify-between">
        <button
          type="button"
          onClick={() =>
            index === 0 ? go("availability") : setIndex((current) => Math.max(0, current - 1))
          }
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Voltar
        </button>
        <span className="font-mono text-[0.65rem] font-bold text-muted-foreground">
          {String(index + 1).padStart(2, "0")} / {DIAGNOSTICO.length}
        </span>
      </div>
      <ProgressBar value={((index + 1) / DIAGNOSTICO.length) * 100} className="mb-8 h-1.5" />
      <div className="mb-6 flex flex-wrap gap-2">
        <Tag tone="primary">{question.disciplina}</Tag>
        <Tag>{question.topico}</Tag>
        <Tag tone={question.nivel === "dificil" ? "ember" : "neutral"}>{question.nivel}</Tag>
      </div>
      <h1 className="text-2xl font-bold leading-snug sm:text-3xl">{question.enunciado}</h1>
      <div className="mt-7 grid gap-3">
        {question.alternativas.map((answer, answerIndex) => (
          <motion.button
            key={answer.letra}
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: answerIndex * 0.04 }}
            onClick={() => setChoice(answer.letra)}
            className={cn(
              "flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-colors ring-focus",
              choice === answer.letra
                ? "border-primary bg-primary/9"
                : "border-border bg-card hover:border-border-strong hover:bg-surface",
            )}
          >
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-xl border font-mono text-xs font-black",
                choice === answer.letra
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border-strong bg-surface-2 text-muted-foreground",
              )}
            >
              {answer.letra}
            </span>
            <span className="pt-1.5 text-sm leading-relaxed sm:text-base">{answer.texto}</span>
          </motion.button>
        ))}
      </div>
      <Action size="block" className="mt-7" disabled={!choice} onClick={next}>
        {index === DIAGNOSTICO.length - 1 ? "Ver meu diagnóstico" : "Registrar e continuar"}{" "}
        <ArrowRight className="size-4" />
      </Action>
      {score > 0 ? (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          As respostas já dadas ficam salvas neste aparelho.
        </p>
      ) : null}
    </JourneyLayout>
  );
}

function Dashboard({ go }: { go: (screen: ExperienceScreen) => void }) {
  const state = useJourney();
  const selection = useSelection();
  const contest = selection.concurso;
  const cargo = selection.cargo;
  const days = contest ? diasAte(contest.dataProva) : 82;
  const minutes = Math.max(30, minutosPorDia(state.disponibilidade));
  const level = xpNoNivel(state.xp);
  const stages = contest?.etapas ?? getConcursosPorCidade("es-vitoria")[0]?.etapas ?? [];
  const hasSetup = Boolean(
    (state.cidadeId && state.concursoId && state.cargoId) || state.editalEnviado,
  );

  if (!hasSetup) {
    return (
      <JourneyLayout go={go}>
        <div className="py-16 text-center">
          <MapPin className="mx-auto size-10 text-primary" />
          <h1 className="mt-5 text-3xl font-black">Primeiro, escolha seu concurso.</h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Em menos de um minuto, a gente monta o ponto de partida da sua rota.
          </p>
          <Action className="mt-7" onClick={() => go("finder")}>
            Começar agora <ArrowRight className="size-4" />
          </Action>
        </div>
      </JourneyLayout>
    );
  }

  return (
    <JourneyLayout go={go} wide>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="eyebrow">painel do candidato</span>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Boa, você voltou.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A missão está pronta. Só precisa do seu primeiro clique.
          </p>
        </div>
        <MockNotice />
      </div>

      <section className="mission-card relative overflow-hidden rounded-[2rem] border border-primary/25 p-5 shadow-[var(--shadow-glow)] sm:p-8">
        <div className="mission-orbit" aria-hidden="true" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Tag tone="primary">
                <Zap className="size-3" /> missão de hoje
              </Tag>
              <span className="eyebrow">{minutes} min · +120 XP</span>
            </div>
            <h2 className="mt-5 max-w-2xl text-3xl font-black leading-tight sm:text-5xl">
              Domine as pegadinhas de{" "}
              <span className="text-gradient-aprova">Língua Portuguesa.</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              12 questões guiadas de crase e concordância, com correção imediata e uma regra curta
              para guardar na memória.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Action size="lg" onClick={() => go("question")}>
                <Play className="size-4" fill="currentColor" /> Começar missão
              </Action>
              <button
                type="button"
                onClick={() => go("plan")}
                className="h-12 px-5 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                Ver plano completo
              </button>
            </div>
          </div>
          <div className="mx-auto lg:mx-4">
            <ProgressRing value={0} size={144} stroke={10} label="0/12" sub="questões" />
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={Zap}
          label="Experiência"
          value={`${state.xp} XP`}
          note={`Nível ${state.nivel}`}
          tone="primary"
        />
        <Stat
          icon={Flame}
          label="Sequência"
          value={`${state.sequencia} dias`}
          note="melhor: 3 dias"
          tone="ember"
        />
        <Stat
          icon={Target}
          label="Até a prova"
          value={`${days} dias`}
          note={contest ? formatarData(contest.dataProva) : "edital em análise"}
          tone="accent"
        />
        <Stat icon={Gauge} label="Ritmo" value={`${minutes} min`} note="por dia" tone="neutral" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <Plate className="p-0 overflow-hidden">
          <div className="border-b border-border p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="eyebrow">seu alvo</span>
                <h2 className="mt-2 font-display text-xl font-bold">
                  {contest?.apelido ?? state.editalEnviado?.nome ?? "Edital em análise"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {cargo?.nome ?? "Cargo será identificado na análise"}
                </p>
              </div>
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                <Trophy className="size-5" />
              </span>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <span className="eyebrow">nível {state.nivel}</span>
              <span className="font-mono text-[0.63rem] text-primary">
                {level.atual}/{level.total} XP
              </span>
            </div>
            <ProgressBar value={level.pct} />
            <div className="mt-6 flex flex-wrap gap-2">
              {cargo?.disciplinas.slice(0, 4).map((item) => (
                <Tag key={item.id}>{item.nome}</Tag>
              ))}
            </div>
          </div>
        </Plate>

        <Plate>
          <div className="flex items-center justify-between">
            <div>
              <span className="eyebrow">próximas etapas</span>
              <h2 className="mt-2 font-display text-xl font-bold">Além da prova</h2>
            </div>
            <ShieldCheck className="size-6 text-primary" />
          </div>
          <div className="mt-6 space-y-4">
            {stages.slice(0, 4).map((stage, index) => {
              const Icon = stageIcon(stage.tipo);
              return (
                <div key={stage.id} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-xl border",
                      index === 0
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border bg-surface-2 text-muted-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm">{stage.titulo}</strong>
                    <span className="text-[0.68rem] text-muted-foreground">
                      {index === 0
                        ? "Foco atual"
                        : stage.eliminatoria
                          ? "Eliminatória"
                          : "Classificatória"}
                    </span>
                  </span>
                  {index === 0 ? <Tag tone="primary">agora</Tag> : null}
                </div>
              );
            })}
          </div>
        </Plate>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <span className="eyebrow">conquistas</span>
            <h2 className="mt-1 font-display text-xl font-bold">Seu mural de progresso</h2>
          </div>
          <button
            type="button"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Ver todas
          </button>
        </div>
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
          {CONQUISTAS.slice(0, 5).map((achievement) => (
            <div
              key={achievement.id}
              className={cn(
                "min-w-48 rounded-2xl border p-4",
                achievement.desbloqueada
                  ? "border-accent/25 bg-accent/6"
                  : "border-border bg-card opacity-55",
              )}
            >
              <Award
                className={cn(
                  "size-5",
                  achievement.desbloqueada ? "text-accent" : "text-muted-foreground",
                )}
              />
              <strong className="mt-4 block font-display text-sm">{achievement.nome}</strong>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {achievement.descricao}
              </p>
            </div>
          ))}
        </div>
      </section>
    </JourneyLayout>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  note,
  tone,
}: {
  icon: typeof Zap;
  label: string;
  value: string;
  note: string;
  tone: "primary" | "accent" | "ember" | "neutral";
}) {
  const colors = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    ember: "bg-ember/10 text-ember",
    neutral: "bg-surface-2 text-muted-foreground",
  };
  return (
    <Plate className="flex items-center gap-3 p-4">
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", colors[tone])}>
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="eyebrow block truncate">{label}</span>
        <strong className="mt-1 block truncate font-display text-lg">{value}</strong>
        <span className="block truncate text-[0.65rem] text-muted-foreground">{note}</span>
      </span>
    </Plate>
  );
}

function Question({
  go,
  questionId = "q1",
}: {
  go: (screen: ExperienceScreen) => void;
  questionId?: string;
}) {
  const question = getQuestao(questionId) ?? DIAGNOSTICO[0]!;
  const [selected, setSelected] = useState<Alternativa["letra"] | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const correct = selected === question.correta;
  const submit = () => {
    if (!selected) return;
    setSubmitted(true);
    if (selected === question.correta) journey.premiar(`treino-${question.id}`, 80);
  };
  return (
    <JourneyLayout go={go}>
      <div className="mb-7 flex items-center justify-between">
        <button
          type="button"
          onClick={() => go("dashboard")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Sair da missão
        </button>
        <span className="font-mono text-[0.65rem] text-muted-foreground">QUESTÃO 01 / 12</span>
      </div>
      <div className="mb-7 flex items-center gap-3">
        <ProgressBar value={8.3} className="h-1.5" />
        <span className="font-mono text-[0.62rem] text-primary">+80 XP</span>
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        <Tag tone="primary">{question.disciplina}</Tag>
        <Tag>{question.topico}</Tag>
      </div>
      <h1 className="text-2xl font-bold leading-snug sm:text-3xl">{question.enunciado}</h1>
      <div className="mt-7 grid gap-3">
        {question.alternativas.map((answer, index) => {
          const isCorrect = submitted && answer.letra === question.correta;
          const isWrong = submitted && answer.letra === selected && !correct;
          return (
            <motion.button
              key={answer.letra}
              type="button"
              disabled={submitted}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => setSelected(answer.letra)}
              className={cn(
                "flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-colors",
                !submitted && selected === answer.letra && "border-primary bg-primary/9",
                !submitted &&
                  selected !== answer.letra &&
                  "border-border bg-card hover:border-border-strong",
                isCorrect && "border-success/55 bg-success/10",
                isWrong && "border-destructive/55 bg-destructive/10",
              )}
            >
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-xl border font-mono text-xs font-black",
                  isCorrect && "border-success bg-success text-success-foreground",
                  isWrong && "border-destructive bg-destructive text-destructive-foreground",
                  !submitted &&
                    selected === answer.letra &&
                    "border-primary bg-primary text-primary-foreground",
                  !submitted &&
                    selected !== answer.letra &&
                    "border-border-strong bg-surface-2 text-muted-foreground",
                )}
              >
                {isCorrect ? (
                  <Check className="size-4" />
                ) : isWrong ? (
                  <X className="size-4" />
                ) : (
                  answer.letra
                )}
              </span>
              <span className="pt-1.5 text-sm leading-relaxed sm:text-base">{answer.texto}</span>
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-6 rounded-2xl border p-5",
              correct ? "border-success/35 bg-success/7" : "border-ember/35 bg-ember/7",
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-xl",
                  correct ? "bg-success text-success-foreground" : "bg-ember text-ember-foreground",
                )}
              >
                {correct ? <Check className="size-4" /> : <Brain className="size-4" />}
              </span>
              <strong className="font-display text-lg">
                {correct ? "Na mira. +80 XP" : "Boa tentativa. Agora fixa."}
              </strong>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {question.explicacao}
            </p>
            {question.memoria ? (
              <div className="mt-4 rounded-xl border border-border bg-background/45 p-4">
                <span className="eyebrow">atalho de memória</span>
                <p className="mt-2 text-sm font-semibold">{question.memoria}</p>
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
      {!submitted ? (
        <Action size="block" className="mt-7" disabled={!selected} onClick={submit}>
          Confirmar resposta
        </Action>
      ) : (
        <Action size="block" className="mt-7" onClick={() => go("dashboard")}>
          Concluir primeira questão <ArrowRight className="size-4" />
        </Action>
      )}
    </JourneyLayout>
  );
}

function Plan({ go }: { go: (screen: ExperienceScreen) => void }) {
  const state = useJourney();
  const selection = useSelection();
  const days = selection.concurso ? diasAte(selection.concurso.dataProva) : 30;
  const minutes = Math.max(30, minutosPorDia(state.disponibilidade));
  const plan = useMemo(
    () => gerarPlano(selection.cargo, days, minutes),
    [selection.cargo, days, minutes],
  );
  const [message, setMessage] = useState<string | null>(null);
  const openDay = (day: (typeof plan.dias)[number]) => {
    if (day.dia > plan.gratuitosAte && !state.premium) {
      go("paywall");
      return;
    }
    journey.concluirDia(day.dia);
    journey.premiar(`plano-dia-${day.dia}`, day.xp);
    setMessage(`Dia ${day.dia} concluído · +${day.xp} XP`);
  };
  return (
    <JourneyLayout go={go} wide>
      <PageIntro
        eyebrow="plano intensivo"
        title={`${plan.diasDisponiveis} dias. Uma rota que cabe na sua vida.`}
        text={`${minutes} minutos por dia, priorizando peso do edital, diagnóstico e proximidade da prova.`}
        back={() => go("dashboard")}
      />
      <div className="mb-7 grid gap-3 sm:grid-cols-3">
        <Stat
          icon={CalendarDays}
          label="Duração"
          value={`${plan.diasDisponiveis} dias`}
          note="até a reta final"
          tone="primary"
        />
        <Stat
          icon={Clock3}
          label="Carga"
          value={`${Math.round(plan.minutosTotais / 60)} horas`}
          note="distribuídas"
          tone="accent"
        />
        <Stat icon={Trophy} label="Livre agora" value="3 dias" note="sem pagamento" tone="ember" />
      </div>
      {message ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-center gap-3 rounded-2xl border border-success/30 bg-success/8 p-4 text-sm"
        >
          <CircleCheck className="size-5 text-success" />
          {message}
        </motion.div>
      ) : null}
      <div className="plan-route">
        {plan.dias.map((day, index) => {
          const locked = day.dia > plan.gratuitosAte && !state.premium;
          const completed = state.diasConcluidos.includes(day.dia);
          return (
            <motion.button
              key={day.dia}
              type="button"
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(index * 0.018, 0.25) }}
              onClick={() => openDay(day)}
              className={cn(
                "plan-day group",
                locked && "plan-day--locked",
                completed && "plan-day--complete",
              )}
            >
              <span className="plan-day__marker">
                {completed ? (
                  <Check className="size-4" />
                ) : locked ? (
                  <LockKeyhole className="size-3.5" />
                ) : (
                  day.dia
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="mb-1 flex flex-wrap items-center gap-2">
                  <strong className="font-display text-sm sm:text-base">{day.titulo}</strong>
                  <Tag
                    tone={
                      day.tipo === "simulado"
                        ? "ember"
                        : day.tipo === "desafio"
                          ? "accent"
                          : "neutral"
                    }
                  >
                    {day.tipo}
                  </Tag>
                </span>
                <span className="block text-xs leading-relaxed text-muted-foreground">
                  {day.foco} · {day.minutos} min
                </span>
                <span className="mt-2 block truncate text-[0.68rem] text-muted-foreground">
                  {day.disciplinas.join(" + ")}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <strong className="block font-mono text-xs text-primary">+{day.xp} XP</strong>
                <span className="mt-1 block text-[0.6rem] text-muted-foreground">
                  {locked ? "PLANO COMPLETO" : completed ? "CONCLUÍDO" : "ABRIR"}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </JourneyLayout>
  );
}

function Paywall({ go }: { go: (screen: ExperienceScreen) => void }) {
  const [notice, setNotice] = useState(false);
  return (
    <JourneyLayout go={go} wide>
      <button
        type="button"
        onClick={() => go("plan")}
        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Voltar ao plano
      </button>
      <div className="paywall-stage relative overflow-hidden rounded-[2rem] border border-accent/30 p-6 sm:p-10 lg:p-14">
        <div className="paywall-beam" aria-hidden="true" />
        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <Tag tone="accent">
              <LockKeyhole className="size-3" /> rota completa
            </Tag>
            <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[0.98] sm:text-6xl">
              Você viu o começo.{" "}
              <span className="text-gradient-aprova">Agora destrave o caminho.</span>
            </h1>
            <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
              A experiência completa acompanha sua rotina até a prova, recalculando prioridades e
              cobrindo também as etapas que vêm depois dela.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "30 dias de missões adaptativas",
                "Questões com explicação memorável",
                "Simulados e mapa de fraquezas",
                "TAF, exames, títulos e documentos",
                "Replanejamento por disponibilidade",
                "Conquistas e sequência de estudo",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/12 text-primary">
                    <Check className="size-3.5" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-border-strong bg-background/72 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <span className="eyebrow">plano fundador · demonstração</span>
            <div className="mt-5 flex items-end gap-2">
              <strong className="font-display text-5xl font-black">R$ 29</strong>
              <span className="pb-1 text-sm text-muted-foreground">/mês</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Valor apenas ilustrativo. Nenhuma cobrança ou checkout foi implementado nesta versão.
            </p>
            <Action variant="ember" size="block" className="mt-7" onClick={() => setNotice(true)}>
              Quero ser avisado no lançamento <ArrowRight className="size-4" />
            </Action>
            {notice ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-xl border border-primary/25 bg-primary/8 p-3 text-center text-xs text-primary"
              >
                Interesse registrado apenas nesta demonstração. Nenhum dado foi enviado.
              </motion.div>
            ) : null}
            <button
              type="button"
              onClick={() => go("plan")}
              className="mt-4 w-full text-center text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Continuar nos 3 dias gratuitos
            </button>
          </div>
        </div>
      </div>
    </JourneyLayout>
  );
}

function useSelection() {
  const state = useJourney();
  const cidade = state.cidadeId ? getCidade(state.cidadeId) : undefined;
  const concurso =
    state.cidadeId && state.concursoId ? getConcurso(state.cidadeId, state.concursoId) : undefined;
  const cargo = concurso?.cargos.find((item) => item.id === state.cargoId);
  return { cidade, concurso, cargo };
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
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

export function VitoriaExperience({
  screen,
  questionId,
}: {
  screen: ExperienceScreen;
  questionId?: string;
}) {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const go = (next: ExperienceScreen) => {
    void navigate({ to: ROUTES[next] as never });
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screen}
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reduced ? {} : { opacity: 0 }}
        transition={{ duration: 0.22 }}
      >
        {screen === "landing" ? <Landing go={go} /> : null}
        {screen === "finder" ? <Finder go={go} /> : null}
        {screen === "upload" ? <UploadEdital go={go} /> : null}
        {screen === "availability" ? <Availability go={go} /> : null}
        {screen === "diagnostic" ? <Diagnostic go={go} /> : null}
        {screen === "dashboard" ? <Dashboard go={go} /> : null}
        {screen === "question" ? (
          <Question go={go} {...(questionId ? { questionId } : {})} />
        ) : null}
        {screen === "plan" ? <Plan go={go} /> : null}
        {screen === "paywall" ? <Paywall go={go} /> : null}
      </motion.div>
    </AnimatePresence>
  );
}
