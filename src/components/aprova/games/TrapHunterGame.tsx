import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Coins,
  Crosshair,
  Heart,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Trophy,
  X,
  Zap,
} from "lucide-react";

import { journey } from "@/lib/journey";
import { cn } from "@/lib/utils";
import { RewardBurst } from "../CarnivalShell";
import { soundEngine } from "../sound-engine";

const TRAPS = [
  {
    area: "Constitucional",
    statement: "Direitos fundamentais são absolutos porque têm aplicação imediata.",
    answer: false,
    reason:
      "Aplicação imediata não significa ausência de limites. Direitos podem colidir e ser ponderados.",
    anchor: "Vale já, mas não vale tudo.",
  },
  {
    area: "Português",
    statement:
      "Em ‘começou a estudar’, o acento grave é proibido porque antes de verbo não há artigo.",
    answer: true,
    reason:
      "O infinitivo ‘estudar’ não aceita artigo feminino. Sem a soma a + a, não existe crase.",
    anchor: "Antes de verbo, crase manda lembranças — de longe.",
  },
  {
    area: "Administrativo",
    statement: "Todo ato administrativo possui autoexecutoriedade.",
    answer: false,
    reason: "A autoexecutoriedade só existe quando a lei autoriza ou há situação urgente.",
    anchor: "Atributo possível não é atributo universal.",
  },
  {
    area: "Raciocínio Lógico",
    statement: "Negar ‘todos estudaram’ produz ‘ninguém estudou’.",
    answer: false,
    reason: "Para negar o universal, basta um contraexemplo: pelo menos uma pessoa não estudou.",
    anchor: "Para derrubar ‘todos’, encontre um traidor.",
  },
  {
    area: "Informática",
    statement: "Phishing explora principalmente a confiança e a urgência sentida pela vítima.",
    answer: true,
    reason: "A isca falsa usa engenharia social para induzir clique ou entrega de dados.",
    anchor: "A tecnologia é a vara; a pressa é a isca.",
  },
  {
    area: "Servidores",
    statement: "A estabilidade nasce automaticamente no momento da posse.",
    answer: false,
    reason: "Ela exige três anos de efetivo exercício e avaliação especial de desempenho.",
    anchor: "Posse começa; três anos avaliados estabilizam.",
  },
] as const;

export function TrapHunterGame({ onExit }: { onExit: () => void }) {
  const reduced = Boolean(useReducedMotion());
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [phase, setPhase] = useState<"playing" | "result">("playing");
  const [showReward, setShowReward] = useState(false);
  const awarded = useRef(false);
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const trap = TRAPS[index]!;
  const hit = choice === trap.answer;
  const rewardXp = Math.max(12, score * 12 + lives * 4);
  const rewardCoins = Math.max(3, score * 2 + lives);

  const restart = () => {
    setIndex(0);
    setChoice(null);
    setScore(0);
    setLives(3);
    setStreak(0);
    setPhase("playing");
    setShowReward(false);
    awarded.current = false;
    soundEngine.play("open");
  };

  const answer = (value: boolean) => {
    if (choice !== null) return;
    const correct = value === trap.answer;
    setChoice(value);
    if (correct) {
      setScore((current) => current + 1);
      setStreak((current) => current + 1);
      soundEngine.play("correct");
    } else {
      setLives((current) => Math.max(0, current - 1));
      setStreak(0);
      soundEngine.play("wrong");
    }
  };

  const next = () => {
    const final = index === TRAPS.length - 1 || lives <= (hit ? 0 : 1);
    if (final) {
      setPhase("result");
      if (!awarded.current) {
        awarded.current = true;
        const won = journey.premiar(`caca-pegadinha-${todayKey}`, rewardXp, rewardCoins);
        setShowReward(won);
        soundEngine.play(won ? "reward" : "level");
      }
      return;
    }
    setIndex((current) => current + 1);
    setChoice(null);
  };

  return (
    <div className="trap-game">
      <header className="game-mode-bar">
        <button type="button" onClick={onExit}>
          <ArrowLeft /> todos os jogos
        </button>
        <span>
          <Crosshair /> CAÇA-PEGADINHA
        </span>
        <div aria-label={`${lives} vidas restantes`}>
          {Array.from({ length: 3 }, (_, heart) => (
            <Heart key={heart} className={heart < lives ? "is-live" : undefined} />
          ))}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {phase === "playing" ? (
          <motion.section
            key={trap.statement}
            className="trap-round"
            initial={reduced ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
          >
            <div className="trap-round__signal">
              <span>
                SINAL {String(index + 1).padStart(2, "0")} / {TRAPS.length}
              </span>
              <strong>{trap.area}</strong>
              <em>sequência x{Math.max(1, streak)}</em>
            </div>
            <ShieldAlert className="trap-round__icon" />
            <small>A BANCA AFIRMOU:</small>
            <h2>{trap.statement}</h2>
            <p>Decida se a frase é uma regra confiável ou uma armadilha bem escrita.</p>
            <div className="trap-round__choices">
              <button
                type="button"
                disabled={choice !== null}
                className={cn(choice === true && (hit ? "is-correct" : "is-wrong"))}
                onClick={() => answer(true)}
              >
                <Check /> é verdade
              </button>
              <button
                type="button"
                disabled={choice !== null}
                className={cn(choice === false && (hit ? "is-correct" : "is-wrong"))}
                onClick={() => answer(false)}
              >
                <X /> é pegadinha
              </button>
            </div>
            {choice !== null ? (
              <motion.aside
                className={cn("trap-verdict", hit ? "is-correct" : "is-wrong")}
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span>{hit ? <Sparkles /> : <ShieldAlert />}</span>
                <div>
                  <small>
                    {hit ? "VOCÊ ENXERGOU A BANCA" : "A ARMADILHA FUNCIONOU — AGORA NÃO MAIS"}
                  </small>
                  <p>{trap.reason}</p>
                  <strong>{trap.anchor}</strong>
                </div>
                <button type="button" onClick={next}>
                  {index === TRAPS.length - 1 || lives <= (hit ? 0 : 1)
                    ? "ver resultado"
                    : "próximo sinal"}{" "}
                  <ArrowRight />
                </button>
              </motion.aside>
            ) : null}
          </motion.section>
        ) : (
          <motion.section
            key="trap-result"
            className="game-result-card"
            initial={reduced ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Trophy />
            <small>RADAR DA BANCA CALIBRADO</small>
            <h2>{score >= 5 ? "Você fareja armadilhas." : "Seu radar ficou mais afiado."}</h2>
            <p>
              {score} de {TRAPS.length} pegadinhas identificadas. Cada erro agora tem uma
              frase-âncora para revisão.
            </p>
            <div>
              <span>
                <Zap /> +{rewardXp} XP
              </span>
              <span>
                <Coins /> +{rewardCoins}
              </span>
              <span>
                <Heart /> {lives} vidas
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
      </AnimatePresence>

      <RewardBurst
        show={showReward}
        xp={rewardXp}
        coins={rewardCoins}
        title="Radar calibrado"
        onClose={() => setShowReward(false)}
      />
    </div>
  );
}
