import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  Clock3,
  Coins,
  Crown,
  Flame,
  Gamepad2,
  Gauge,
  RotateCcw,
  Shield,
  Sparkles,
  Swords,
  Target,
  Trophy,
  X,
  Zap,
} from "lucide-react";

import type { Alternativa } from "@/data/types";
import { QUESTOES } from "@/data/mock/questoes";
import { journey, useJourney } from "@/lib/journey";
import { cn } from "@/lib/utils";
import { AppShell, RewardBurst } from "./CarnivalShell";
import type { ExperienceScreen } from "./experience";
import { soundEngine } from "./sound-engine";

type ArenaPhase = "intro" | "playing" | "result";

const ARENA_QUESTIONS = QUESTOES.slice(0, 5);
const ROUND_SECONDS = 60;

export function ArenaGame({ go }: { go: (screen: ExperienceScreen) => void }) {
  const state = useJourney();
  const reduced = Boolean(useReducedMotion());
  const [phase, setPhase] = useState<ArenaPhase>("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [choice, setChoice] = useState<Alternativa["letra"] | null>(null);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [rewardWon, setRewardWon] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const advanceTimer = useRef<number | null>(null);
  const awardHandled = useRef(false);

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const rewardXp = Math.max(20, correct * 18 + bestCombo * 5);
  const rewardCoins = Math.max(6, correct * 3 + bestCombo * 2);
  const question = ARENA_QUESTIONS[questionIndex]!;
  const answeredCorrectly = choice === question.correta;
  const progress = ((questionIndex + (choice ? 1 : 0)) / ARENA_QUESTIONS.length) * 100;

  const finishRound = useCallback(() => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
    setPhase("result");
    soundEngine.play("level");
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft <= 0) {
      finishRound();
      return;
    }
    const timer = window.setTimeout(() => setTimeLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [finishRound, phase, timeLeft]);

  useEffect(() => {
    if (phase !== "result" || awardHandled.current) return;
    awardHandled.current = true;
    const won = journey.premiar(`arena-diaria-${todayKey}`, rewardXp, rewardCoins);
    setRewardWon(won);
    if (won) {
      setShowReward(true);
      soundEngine.play("reward");
    }
  }, [phase, rewardCoins, rewardXp, todayKey]);

  useEffect(
    () => () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    },
    [],
  );

  const startRound = () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    awardHandled.current = false;
    setQuestionIndex(0);
    setChoice(null);
    setTimeLeft(ROUND_SECONDS);
    setScore(0);
    setCorrect(0);
    setCombo(0);
    setBestCombo(0);
    setRewardWon(false);
    setShowReward(false);
    setPhase("playing");
    soundEngine.play("open");
  };

  const answer = (letter: Alternativa["letra"]) => {
    if (choice || phase !== "playing") return;
    const hit = letter === question.correta;
    const nextCombo = hit ? combo + 1 : 0;
    setChoice(letter);
    setCombo(nextCombo);
    setBestCombo((value) => Math.max(value, nextCombo));
    if (hit) {
      setCorrect((value) => value + 1);
      setScore((value) => value + 100 + combo * 30 + Math.min(50, timeLeft));
      soundEngine.play("correct");
    } else {
      soundEngine.play("wrong");
    }

    advanceTimer.current = window.setTimeout(
      () => {
        if (questionIndex >= ARENA_QUESTIONS.length - 1) {
          finishRound();
        } else {
          setQuestionIndex((value) => value + 1);
          setChoice(null);
        }
      },
      reduced ? 280 : 1250,
    );
  };

  return (
    <AppShell current="arena" go={go} fullBleed>
      <div className="arena-page">
        <section className="arena-hero">
          <div className="arena-hero__field" aria-hidden="true">
            {Array.from({ length: 18 }, (_, index) => (
              <i key={index} style={{ "--arena-i": index } as React.CSSProperties} />
            ))}
            <span className="arena-hero__ring arena-hero__ring--one" />
            <span className="arena-hero__ring arena-hero__ring--two" />
          </div>
          <div className="arena-hero__copy">
            <span>
              <Swords /> MODO JOGO / DESAFIO DIÁRIO
            </span>
            <h1>
              Arena
              <br />
              <em>Relâmpago.</em>
            </h1>
            <p>
              Cinco decisões, sessenta segundos e uma banca tentando quebrar seu combo. Acerte, suba
              o multiplicador e transforme conhecimento em XP e moedas de foco.
            </p>
          </div>
          <div className="arena-hero__stats">
            <div>
              <Clock3 />
              <strong>60s</strong>
              <small>rodada</small>
            </div>
            <div>
              <Target />
              <strong>5</strong>
              <small>golpes</small>
            </div>
            <div>
              <Coins />
              <strong>+XP</strong>
              <small>prêmio real</small>
            </div>
          </div>
        </section>

        <section className="arena-console" aria-live="polite">
          <AnimatePresence mode="wait">
            {phase === "intro" ? (
              <motion.div
                key="arena-intro"
                className="arena-intro"
                initial={reduced ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
              >
                <div className="arena-intro__brief">
                  <span>
                    <Gamepad2 /> MISSÃO DISPONÍVEL
                  </span>
                  <h2>Derrube o chefão da banca antes do cronômetro zerar.</h2>
                  <p>
                    A explicação aparece depois de cada golpe. Errar não encerra a rodada — só
                    quebra o combo e marca o ponto para revisão.
                  </p>
                  <button type="button" className="arena-primary" onClick={startRound}>
                    entrar na arena <ArrowRight />
                  </button>
                </div>
                <div className="arena-intro__rules">
                  {[
                    [Flame, "Combo vivo", "Cada acerto seguido aumenta sua pontuação."],
                    [
                      BrainCircuit,
                      "Memória instantânea",
                      "Toda resposta libera uma regra de bolso.",
                    ],
                    [Trophy, "Prêmio diário", "A primeira rodada do dia rende XP e moedas."],
                  ].map(([Icon, title, text], index) => {
                    const RuleIcon = Icon as typeof Flame;
                    return (
                      <motion.article
                        key={String(title)}
                        initial={reduced ? false : { opacity: 0, x: 24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.35 }}
                        transition={{ delay: index * 0.08 }}
                      >
                        <RuleIcon />
                        <div>
                          <strong>{String(title)}</strong>
                          <p>{String(text)}</p>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              </motion.div>
            ) : null}

            {phase === "playing" ? (
              <motion.div
                key={`arena-question-${question.id}`}
                className="arena-battle"
                initial={reduced ? false : { opacity: 0, x: 36 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -28 }}
              >
                <header className="arena-battle__hud">
                  <div className="arena-boss">
                    <span>
                      <Crown /> CHEFÃO DA BANCA
                    </span>
                    <i>
                      <motion.b animate={{ width: `${100 - progress}%` }} />
                    </i>
                    <small>
                      {Math.max(0, ARENA_QUESTIONS.length - questionIndex - (choice ? 1 : 0))}{" "}
                      escudos
                    </small>
                  </div>
                  <div className="arena-combo">
                    <Flame />
                    <span>
                      <small>COMBO</small>
                      <strong>x{Math.max(1, combo)}</strong>
                    </span>
                  </div>
                  <div
                    className={cn("arena-timer", timeLeft <= 15 && "is-critical")}
                    style={
                      { "--timer": `${(timeLeft / ROUND_SECONDS) * 360}deg` } as React.CSSProperties
                    }
                    aria-label={`${timeLeft} segundos restantes`}
                  >
                    <strong>{timeLeft}</strong>
                    <small>SEG</small>
                  </div>
                </header>

                <div className="arena-question">
                  <div className="arena-question__meta">
                    <span>
                      GOLPE {String(questionIndex + 1).padStart(2, "0")} / {ARENA_QUESTIONS.length}
                    </span>
                    <em>{question.disciplina}</em>
                    <b>{question.nivel}</b>
                  </div>
                  <h2>{question.enunciado}</h2>
                  <div className="arena-answers">
                    {question.alternativas.map((alternative) => {
                      const selected = choice === alternative.letra;
                      const isCorrect = choice && alternative.letra === question.correta;
                      const isWrong = selected && !isCorrect;
                      return (
                        <motion.button
                          type="button"
                          key={alternative.letra}
                          disabled={Boolean(choice)}
                          onClick={() => answer(alternative.letra)}
                          className={cn(
                            selected && "is-selected",
                            isCorrect && "is-correct",
                            isWrong && "is-wrong",
                          )}
                          whileHover={choice || reduced ? undefined : { x: 7 }}
                          whileTap={choice || reduced ? undefined : { scale: 0.985 }}
                        >
                          <span>{alternative.letra}</span>
                          <strong>{alternative.texto}</strong>
                          <i>{isCorrect ? <Check /> : isWrong ? <X /> : <ArrowRight />}</i>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <AnimatePresence>
                  {choice ? (
                    <motion.aside
                      className={cn(
                        "arena-feedback",
                        answeredCorrectly ? "is-correct" : "is-wrong",
                      )}
                      initial={reduced ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      {answeredCorrectly ? <Sparkles /> : <Shield />}
                      <div>
                        <strong>
                          {answeredCorrectly ? "Golpe certeiro." : "A banca defendeu."}
                        </strong>
                        <p>{question.memoria ?? question.explicacao}</p>
                      </div>
                      <span>
                        {answeredCorrectly
                          ? `+${100 + Math.max(0, combo - 1) * 30 + Math.min(50, timeLeft)} pts`
                          : "combo zerado"}
                      </span>
                    </motion.aside>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            ) : null}

            {phase === "result" ? (
              <motion.div
                key="arena-result"
                className="arena-result"
                initial={reduced ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="arena-result__medal" aria-hidden="true">
                  <Trophy />
                  <i />
                </div>
                <span>RODADA CONCLUÍDA / ROTA ATUALIZADA</span>
                <h2>
                  {correct >= 4
                    ? "Você desmontou a banca."
                    : "A arena registrou seus pontos cegos."}
                </h2>
                <p>
                  {rewardWon
                    ? "A recompensa caiu na sua central e os erros viraram sinal para a próxima revisão."
                    : "A recompensa diária já foi coletada, mas você pode jogar de novo para melhorar o placar."}
                </p>
                <div className="arena-result__score">
                  <div>
                    <small>PLACAR</small>
                    <strong>{score}</strong>
                  </div>
                  <div>
                    <small>PRECISÃO</small>
                    <strong>{Math.round((correct / ARENA_QUESTIONS.length) * 100)}%</strong>
                  </div>
                  <div>
                    <small>MAIOR COMBO</small>
                    <strong>x{bestCombo}</strong>
                  </div>
                </div>
                <div className="arena-result__reward">
                  <span>
                    <Zap /> +{rewardXp} XP
                  </span>
                  <span>
                    <Coins /> +{rewardCoins}
                  </span>
                  <span>
                    <Gauge /> nível {state.nivel}
                  </span>
                </div>
                <div className="arena-result__actions">
                  <button type="button" onClick={startRound}>
                    <RotateCcw /> jogar novamente
                  </button>
                  <button type="button" className="arena-primary" onClick={() => go("study")}>
                    revisar na sala <ArrowRight />
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>

        <section className="arena-season">
          <header>
            <span>TEMPORADA 01 / CAMINHO DO CANDIDATO</span>
            <h2>Cada rodada abre uma parte do mapa.</h2>
          </header>
          <div>
            {[
              ["01", "Aquecimento", "3 acertos", "liberado"],
              ["02", "Banca em fúria", "combo x3", "em rota"],
              ["03", "Chefão semanal", "5 acertos", "bloqueado"],
            ].map(([number, title, requirement, status], index) => (
              <motion.article
                key={number}
                initial={reduced ? false : { opacity: 0, y: 34, rotate: index - 1 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.12 }}
              >
                <span>{number}</span>
                <Gamepad2 />
                <div>
                  <small>{status}</small>
                  <h3>{title}</h3>
                  <p>{requirement}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      </div>

      <RewardBurst
        show={showReward}
        xp={rewardXp}
        coins={rewardCoins}
        title="Arena dominada"
        onClose={() => setShowReward(false)}
      />
    </AppShell>
  );
}
