import { lazy, Suspense, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  AudioLines,
  BookOpenCheck,
  CalendarRange,
  Check,
  ClipboardList,
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
import type { ExperienceScreen } from "./experience";
import { LivingShader } from "./LivingShader";
import { soundEngine } from "./sound-engine";
import { SoundToggle } from "./Soundscape";

const ApprovalPathScene = lazy(() => import("./ApprovalPathScene"));

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
    color: "lime",
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
    color: "gold",
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
    color: "ember",
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
    color: "lime",
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
    color: "gold",
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
    color: "ember",
  },
];

const LEARNING_MODES = [
  {
    icon: Sparkles,
    label: "História visual",
    text: "Entenda a regra como uma cena, não como um parágrafo.",
  },
  {
    icon: ScanSearch,
    label: "Mapa vivo",
    text: "Explore relações, abra ramos e encontre pegadinhas.",
  },
  {
    icon: AudioLines,
    label: "Revisão sonora",
    text: "Ouça no transporte e responda durante as pausas.",
  },
  {
    icon: BookOpenCheck,
    label: "Memória ativa",
    text: "Vire cartas, ensine o conceito e salve seus erros.",
  },
  {
    icon: Zap,
    label: "Batalha de banca",
    text: "Questões em sequência com feedback que muda a cada erro.",
  },
];

export function LandingCarnival({ go }: { go: (screen: ExperienceScreen) => void }) {
  const [active, setActive] = useState(0);
  const reduced = Boolean(useReducedMotion());
  const strip = useRef<HTMLDivElement>(null);
  const chapter = CHAPTERS[active] ?? CHAPTERS[0]!;
  const catalogSize = getCatalogoNacional().length;

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
        <LivingShader className="editorial-hero__shader" energy={0.56 + active * 0.075} />
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
          <motion.span whileInView={{ x: [0, 18, 0] }} transition={{ duration: 1.1 }}>
            RESPONDER
          </motion.span>
          <strong>PERGUNTAS.</strong>
          <p>É construir memória, estratégia, ritmo e preparo para todas as fases.</p>
        </div>
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
              onClick={() => go("study")}
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
            {[
              "Objetiva",
              "Redação",
              "Títulos",
              "TAF",
              "Psicológico",
              "Exames",
              "Investigação",
              "Documentos",
              "Formação",
            ].map((stage, index) => (
              <button type="button" key={stage} onClick={() => go("dashboard")}>
                <small>{String(index + 1).padStart(2, "0")}</small>
                <strong>{stage}</strong>
                <Check className="size-4" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="final-launch">
        <LivingShader energy={1.15} />
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
    </div>
  );
}
