import { lazy, Suspense, useRef, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  AudioLines,
  BookOpenCheck,
  CalendarRange,
  Check,
  ClipboardList,
  Clock3,
  Coins,
  FileSearch,
  Gamepad2,
  MapPinned,
  Navigation,
  Play,
  ScanSearch,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import { CIDADES, ESTADOS } from "@/data/mock/geografia";
import { getCatalogoNacional } from "@/data/mock/concursos";
import { cn } from "@/lib/utils";
import { CarnivalBrand } from "./CarnivalShell";
import { EditorialSheet } from "./EditorialSheet";
import type { ExperienceScreen } from "./experience";
import { RadialHeroShader } from "./RadialHeroShader";
import { soundEngine } from "./sound-engine";
import { SoundToggle } from "./Soundscape";

const ApprovalPathScene = lazy(() => import("./ApprovalPathScene"));
const InteractiveGradientPortal = lazy(() =>
  import("./InteractiveGradientPortal").then((module) => ({
    default: module.InteractiveGradientPortal,
  })),
);

const CHAPTERS: {
  id: string;
  number: string;
  title: string;
  line: string;
  description: string;
  meta: string[];
  icon: typeof Navigation;
  screen: ExperienceScreen;
  color: string;
  shader: "cobalt" | "amber" | "coral" | "iris";
}[] = [
  {
    id: "territorio",
    number: "01",
    title: "O Brasil inteiro",
    line: "vira território de busca.",
    description:
      "Estados, capitais e municípios no mesmo atlas — sem esconder concursos federais e estaduais.",
    meta: ["27 UFs", `${CIDADES.length}+ municípios`, "todas as esferas"],
    icon: MapPinned,
    screen: "contests",
    color: "cobalt",
    shader: "cobalt",
  },
  {
    id: "edital",
    number: "02",
    title: "O edital deixa",
    line: "de ser um PDF morto.",
    description:
      "Datas, pesos, retificações e etapas viram um dossiê navegável, comparado e ligado ao seu plano.",
    meta: ["leitor imersivo", "retificações", "upload livre"],
    icon: FileSearch,
    screen: "library",
    color: "amber",
    shader: "amber",
  },
  {
    id: "provas",
    number: "03",
    title: "Provas antigas",
    line: "viram radar da banca.",
    description:
      "Abra cadernos, gabaritos e simulados. Descubra padrões antes que eles apareçam no dia decisivo.",
    meta: ["cadernos", "gabaritos", "modo simulado"],
    icon: ClipboardList,
    screen: "library",
    color: "coral",
    shader: "coral",
  },
  {
    id: "estudo",
    number: "04",
    title: "Estudar vira",
    line: "uma experiência jogável.",
    description:
      "Histórias visuais, mapas vivos, áudio, flashcards e batalhas rápidas — cada acerto move a rota.",
    meta: ["6 modalidades", "feedback criativo", "+XP e moedas"],
    icon: Gamepad2,
    screen: "study",
    color: "iris",
    shader: "iris",
  },
  {
    id: "plano",
    number: "05",
    title: "Seu cronograma",
    line: "obedece à sua vida.",
    description:
      "Mova, troque, divida, conclua ou refaça qualquer bloco. O plano muda sem apagar o que você já venceu.",
    meta: ["100% editável", "replanejamento", "30 dias"],
    icon: CalendarRange,
    screen: "schedule",
    color: "cyan",
    shader: "cobalt",
  },
  {
    id: "posse",
    number: "06",
    title: "A prova não é",
    line: "o fim da jornada.",
    description:
      "TAF, redação, exames, títulos, investigação, documentos e formação continuam dentro do mapa.",
    meta: ["todas as etapas", "checklists", "marcos reais"],
    icon: Trophy,
    screen: "dashboard",
    color: "mint",
    shader: "amber",
  },
];

const LEARNING_MODES = [
  {
    icon: Sparkles,
    label: "História visual",
    text: "Entenda a regra como uma cena, não como um parágrafo.",
    detail: "Uma explicação encenada, com exemplos que mudam conforme a sua resposta.",
    duration: "12 min",
    reward: "+90 XP",
    accent: "var(--color-iris)",
  },
  {
    icon: ScanSearch,
    label: "Mapa vivo",
    text: "Explore relações, abra ramos e encontre pegadinhas.",
    detail: "Conecte conceitos, revele exceções e toque nos pontos que mais caem na sua banca.",
    duration: "9 min",
    reward: "+70 XP",
    accent: "var(--color-cyan)",
  },
  {
    icon: AudioLines,
    label: "Revisão sonora",
    text: "Ouça no transporte e responda durante as pausas.",
    detail: "Áudio curto com pausas de recuperação ativa e resposta por toque.",
    duration: "8 min",
    reward: "+55 XP",
    accent: "var(--color-primary)",
  },
  {
    icon: BookOpenCheck,
    label: "Memória ativa",
    text: "Vire cartas, ensine o conceito e salve seus erros.",
    detail: "Cartas inteligentes retornam no momento certo e transformam erros em revisões.",
    duration: "10 min",
    reward: "+65 XP",
    accent: "var(--color-accent)",
  },
  {
    icon: Zap,
    label: "Batalha de banca",
    text: "Questões em sequência com feedback que muda a cada erro.",
    detail: "Uma sequência rápida com combo, moedas e explicações criativas a cada decisão.",
    duration: "15 min",
    reward: "+120 XP",
    accent: "var(--color-ember)",
  },
];

const CONTEST_STAGES = [
  {
    label: "Objetiva",
    summary: "Blocos por banca, tempo de prova, metas de acerto e revisão dos seus pontos cegos.",
    preparation: ["Simulados progressivos", "Radar de assuntos", "Controle de tempo"],
    accent: "var(--color-primary)",
  },
  {
    label: "Redação",
    summary: "Temas prováveis, repertório, estrutura e uma fila de treino ligada ao edital.",
    preparation: ["Banco de temas", "Checklist da banca", "Versões e correções"],
    accent: "var(--color-ember)",
  },
  {
    label: "Títulos",
    summary: "Organize certificados, pontuação prevista e prazos antes de a convocação chegar.",
    preparation: ["Cofre de documentos", "Pontuação simulada", "Alertas de prazo"],
    accent: "var(--color-accent)",
  },
  {
    label: "TAF",
    summary: "Metas físicas entram no mesmo calendário, sem disputar espaço às cegas com o estudo.",
    preparation: ["Marcos semanais", "Registro de evolução", "Dias de recuperação"],
    accent: "var(--color-cyan)",
  },
  {
    label: "Psicológico",
    summary: "Entenda a etapa, reúna orientações e acompanhe cada convocação sem improviso.",
    preparation: ["Guia da etapa", "Checklist pessoal", "Datas oficiais"],
    accent: "var(--color-iris)",
  },
  {
    label: "Exames",
    summary: "Uma lista viva de exames, validade e pendências para chegar com tudo em ordem.",
    preparation: ["Exames exigidos", "Validades", "Pendências"],
    accent: "var(--color-cyan)",
  },
  {
    label: "Investigação",
    summary: "Histórico, certidões e formulários organizados numa trilha verificável.",
    preparation: ["Certidões", "Histórico", "Conferência final"],
    accent: "var(--color-ember)",
  },
  {
    label: "Documentos",
    summary: "Centralize originais, cópias e comprovantes com o contexto de cada exigência.",
    preparation: ["Pasta de posse", "Validação", "Backups"],
    accent: "var(--color-accent)",
  },
  {
    label: "Formação",
    summary: "Acompanhe o curso, as avaliações e o caminho final até a nomeação.",
    preparation: ["Agenda da turma", "Avaliações", "Marco da posse"],
    accent: "var(--color-success)",
  },
];

export function LandingCarnival({ go }: { go: (screen: ExperienceScreen) => void }) {
  const [active, setActive] = useState(0);
  const [selectedMode, setSelectedMode] = useState<number | null>(null);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const reduced = Boolean(useReducedMotion());
  const strip = useRef<HTMLDivElement>(null);
  const chapter = CHAPTERS[active] ?? CHAPTERS[0]!;
  const catalogSize = getCatalogoNacional().length;
  const mode = selectedMode === null ? null : LEARNING_MODES[selectedMode];
  const stage = selectedStage === null ? null : CONTEST_STAGES[selectedStage];

  const openMode = (index: number) => {
    soundEngine.play("open");
    setSelectedMode(index);
  };

  const openStage = (index: number) => {
    soundEngine.play("open");
    setSelectedStage(index);
  };

  const select = (index: number) => {
    const next = Math.max(0, Math.min(CHAPTERS.length - 1, index));
    setActive(next);
    soundEngine.play("open");
    const button = strip.current?.querySelector<HTMLButtonElement>(`[data-chapter="${next}"]`);
    button?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  return (
    <div className={cn("carnival-landing", `phase-${chapter.color}`)}>
      <section className="editorial-hero">
        <RadialHeroShader
          className="editorial-hero__shader"
          energy={0.56 + active * 0.075}
          palette={chapter.shader}
        />
        <div className="editorial-hero__topography" aria-hidden="true" />
        <header className="editorial-nav">
          <CarnivalBrand />
          <span className="editorial-nav__edition">EDIÇÃO / 2026 · BRASIL</span>
          <div>
            <SoundToggle />
            <button type="button" onClick={() => go("dashboard")}>
              Minha central <ArrowRight className="size-4" />
            </button>
          </div>
        </header>

        <div className="editorial-copy" aria-live="polite">
          <motion.span
            key={`${chapter.id}-number`}
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            DOSSIÊ {chapter.number} / {String(CHAPTERS.length).padStart(2, "0")}
          </motion.span>
          <motion.h1
            key={chapter.id}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="editorial-line-mask">
              <motion.i
                initial={reduced ? false : { y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
              >
                {chapter.title}
              </motion.i>
            </span>
            <span className="editorial-line-mask">
              <motion.i
                initial={reduced ? false : { y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.68, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                {chapter.line}
              </motion.i>
            </span>
          </motion.h1>
        </div>

        <div className="editorial-meta">
          <motion.p
            key={`${chapter.id}-description`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {chapter.description}
          </motion.p>
          <div>
            {chapter.meta.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <div
          ref={strip}
          className="journey-filmstrip"
          role="tablist"
          aria-label="Capítulos da experiência"
          onWheel={(event) => {
            if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
            event.preventDefault();
            select(active + Math.sign(event.deltaX));
          }}
        >
          {CHAPTERS.map((item, index) => (
            <motion.button
              type="button"
              key={item.id}
              data-chapter={index}
              role="tab"
              aria-selected={index === active}
              onClick={() => select(index)}
              className={cn("journey-card", index === active && "is-active")}
              animate={{ height: index === active ? "15.5rem" : "8.1rem" }}
              transition={
                reduced ? { duration: 0 } : { type: "spring", stiffness: 240, damping: 30 }
              }
            >
              <span className="journey-card__art" aria-hidden="true">
                <item.icon />
                <i />
              </span>
              <span className="journey-card__label">
                <b>{item.number}</b>
                <em>{item.id}</em>
              </span>
              {index === active ? (
                <strong>
                  {item.title} {item.line}
                </strong>
              ) : null}
            </motion.button>
          ))}
        </div>

        <div className="editorial-progress" aria-hidden="true">
          <span>{chapter.number}</span>
          <i>
            <b style={{ width: `${((active + 1) / CHAPTERS.length) * 100}%` }} />
          </i>
          <span>{String(CHAPTERS.length).padStart(2, "0")}</span>
        </div>

        <button type="button" className="editorial-cta" onClick={() => go(chapter.screen)}>
          Entrar neste dossiê <ArrowRight className="size-4" />
        </button>
        <button
          type="button"
          className="editorial-scroll"
          onClick={() =>
            document
              .getElementById("manifesto")
              ?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" })
          }
        >
          explorar <ArrowDown className="size-4" />
        </button>
      </section>

      <div className="signal-ticker" aria-label="Cobertura demonstrativa">
        <div>
          {[
            "CATÁLOGO NACIONAL",
            `${ESTADOS.length} ESTADOS`,
            `${CIDADES.length}+ MUNICÍPIOS`,
            `${catalogSize}+ OPORTUNIDADES`,
            "EDITAIS",
            "PROVAS",
            "MISSÕES",
            "XP",
            "TAF ATÉ A POSSE",
          ].map((text) => (
            <span key={text}>
              <i /> {text}
            </span>
          ))}
        </div>
      </div>

      <section id="manifesto" className="manifesto-stage">
        <div className="manifesto-stage__copy">
          <span>MANIFESTO / 01</span>
          <h2>Você não veio aqui para preencher outro onboarding.</h2>
          <p>
            Veio para escolher uma vaga, dominar um edital e sentir que cada sessão de estudo
            empurra algo real para frente.
          </p>
        </div>
        <div className="manifesto-stage__statement">
          <strong>NÃO É SÓ</strong>
          <motion.span
            initial={reduced ? false : { opacity: 0.5, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: [0.96, 1.018, 1] }}
            viewport={{ once: true, amount: 0.7 }}
            transition={{ duration: 1.1 }}
          >
            RESPONDER
          </motion.span>
          <strong>PERGUNTAS.</strong>
          <p>É construir memória, estratégia, ritmo e preparo para todas as fases.</p>
        </div>
      </section>

      <section className="study-portal-section">
        <div className="study-portal-section__intro">
          <span>PORTAL DE ESTUDO / INTERATIVO</span>
          <h2>Toque na matéria. Ela responde.</h2>
          <p>
            Este não é um banner decorativo: cada toque abre uma onda e prepara uma entrada
            diferente para a próxima missão.
          </p>
          <div>
            <span>
              <i /> clique ou toque
            </span>
            <span>
              <i /> som opcional
            </span>
            <span>
              <i /> recompensa real
            </span>
          </div>
        </div>
        <Suspense fallback={<div className="study-portal-section__fallback" />}>
          <InteractiveGradientPortal
            title="Qual caminho seu cérebro precisa agora?"
            subtitle="Crie uma onda e abra o seletor de missão."
            onActivate={() => openMode(4)}
          />
        </Suspense>
      </section>

      <section className="learning-carnival">
        <div className="learning-carnival__intro">
          <span>MODOS DE ESTUDO / 05</span>
          <h2>Cada matéria pede uma porta diferente.</h2>
          <button type="button" onClick={() => go("study")}>
            <Play className="size-4" fill="currentColor" /> abrir sala de estudo
          </button>
        </div>
        <div className="learning-carnival__stack">
          {LEARNING_MODES.map((mode, index) => (
            <motion.button
              type="button"
              key={mode.label}
              onClick={() => openMode(index)}
              style={{ "--mode-accent": mode.accent } as CSSProperties}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: index * 0.06 }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <mode.icon />
              <strong>{mode.label}</strong>
              <p>{mode.text}</p>
              <ArrowRight className="learning-carnival__arrow" />
            </motion.button>
          ))}
        </div>
      </section>

      <section className="route-spectacle">
        <div className="route-spectacle__visual">
          <Suspense fallback={<div className="route-spectacle__fallback" />}>
            <ApprovalPathScene />
          </Suspense>
        </div>
        <div className="route-spectacle__copy">
          <span>DO EDITAL À POSSE / SEM CORTES</span>
          <h2>A jornada continua depois da prova.</h2>
          <div>
            {CONTEST_STAGES.map((stage, index) => (
              <button type="button" key={stage.label} onClick={() => openStage(index)}>
                <small>{String(index + 1).padStart(2, "0")}</small>
                <strong>{stage.label}</strong>
                <Check className="size-4" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="final-launch">
        <RadialHeroShader energy={1.08} palette="coral" />
        <div>
          <Target />
          <span>PRONTO PARA COLOCAR UMA VAGA NO CENTRO?</span>
          <h2>
            Escolha o alvo.
            <br />A rota ganha vida.
          </h2>
          <button type="button" onClick={() => go("contests")}>
            Explorar concursos do Brasil <ArrowRight />
          </button>
        </div>
      </section>

      <EditorialSheet
        open={Boolean(mode)}
        onClose={() => setSelectedMode(null)}
        eyebrow={mode ? `MISSÃO / ${String((selectedMode ?? 0) + 1).padStart(2, "0")}` : "MISSÃO"}
        title={mode?.label ?? "Escolha uma missão"}
        summary={mode?.detail}
        accent={mode?.accent}
        actions={
          <>
            <button type="button" className="sheet-secondary" onClick={() => setSelectedMode(null)}>
              continuar explorando
            </button>
            <button type="button" className="sheet-primary" onClick={() => go("study")}>
              começar missão <ArrowRight />
            </button>
          </>
        }
      >
        {mode ? (
          <div className="mission-preview">
            <div>
              <Clock3 />
              <span>DURAÇÃO</span>
              <strong>{mode.duration}</strong>
            </div>
            <div>
              <Coins />
              <span>RECOMPENSA</span>
              <strong>{mode.reward}</strong>
            </div>
            <div>
              <Target />
              <span>OBJETIVO</span>
              <strong>1 avanço real</strong>
            </div>
          </div>
        ) : null}
      </EditorialSheet>

      <EditorialSheet
        open={Boolean(stage)}
        onClose={() => setSelectedStage(null)}
        eyebrow={stage ? `ETAPA / ${String((selectedStage ?? 0) + 1).padStart(2, "0")}` : "ETAPA"}
        title={stage?.label ?? "Etapa do concurso"}
        summary={stage?.summary}
        accent={stage?.accent}
        actions={
          <>
            <button
              type="button"
              className="sheet-secondary"
              onClick={() => setSelectedStage(null)}
            >
              ver as outras etapas
            </button>
            <button type="button" className="sheet-primary" onClick={() => go("dashboard")}>
              abrir na minha central <ArrowRight />
            </button>
          </>
        }
      >
        {stage ? (
          <div className="stage-preview">
            {stage.preparation.map((item, index) => (
              <div key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item}</strong>
                <Check />
              </div>
            ))}
          </div>
        ) : null}
      </EditorialSheet>
    </div>
  );
}

