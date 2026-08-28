import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Coins,
  Layers3,
  RotateCcw,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";

import { journey } from "@/lib/journey";
import { cn } from "@/lib/utils";
import { RewardBurst } from "../CarnivalShell";
import { soundEngine } from "../sound-engine";

const PAIRS = [
  { id: "crase", term: "Crase", clue: "Se no masculino cabe ‘ao’, no feminino pode caber ‘à’." },
  { id: "logica", term: "Negação de todos", clue: "Basta existir pelo menos um que não." },
  {
    id: "atos",
    term: "Atributos do ato",
    clue: "PIA-T: Presunção, Imperatividade, Autoexecutoriedade e Tipicidade.",
  },
  { id: "seguranca", term: "Phishing", clue: "Isca falsa + urgência + captura de dados." },
] as const;

type MemoryCard = { id: string; pairId: string; kind: "term" | "clue"; label: string };

const CARDS: MemoryCard[] = [
  { id: "term-crase", pairId: "crase", kind: "term", label: PAIRS[0].term },
  { id: "clue-atos", pairId: "atos", kind: "clue", label: PAIRS[2].clue },
  { id: "term-logica", pairId: "logica", kind: "term", label: PAIRS[1].term },
  { id: "clue-crase", pairId: "crase", kind: "clue", label: PAIRS[0].clue },
  { id: "term-seguranca", pairId: "seguranca", kind: "term", label: PAIRS[3].term },
  { id: "clue-logica", pairId: "logica", kind: "clue", label: PAIRS[1].clue },
  { id: "term-atos", pairId: "atos", kind: "term", label: PAIRS[2].term },
  { id: "clue-seguranca", pairId: "seguranca", kind: "clue", label: PAIRS[3].clue },
];

export function MemoryMatchGame({ onExit }: { onExit: () => void }) {
  const reduced = Boolean(useReducedMotion());
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [completed, setCompleted] = useState(false);
  const awarded = useRef(false);
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const rewardXp = Math.max(24, 78 - Math.max(0, moves - 4) * 4);
  const rewardCoins = Math.max(5, 14 - Math.max(0, moves - 4));

  useEffect(() => {
    if (matched.length !== PAIRS.length || completed) return;
    setCompleted(true);
    if (!awarded.current) {
      awarded.current = true;
      const won = journey.premiar(`par-perfeito-${todayKey}`, rewardXp, rewardCoins);
      setShowReward(won);
      soundEngine.play(won ? "reward" : "level");
    }
  }, [completed, matched.length, rewardCoins, rewardXp, todayKey]);

  const choose = (card: MemoryCard) => {
    if (locked || open.includes(card.id) || matched.includes(card.pairId) || completed) return;
    if (open.length === 0) {
      setOpen([card.id]);
      soundEngine.play("tap");
      return;
    }
    const first = CARDS.find((item) => item.id === open[0])!;
    setMoves((current) => current + 1);
    setOpen([first.id, card.id]);
    if (first.pairId === card.pairId && first.kind !== card.kind) {
      setMatched((items) => [...items, card.pairId]);
      setTimeout(() => setOpen([]), reduced ? 120 : 520);
      soundEngine.play("correct");
    } else {
      setLocked(true);
      soundEngine.play("wrong");
      setTimeout(
        () => {
          setOpen([]);
          setLocked(false);
        },
        reduced ? 280 : 900,
      );
    }
  };

  const restart = () => {
    setOpen([]);
    setMatched([]);
    setMoves(0);
    setLocked(false);
    setCompleted(false);
    setShowReward(false);
    awarded.current = false;
    soundEngine.play("open");
  };

  return (
    <div className="memory-match-game">
      <header className="game-mode-bar">
        <button type="button" onClick={onExit}>
          <ArrowLeft /> todos os jogos
        </button>
        <span>
          <Layers3 /> PAR PERFEITO
        </span>
        <strong>
          {matched.length}/{PAIRS.length} pares · {moves} jogadas
        </strong>
      </header>

      {!completed ? (
        <section className="memory-match-board">
          <div className="memory-match-board__intro">
            <BrainCircuit />
            <div>
              <small>MEMÓRIA POR ASSOCIAÇÃO</small>
              <h2>Ligue o conceito à frase que faz a regra voltar.</h2>
            </div>
          </div>
          <div className="memory-match-grid">
            {CARDS.map((card, index) => {
              const visible = open.includes(card.id) || matched.includes(card.pairId);
              return (
                <motion.button
                  type="button"
                  key={card.id}
                  className={cn(
                    visible && "is-open",
                    matched.includes(card.pairId) && "is-matched",
                  )}
                  onClick={() => choose(card)}
                  initial={reduced ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.035 }}
                  aria-label={visible ? card.label : `Carta ${index + 1} fechada`}
                >
                  <span className="memory-match-card__back">
                    <Sparkles />
                    <b>{String(index + 1).padStart(2, "0")}</b>
                  </span>
                  <span className="memory-match-card__front">
                    <small>{card.kind === "term" ? "CONCEITO" : "REGRA-ÂNCORA"}</small>
                    <strong>{card.label}</strong>
                  </span>
                </motion.button>
              );
            })}
          </div>
        </section>
      ) : (
        <motion.section
          className="game-result-card"
          initial={reduced ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Trophy />
          <small>MAPA DE MEMÓRIA COMPLETO</small>
          <h2>{moves <= 6 ? "Associações afiadas." : "As regras encontraram seu lugar."}</h2>
          <p>
            Você conectou {PAIRS.length} conceitos em {moves} jogadas. Agora as frases-âncora entram
            na revisão.
          </p>
          <div>
            <span>
              <Zap /> +{rewardXp} XP
            </span>
            <span>
              <Coins /> +{rewardCoins}
            </span>
            <span>
              <Layers3 /> {PAIRS.length} pares
            </span>
          </div>
          <footer>
            <button type="button" onClick={restart}>
              <RotateCcw /> jogar novamente
            </button>
            <button type="button" className="arena-primary" onClick={onExit}>
              escolher outro jogo <ArrowRight />
            </button>
          </footer>
        </motion.section>
      )}

      <RewardBurst
        show={showReward}
        xp={rewardXp}
        coins={rewardCoins}
        title="Memória conectada"
        onClose={() => setShowReward(false)}
      />
    </div>
  );
}
