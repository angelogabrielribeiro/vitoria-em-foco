import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  BookMarked,
  CalendarRange,
  ChevronRight,
  Coins,
  Compass,
  Flame,
  LayoutDashboard,
  Map,
  Navigation,
  Sparkles,
  Target,
  Trophy,
  X,
  Zap,
} from "lucide-react";

import { getCidade } from "@/data/mock/geografia";
import { getConcurso } from "@/data/mock/concursos";
import { useJourney, xpNoNivel } from "@/lib/journey";
import { cn } from "@/lib/utils";
import { SoundToggle } from "./Soundscape";
import type { ExperienceScreen } from "./experience";

export function CarnivalBrand({ mini = false }: { mini?: boolean }) {
  return (
    <span className="carnival-brand">
      <span className="carnival-brand__mark" aria-hidden="true">
        <Navigation className="size-4" strokeWidth={2.4} />
        <i />
      </span>
      {!mini ? (
        <span>
          <strong>Vitória em Foco</strong>
          <small>rota nacional de concursos</small>
        </span>
      ) : null}
    </span>
  );
}

const NAV_ITEMS: {
  screen: ExperienceScreen;
  label: string;
  short: string;
  icon: typeof LayoutDashboard;
}[] = [
  { screen: "dashboard", label: "Central", short: "Central", icon: LayoutDashboard },
  { screen: "contests", label: "Concursos", short: "Concursos", icon: Map },
  { screen: "library", label: "Editais & provas", short: "Acervo", icon: BookMarked },
  { screen: "study", label: "Sala de estudo", short: "Estudar", icon: Zap },
  { screen: "schedule", label: "Cronograma", short: "Agenda", icon: CalendarRange },
];

export function AppShell({
  current,
  go,
  children,
  fullBleed = false,
}: {
  current: ExperienceScreen;
  go: (screen: ExperienceScreen) => void;
  children: ReactNode;
  fullBleed?: boolean;
}) {
  const state = useJourney();
  const progress = xpNoNivel(state.xp);
  const cidade = state.cidadeId ? getCidade(state.cidadeId) : undefined;
  const concurso =
    state.cidadeId && state.concursoId ? getConcurso(state.cidadeId, state.concursoId) : undefined;

  return (
    <div className="command-app">
      <aside className="command-rail" aria-label="Navegação principal">
        <button
          type="button"
          className="command-rail__brand"
          onClick={() => go("landing")}
          aria-label="Ir ao início"
        >
          <CarnivalBrand mini />
        </button>
        <nav>
          {NAV_ITEMS.map((item) => (
            <button
              type="button"
              key={item.screen}
              onClick={() => go(item.screen)}
              className={cn("command-rail__item", current === item.screen && "is-active")}
              aria-current={current === item.screen ? "page" : undefined}
            >
              <item.icon className="size-[1.15rem]" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="command-rail__footer">
          <SoundToggle compact />
          <span className="level-medallion">{state.nivel}</span>
        </div>
      </aside>

      <div className="command-main">
        <header className="command-topbar">
          <button type="button" onClick={() => go("dashboard")} className="md:hidden">
            <CarnivalBrand />
          </button>
          <div className="command-target">
            <span className="command-target__pulse" />
            <span>
              <small>alvo em foco</small>
              <strong>{concurso?.apelido ?? "Escolha seu concurso"}</strong>
            </span>
            {cidade ? (
              <em>
                {cidade.nome} · {cidade.uf}
              </em>
            ) : null}
            <button type="button" onClick={() => go("contests")} aria-label="Mudar concurso">
              <ChevronRight className="size-4" />
            </button>
          </div>
          <div className="command-economy">
            <span title="Sequência de estudo">
              <Flame className="size-4 text-ember" fill="currentColor" />
              {state.sequencia || 1}
            </span>
            <span title="Moedas de foco">
              <Coins className="size-4 text-accent" />
              {state.coins}
            </span>
            <span
              className="command-xp"
              title={`${progress.atual} de ${progress.total} XP no nível`}
            >
              <i style={{ width: `${Math.max(4, progress.pct)}%` }} />
              <b>{state.xp} XP</b>
            </span>
            <SoundToggle />
          </div>
        </header>

        <main className={cn("command-content", fullBleed && "command-content--bleed")}>
          {children}
        </main>
      </div>

      <nav className="command-bottom" aria-label="Navegação principal móvel">
        {NAV_ITEMS.map((item) => (
          <button
            type="button"
            key={item.screen}
            onClick={() => go(item.screen)}
            className={cn(current === item.screen && "is-active")}
            aria-current={current === item.screen ? "page" : undefined}
          >
            <item.icon className="size-[1.15rem]" />
            <span>{item.short}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export function RewardBurst({
  show,
  xp,
  coins,
  title = "Missão cumprida",
  onClose,
}: {
  show: boolean;
  xp: number;
  coins: number;
  title?: string;
  onClose: () => void;
}) {
  if (!show) return null;
  return (
    <motion.div
      className="reward-burst"
      role="dialog"
      aria-modal="true"
      aria-label="Recompensa recebida"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="reward-burst__particles" aria-hidden="true">
        {Array.from({ length: 28 }, (_, index) => (
          <i key={index} style={{ "--i": index } as React.CSSProperties} />
        ))}
      </div>
      <motion.div
        className="reward-burst__core"
        initial={{ scale: 0.68, rotate: -8 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 230, damping: 18 }}
      >
        <button type="button" onClick={onClose} aria-label="Fechar recompensa">
          <X className="size-4" />
        </button>
        <span className="reward-burst__halo">
          <Trophy className="size-9" />
        </span>
        <small>rota atualizada</small>
        <h2>{title}</h2>
        <div>
          <strong>
            <Zap className="size-4" /> +{xp} XP
          </strong>
          <strong>
            <Coins className="size-4" /> +{coins}
          </strong>
        </div>
        <p>Seu mapa ganhou energia. A próxima missão já foi recalibrada.</p>
        <button type="button" className="reward-burst__continue" onClick={onClose}>
          Continuar a rota <Sparkles className="size-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-title">
      <div>
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        {text ? <p>{text}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyTarget({ go }: { go: (screen: ExperienceScreen) => void }) {
  return (
    <div className="empty-target">
      <Compass className="size-7" />
      <div>
        <strong>Nenhum concurso está no centro do mapa.</strong>
        <p>Escolha um alvo para conectar editais, provas, matérias e datas.</p>
      </div>
      <button type="button" onClick={() => go("contests")}>
        Explorar concursos <Target className="size-4" />
      </button>
    </div>
  );
}
