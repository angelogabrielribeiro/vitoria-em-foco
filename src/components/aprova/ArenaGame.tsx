import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  BookOpenCheck,
  BrainCircuit,
  Check,
  Coins,
  Crown,
  Flame,
  Gamepad2,
  Gauge,
  Layers3,
  Crosshair,
  RotateCcw,
  Sparkles,
  Swords,
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
import { MemoryMatchGame } from "./games/MemoryMatchGame";
import { TrapHunterGame } from "./games/TrapHunterGame";
import { QuestionExplanation } from "./QuestionExplanation";
import { soundEngine } from "./sound-engine";

type ArenaPhase = "intro" | "playing" | "result";
type ArenaMode = "hub" | "lightning" | "traps" | "memory";

const QUESTIONS_PER_ROUND = 5;
const ROUND_SECONDS = 60;

export function ArenaGame({ go }: { go: (screen: ExperienceScreen) => void }) {
  const state = useJourney();
  const reduced = Boolean(useReducedMotion());
  const [mode, setMode] = useState<ArenaMode>("hub");
  const [phase, setPhase] = useState<ArenaPhase>("intro");
  const [roundQuestions, setRoundQuestions] = useState(() =>
    QUESTOES.slice(0, QUESTIONS_PER_ROUND),
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [choice, setChoice] = useState<Alternativa["letra"] | null>(null);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [rewardWon, setRewardWon] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const awardHandled = useRef(false);

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const rewardXp = correct === 0 ? 0 : correct * 18 + bestCombo * 5;
  const rewardCoins = correct === 0 ? 0 : correct * 3 + bestCombo * 2;
  const question = roundQuestions[questionIndex]!;
  const progress = ((questionIndex + (choice ? 1 : 0)) / roundQuestions.length) * 100;

  const finishRound = useCallback(() => {
    setPhase("result");
    soundEngine.play("level");
  }, []);

  useEffect(() => {
    if (phase !== "playing" || choice) return;
    if (timeLeft <= 0) {
      finishRound();
      return;
    }
    const timer = window.setTimeout(() => setTimeLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [choice, finishRound, phase, timeLeft]);

  useEffect(() => {
    if (phase !== "result" || awardHandled.current) return;
    awardHandled.current = true;
    if (correct === 0) return;
    const won = journey.premiar(`arena-diaria-${todayKey}`, rewardXp, rewardCoins);
    setRewardWon(won);
    if (won) {
      setShowReward(true);
      soundEngine.play("reward");
    }
  }, [correct, phase, rewardCoins, rewardXp, todayKey]);

  const startRound = () => {
    const offset = Math.floor(Math.random() * QUESTOES.length);
    setRoundQuestions(
      Array.from(
        { length: QUESTIONS_PER_ROUND },
        (_, index) => QUESTOES[(offset + index * 3) % QUESTOES.length]!,
      ),
    );
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
    setMode("lightning");
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
      if (!state.cadernoErros.includes(question.id)) journey.alternarCadernoErro(question.id);
      soundEngine.play("wrong");
    }
  };

  const nextQuestion = () => {
    if (questionIndex >= roundQuestions.length - 1) finishRound();
    else {
      setQuestionIndex((value) => value + 1);
      setChoice(null);
    }
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
              <Swords /> PARQUE DE TREINO / CONHECIMENTO EM JOGO
            </span>
            <h1>
              Jogos
              <br />
              <em>com propósito.</em>
            </h1>
            <p>
              Velocidade, leitura de pegadinhas e memória por associação. Escolha o tipo de treino,
              entenda cada resposta e transforme domínio em XP e moedas de foco.
            </p>
          </div>
          <div className="arena-hero__stats">
            <div>
              <Gamepad2 />
              <strong>3</strong>
              <small>jogos reais</small>
            </div>
            <div>
              <BookOpenCheck />
              <strong>3x</strong>
              <small>mais explicação</small>
            </div>
            <div>
              <Coins />
              <strong>+XP</strong>
              <small>prêmio real</small>
            </div>
          </div>
        </section>

        <section
          className={cn("arena-console", mode === "hub" && "arena-console--hub")}
          aria-live="polite"
        >
          {mode === "hub" ? (
            <GameHub
              reduced={reduced}
              onSelect={(nextMode) => {
                setMode(nextMode);
                if (nextMode === "lightning") setPhase("intro");
                soundEngine.play("open");
              }}
            />
          ) : null}

          {mode === "traps" ? <TrapHunterGame onExit={() => setMode("hub")} /> : null}
          {mode === "memory" ? <MemoryMatchGame onExit={() => setMode("hub")} /> : null}

          {mode === "lightning" ? (
            <>
              <header className="game-mode-bar">
                <button type="button" onClick={() => setMode("hub")}>
                  <ArrowLeft /> todos os jogos
                </button>
                <span>
                  <Zap /> ARENA RELÂMPAGO
                </span>
                <strong>o tempo pausa enquanto você aprende</strong>
              </header>
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
                          {Math.max(0, roundQuestions.length - questionIndex - (choice ? 1 : 0))}{" "}
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
                          {
                            "--timer": `${(timeLeft / ROUND_SECONDS) * 360}deg`,
                          } as React.CSSProperties
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
                          GOLPE {String(questionIndex + 1).padStart(2, "0")} /{" "}
                          {roundQuestions.length}
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

                    {choice ? (
                      <QuestionExplanation
                        key={`${question.id}-${choice}`}
                        question={question}
                        selected={choice}
                        compact
                        onNext={nextQuestion}
                        nextLabel={
                          questionIndex === roundQuestions.length - 1
                            ? "fechar rodada"
                            : "entendi, próximo golpe"
                        }
                      />
                    ) : null}
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
                      {correct === 0
                        ? "Nenhuma recompensa foi consumida. Seus erros foram guardados e a revanche continua disponível."
                        : rewardWon
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
                        <strong>{Math.round((correct / roundQuestions.length) * 100)}%</strong>
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
                      <button type="button" onClick={() => setMode("hub")}>
                        <Gamepad2 /> outros jogos
                      </button>
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
            </>
          ) : null}
        </section>

        <section className="arena-season">
          <header>
            <span>CICLO DE DOMÍNIO / NÃO É SÓ PONTUAÇÃO</span>
            <h2>Cada jogo treina uma parte diferente da aprovação.</h2>
          </header>
          <div>
            {[
              ["01", "Detectar", "enxergue a pegadinha antes de responder", "CAÇA-PEGADINHA"],
              ["02", "Entender", "desmonte cada alternativa e teste a regra", "EXPLICAÇÃO GUIADA"],
              ["03", "Fixar", "conecte conceitos a frases-âncora", "PAR PERFEITO"],
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

function GameHub({
  reduced,
  onSelect,
}: {
  reduced: boolean;
  onSelect: (mode: Exclude<ArenaMode, "hub">) => void;
}) {
  const games = [
    {
      id: "lightning" as const,
      number: "01",
      Icon: Zap,
      title: "Arena Relâmpago",
      label: "VELOCIDADE + COMBO",
      description:
        "Cinco questões contra o tempo. O cronômetro pausa depois da resposta para você realmente entender.",
      reward: "até 115 XP",
      meta: "5 questões · 60s",
      tone: "#4ed9ff",
    },
    {
      id: "traps" as const,
      number: "02",
      Icon: Crosshair,
      title: "Caça-Pegadinha",
      label: "LEITURA DE BANCA",
      description:
        "Verdade ou armadilha? Use três vidas para detectar exageros, trocas de conceito e palavras absolutas.",
      reward: "até 90 XP",
      meta: "6 sinais · 3 vidas",
      tone: "#ff6b5f",
    },
    {
      id: "memory" as const,
      number: "03",
      Icon: Layers3,
      title: "Par Perfeito",
      label: "MEMÓRIA POR ASSOCIAÇÃO",
      description:
        "Vire as cartas e conecte cada conceito à regra-âncora que ajuda a recuperar o conteúdo na prova.",
      reward: "até 78 XP",
      meta: "4 pares · sem pressa",
      tone: "#ff68bf",
    },
  ];

  return (
    <div className="arena-games-hub">
      <header>
        <span>
          <Gamepad2 /> ESCOLHA SEU TREINO
        </span>
        <h2>Hoje você quer velocidade, leitura ou memória?</h2>
        <p>
          Todos os modos ensinam. Verde só aparece quando você acerta; cada jogo tem uma linguagem
          visual própria.
        </p>
      </header>
      <div className="arena-game-grid">
        {games.map(({ id, number, Icon, title, label, description, reward, meta, tone }, index) => (
          <motion.button
            type="button"
            key={id}
            className={`arena-game-card arena-game-card--${id}`}
            onClick={() => onSelect(id)}
            style={{ "--game-tone": tone } as React.CSSProperties}
            initial={reduced ? false : { opacity: 0, y: 32, rotate: index - 1 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            whileHover={reduced ? undefined : { y: -10, rotate: index === 1 ? 0.5 : -0.5 }}
          >
            <span>{number}</span>
            <Icon />
            <small>{label}</small>
            <h3>{title}</h3>
            <p>{description}</p>
            <div>
              <em>{meta}</em>
              <strong>
                <Coins /> {reward}
              </strong>
            </div>
            <b>
              jogar agora <ArrowRight />
            </b>
          </motion.button>
        ))}
      </div>
      <aside className="arena-game-loop">
        <BrainCircuit />
        <div>
          <small>COMO ISSO MELHORA SUA PROVA</small>
          <strong>Detecte a armadilha → entenda a regra → recupere sem olhar.</strong>
        </div>
        <span>
          <Sparkles /> bônus diário em cada modo
        </span>
      </aside>
    </div>
  );
}
