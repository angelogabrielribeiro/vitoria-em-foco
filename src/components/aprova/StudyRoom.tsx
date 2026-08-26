import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  BookOpen,
  Brain,
  CalendarRange,
  Check,
  ChevronLeft,
  ChevronRight,
  CirclePause,
  Clock3,
  Coins,
  Eye,
  FileQuestion,
  Flame,
  Gamepad2,
  Headphones,
  Layers3,
  Lightbulb,
  ListChecks,
  Map,
  Mic2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Star,
  Target,
  Trophy,
  Volume2,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";

import type { Alternativa, Questao } from "@/data/types";
import {
  CRASE_SCENES,
  MEMORY_CARDS,
  TODAY_PLAYLIST,
  type LearningActivity,
} from "@/data/mock/content";
import { DIAGNOSTICO, getQuestao } from "@/data/mock/questoes";
import { journey, useJourney } from "@/lib/journey";
import { cn } from "@/lib/utils";
import { AppShell, RewardBurst } from "./CarnivalShell";
import type { ExperienceScreen } from "./experience";
import { LivingShader } from "./LivingShader";
import { soundEngine } from "./sound-engine";

type StudyMode = "mission" | "diagnostic" | "question";

const ACTIVITY_ICON = {
  explicacao: WandSparkles,
  mapa: Map,
  flashcards: Layers3,
  questoes: Gamepad2,
  audio: AudioLines,
  simulado: Trophy,
};

export function StudyRoom({
  go,
  mode = "mission",
  questionId,
}: {
  go: (screen: ExperienceScreen) => void;
  mode?: StudyMode;
  questionId?: string;
}) {
  const state = useJourney();
  const [activeId, setActiveId] = useState(
    mode === "question"
      ? "battle-crase"
      : (TODAY_PLAYLIST.find((item) => !state.atividadesConcluidas.includes(item.id))?.id ??
          TODAY_PLAYLIST[0]!.id),
  );
  const [reward, setReward] = useState<{ xp: number; coins: number; title: string } | null>(null);
  const activity = TODAY_PLAYLIST.find((item) => item.id === activeId) ?? TODAY_PLAYLIST[0]!;
  const completedCount = TODAY_PLAYLIST.filter((item) =>
    state.atividadesConcluidas.includes(item.id),
  ).length;
  const earnedXp = TODAY_PLAYLIST.filter((item) =>
    state.atividadesConcluidas.includes(item.id),
  ).reduce((sum, item) => sum + item.xp, 0);

  const complete = (item: LearningActivity) => {
    const won = journey.concluirAtividade(item.id, item.xp, item.coins);
    if (won) {
      soundEngine.play("reward");
      setReward({ xp: item.xp, coins: item.coins, title: item.title });
      if (typeof navigator !== "undefined" && "vibrate" in navigator)
        navigator.vibrate?.([24, 45, 44]);
    }
  };

  if (mode === "diagnostic") {
    return <DiagnosticExpedition go={go} />;
  }

  return (
    <AppShell current="study" go={go} fullBleed>
      <div className="study-room">
        <aside className="mission-playlist">
          <div className="mission-playlist__head">
            <span>MISSÃO DO DIA</span>
            <strong>
              {completedCount}/{TODAY_PLAYLIST.length}
            </strong>
            <i>
              <b style={{ width: `${(completedCount / TODAY_PLAYLIST.length) * 100}%` }} />
            </i>
            <small>{earnedXp} XP conquistados hoje</small>
          </div>
          <nav aria-label="Atividades da missão">
            {TODAY_PLAYLIST.map((item, index) => {
              const Icon = ACTIVITY_ICON[item.kind];
              const completed = state.atividadesConcluidas.includes(item.id);
              return (
                <button
                  type="button"
                  key={item.id}
                  className={cn(activeId === item.id && "is-active", completed && "is-complete")}
                  onClick={() => setActiveId(item.id)}
                >
                  <span>{completed ? <Check /> : <Icon />}</span>
                  <div>
                    <small>
                      {String(index + 1).padStart(2, "0")} · {item.eyebrow}
                    </small>
                    <strong>{item.title}</strong>
                    <em>
                      {item.duration} min · +{item.xp} XP
                    </em>
                  </div>
                  <ChevronRight />
                </button>
              );
            })}
          </nav>
          <footer>
            <Flame fill="currentColor" />
            <span>
              <strong>Sequência protegida</strong>
              <small>Conclua 1 bloco para manter o dia.</small>
            </span>
          </footer>
        </aside>

        <main className="study-stage">
          <header className="study-stage__topbar">
            <button type="button" onClick={() => go("dashboard")}>
              <ArrowLeft /> sair da sala
            </button>
            <span>
              <Clock3 /> sessão flexível · seu progresso é salvo
            </span>
            <div>
              <strong>
                <Zap /> +{activity.xp} XP
              </strong>
              <strong>
                <Coins /> +{activity.coins}
              </strong>
            </div>
          </header>
          <AnimatePresence mode="wait">
            <motion.div
              key={activity.id}
              className="study-stage__content"
              initial={{ opacity: 0, x: 22 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
            >
              {activity.kind === "explicacao" ? (
                <StoryLesson activity={activity} complete={() => complete(activity)} />
              ) : null}
              {activity.kind === "mapa" ? (
                <LivingMap activity={activity} complete={() => complete(activity)} />
              ) : null}
              {activity.kind === "flashcards" ? (
                <MemoryDeck activity={activity} complete={() => complete(activity)} />
              ) : null}
              {activity.kind === "questoes" ? (
                <QuestionBattle
                  activity={activity}
                  {...(questionId ? { initialQuestionId: questionId } : {})}
                  complete={() => complete(activity)}
                />
              ) : null}
              {activity.kind === "audio" ? (
                <AudioRevision activity={activity} complete={() => complete(activity)} />
              ) : null}
              {activity.kind === "simulado" ? (
                <MiniSimulation activity={activity} complete={() => complete(activity)} />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <AnimatePresence>
        {reward ? (
          <RewardBurst
            show
            xp={reward.xp}
            coins={reward.coins}
            title={reward.title}
            onClose={() => setReward(null)}
          />
        ) : null}
      </AnimatePresence>
    </AppShell>
  );
}

function ActivityHeader({ activity, progress }: { activity: LearningActivity; progress: number }) {
  const Icon = ACTIVITY_ICON[activity.kind];
  return (
    <div className="activity-header">
      <div>
        <span>
          <Icon />
        </span>
        <div>
          <small>
            {activity.eyebrow} · {activity.discipline}
          </small>
          <h1>{activity.title}</h1>
          <p>{activity.description}</p>
        </div>
      </div>
      <div className="activity-header__progress">
        <i>
          <b style={{ width: `${progress}%` }} />
        </i>
        <span>{Math.round(progress)}%</span>
      </div>
    </div>
  );
}

function StoryLesson({ activity, complete }: { activity: LearningActivity; complete: () => void }) {
  const [scene, setScene] = useState(0);
  const current = CRASE_SCENES[scene] ?? CRASE_SCENES[0]!;
  const last = scene === CRASE_SCENES.length - 1;
  return (
    <div className="story-lesson">
      <ActivityHeader activity={activity} progress={((scene + 1) / CRASE_SCENES.length) * 100} />
      <section className="concept-theater">
        <LivingShader energy={0.62 + scene * 0.16} />
        <div className="concept-theater__counter">
          CENA {String(scene + 1).padStart(2, "0")} / 04
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            className="concept-theater__scene"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <span>{current.kicker}</span>
            <h2>{current.title}</h2>
            <p>{current.body}</p>
            <motion.strong
              key={current.formula}
              initial={{ letterSpacing: "0.45em", filter: "blur(7px)" }}
              animate={{ letterSpacing: "0.08em", filter: "blur(0px)" }}
              transition={{ duration: 0.75 }}
            >
              {current.formula}
            </motion.strong>
            <em>
              <Lightbulb /> {current.note}
            </em>
          </motion.div>
        </AnimatePresence>
        <div className="concept-theater__orbit" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      </section>
      <div className="lesson-controls">
        <button
          type="button"
          disabled={scene === 0}
          onClick={() => setScene((value) => Math.max(0, value - 1))}
        >
          <ChevronLeft /> cena anterior
        </button>
        <div>
          {CRASE_SCENES.map((item, index) => (
            <button
              type="button"
              key={item.id}
              aria-label={`Ir para cena ${index + 1}`}
              className={index === scene ? "is-active" : undefined}
              onClick={() => setScene(index)}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            if (last) complete();
            else setScene((value) => value + 1);
          }}
        >
          {last ? "Fixei a ideia" : "próxima cena"} <ArrowRight />
        </button>
      </div>
    </div>
  );
}

const MAP_NODES = [
  {
    id: "competencia",
    label: "Competência",
    detail: "Quem pode praticar o ato? A regra nasce na lei e não se presume.",
  },
  {
    id: "finalidade",
    label: "Finalidade",
    detail: "Todo ato aponta para o interesse público previsto na norma.",
  },
  {
    id: "forma",
    label: "Forma",
    detail: "É o modo de exteriorização. Em regra, a Administração escreve.",
  },
  {
    id: "motivo",
    label: "Motivo",
    detail: "São os fatos e fundamentos jurídicos que empurram a decisão.",
  },
  { id: "objeto", label: "Objeto", detail: "É o efeito jurídico imediato produzido pelo ato." },
];

function LivingMap({ activity, complete }: { activity: LearningActivity; complete: () => void }) {
  const [opened, setOpened] = useState<string[]>([]);
  const active = MAP_NODES.find((node) => node.id === opened.at(-1));
  const toggle = (id: string) =>
    setOpened((items) =>
      items.includes(id) ? items.filter((item) => item !== id) : [...items, id],
    );
  return (
    <div className="living-map">
      <ActivityHeader activity={activity} progress={(opened.length / MAP_NODES.length) * 100} />
      <section className="map-board">
        <div className="map-board__center">
          <span>ATO</span>
          <strong>administrativo</strong>
          <i />
        </div>
        {MAP_NODES.map((node, index) => (
          <motion.button
            type="button"
            key={node.id}
            className={cn(`map-node map-node--${index + 1}`, opened.includes(node.id) && "is-open")}
            onClick={() => toggle(node.id)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.96 }}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{node.label}</strong>
            <i />
          </motion.button>
        ))}
        <AnimatePresence>
          {active ? (
            <motion.div
              className="map-insight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <button type="button" onClick={() => toggle(active.id)}>
                <X />
              </button>
              <small>NÓ ABERTO</small>
              <h2>{active.label}</h2>
              <p>{active.detail}</p>
              <em>
                <Brain /> explique com suas palavras antes de fechar
              </em>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>
      <button
        type="button"
        className="complete-activity"
        disabled={opened.length < MAP_NODES.length}
        onClick={complete}
      >
        {opened.length < MAP_NODES.length
          ? `Abra mais ${MAP_NODES.length - opened.length} nós`
          : "Mapa dominado"}{" "}
        <Check />
      </button>
    </div>
  );
}

function MemoryDeck({ activity, complete }: { activity: LearningActivity; complete: () => void }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<string[]>([]);
  const card = MEMORY_CARDS[index] ?? MEMORY_CARDS[0]!;
  const answer = (didKnow: boolean) => {
    if (didKnow && !known.includes(card.front)) setKnown((items) => [...items, card.front]);
    if (index === MEMORY_CARDS.length - 1) complete();
    else {
      setIndex((value) => value + 1);
      setFlipped(false);
    }
  };
  return (
    <div className="memory-deck">
      <ActivityHeader activity={activity} progress={(index / MEMORY_CARDS.length) * 100} />
      <div className="memory-table">
        <span className="memory-table__label">
          CARTA {String(index + 1).padStart(2, "0")} /{" "}
          {String(MEMORY_CARDS.length).padStart(2, "0")}
        </span>
        <button
          type="button"
          className={cn("memory-card", flipped && "is-flipped")}
          onClick={() => setFlipped((value) => !value)}
        >
          <motion.span animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.48 }}>
            <span className="memory-card__front">
              <small>COMPLETE SEM OLHAR</small>
              <strong>{card.front}</strong>
              <em>
                <Eye /> toque para revelar
              </em>
            </span>
            <span className="memory-card__back">
              <small>RESPOSTA + GATILHO</small>
              <strong>{card.back}</strong>
              <em>
                <RotateCcw /> toque para virar
              </em>
            </span>
          </motion.span>
        </button>
        <div className="memory-actions">
          <button type="button" disabled={!flipped} onClick={() => answer(false)}>
            <RotateCcw /> revisar de novo
          </button>
          <button type="button" disabled={!flipped} onClick={() => answer(true)}>
            acertei em voz alta <Check />
          </button>
        </div>
        <p>{known.length} respostas firmes · errar aqui é parte do treino</p>
      </div>
    </div>
  );
}

function QuestionBattle({
  activity,
  initialQuestionId,
  complete,
}: {
  activity: LearningActivity;
  initialQuestionId?: string;
  complete: () => void;
}) {
  const journeyState = useJourney();
  const questions = useMemo(() => {
    if (!initialQuestionId) return DIAGNOSTICO.slice(0, 8);
    const first = getQuestao(initialQuestionId);
    return first
      ? [first, ...DIAGNOSTICO.filter((question) => question.id !== first.id).slice(0, 7)]
      : DIAGNOSTICO.slice(0, 8);
  }, [initialQuestionId]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Alternativa["letra"] | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [explanationTab, setExplanationTab] = useState<"direta" | "cena" | "distratores">("direta");
  const question = questions[index] ?? questions[0]!;
  const savedInNotebook = journeyState.cadernoErros.includes(question.id);
  const correct = selected === question.correta;
  const submit = () => {
    if (!selected) return;
    setSubmitted(true);
    if (correct) {
      setScore((value) => value + 1);
      soundEngine.play("correct");
    } else soundEngine.play("wrong");
  };
  const next = () => {
    if (index === questions.length - 1) complete();
    else {
      setIndex((value) => value + 1);
      setSelected(null);
      setSubmitted(false);
      setExplanationTab("direta");
    }
  };
  return (
    <div className="question-battle">
      <ActivityHeader
        activity={activity}
        progress={((index + (submitted ? 1 : 0)) / questions.length) * 100}
      />
      <div className="battle-score">
        <span>
          <Target /> QUESTÃO {String(index + 1).padStart(2, "0")} /{" "}
          {String(questions.length).padStart(2, "0")}
        </span>
        <strong>{score} ACERTOS</strong>
        <em>
          {question.disciplina} · {question.topico}
        </em>
      </div>
      <section className="battle-card">
        <h2>{question.enunciado}</h2>
        <div>
          {question.alternativas.map((answer) => {
            const isCorrect = submitted && answer.letra === question.correta;
            const isWrong = submitted && answer.letra === selected && !correct;
            return (
              <button
                type="button"
                key={answer.letra}
                disabled={submitted}
                className={cn(
                  selected === answer.letra && "is-selected",
                  isCorrect && "is-correct",
                  isWrong && "is-wrong",
                )}
                onClick={() => setSelected(answer.letra)}
              >
                <span>{isCorrect ? <Check /> : isWrong ? <X /> : answer.letra}</span>
                <p>{answer.texto}</p>
              </button>
            );
          })}
        </div>
      </section>
      {!submitted ? (
        <button type="button" className="battle-submit" disabled={!selected} onClick={submit}>
          travar resposta <Target />
        </button>
      ) : (
        <motion.section
          className={cn("creative-explanation", correct ? "is-correct" : "is-wrong")}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          role="status"
        >
          <header>
            <span>{correct ? <Check /> : <Brain />}</span>
            <div>
              <small>{correct ? "ACERTO CONFIRMADO" : "ERRO TRANSFORMADO EM MEMÓRIA"}</small>
              <h3>{correct ? "Na mira." : "Vamos desmontar a armadilha."}</h3>
            </div>
          </header>
          <nav>
            <button
              type="button"
              className={explanationTab === "direta" ? "is-active" : undefined}
              onClick={() => setExplanationTab("direta")}
            >
              regra direta
            </button>
            <button
              type="button"
              className={explanationTab === "cena" ? "is-active" : undefined}
              onClick={() => setExplanationTab("cena")}
            >
              explica em cena
            </button>
            <button
              type="button"
              className={explanationTab === "distratores" ? "is-active" : undefined}
              onClick={() => setExplanationTab("distratores")}
            >
              por que as outras caem
            </button>
          </nav>
          {explanationTab === "direta" ? <p>{question.explicacao}</p> : null}
          {explanationTab === "cena" ? (
            <div className="explanation-scene">
              <span>A</span>
              <i>+</i>
              <span>A</span>
              <motion.b animate={{ scale: [0.6, 1.2, 1], rotate: [0, -4, 0] }}>À</motion.b>
              <p>
                {question.memoria ??
                  "Transforme a regra em uma imagem e teste com uma substituição."}
              </p>
            </div>
          ) : null}
          {explanationTab === "distratores" ? (
            <div className="distractor-grid">
              {question.alternativas
                .filter((answer) => answer.letra !== question.correta)
                .map((answer) => (
                  <div key={answer.letra}>
                    <span>{answer.letra}</span>
                    <p>
                      {answer.letra === selected
                        ? "Esta opção usa exatamente a armadilha mais provável: aplica a regra sem testar a função da palavra."
                        : "Parece possível à primeira leitura, mas falha quando fazemos o teste de substituição."}
                    </p>
                  </div>
                ))}
            </div>
          ) : null}
          <footer>
            <button
              type="button"
              className={savedInNotebook ? "is-saved" : undefined}
              aria-pressed={savedInNotebook}
              onClick={() => {
                journey.alternarCadernoErro(question.id);
                soundEngine.play("tap");
              }}
            >
              <Star fill={savedInNotebook ? "currentColor" : "none"} />
              {savedInNotebook ? "salvo no caderno" : "salvar no caderno de erros"}
            </button>
            <button type="button" onClick={next}>
              {index === questions.length - 1 ? "encerrar batalha" : "próxima questão"}{" "}
              <ArrowRight />
            </button>
          </footer>
        </motion.section>
      )}
    </div>
  );
}

function AudioRevision({
  activity,
  complete,
}: {
  activity: LearningActivity;
  complete: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const text =
    "Atos administrativos. Pare por um instante e responda: quais são os cinco elementos? Competência, finalidade, forma, motivo e objeto. Agora imagine um ato sem motivo declarado. A ausência pode revelar um vício. Repita os cinco elementos antes de continuar.";
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setProgress((value) => Math.min(100, value + 2)), 320);
    return () => window.clearInterval(timer);
  }, [playing]);
  useEffect(() => {
    if (progress >= 100) {
      setPlaying(false);
      window.speechSynthesis?.cancel();
    }
  }, [progress]);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  const toggle = () => {
    if (playing) {
      window.speechSynthesis?.cancel();
      setPlaying(false);
      return;
    }
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = 0.92;
      utterance.pitch = 0.94;
      utterance.onend = () => setProgress(100);
      window.speechSynthesis.speak(utterance);
    }
    setPlaying(true);
  };
  const seek = (amount: number) => {
    window.speechSynthesis?.cancel();
    setPlaying(false);
    setProgress((value) => Math.max(0, Math.min(100, value + amount)));
  };
  const elapsed = Math.round((progress / 100) * 492);
  const elapsedLabel = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(
    elapsed % 60,
  ).padStart(2, "0")}`;
  return (
    <div className="audio-revision">
      <ActivityHeader activity={activity} progress={progress} />
      <section className="audio-console">
        <LivingShader energy={playing ? 1.18 : 0.45} />
        <div className="audio-console__head">
          <Headphones />
          <span>
            <small>FAIXA 01 · REVISÃO GUIADA</small>
            <strong>Atos administrativos em movimento</strong>
          </span>
          <em>08:12</em>
        </div>
        <div className={cn("audio-wave", playing && "is-playing")} aria-hidden="true">
          {Array.from({ length: 58 }, (_, index) => (
            <i
              key={index}
              style={{ "--h": `${22 + ((index * 37) % 72)}%` } as React.CSSProperties}
            />
          ))}
        </div>
        <div className="audio-console__controls">
          <button type="button" aria-label="Voltar 15 segundos" onClick={() => seek(-3.05)}>
            <RotateCcw />
          </button>
          <button type="button" className="audio-play" onClick={toggle}>
            {playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
          </button>
          <button type="button" aria-label="Avançar 15 segundos" onClick={() => seek(3.05)}>
            <ChevronRight />
          </button>
        </div>
        <div className="audio-console__timeline">
          <span>{elapsedLabel}</span>
          <i>
            <b style={{ width: `${progress}%` }} />
          </i>
          <span>08:12</span>
        </div>
        <button
          type="button"
          className="audio-transcript"
          aria-expanded={transcriptOpen}
          onClick={() => setTranscriptOpen((value) => !value)}
        >
          <BookOpen /> {transcriptOpen ? "fechar transcrição" : "abrir transcrição sincronizada"}
        </button>
        <AnimatePresence>
          {transcriptOpen ? (
            <motion.div
              className="audio-transcript__panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
            >
              <small>TRANSCRIÇÃO · ACOMPANHE E RESPONDA NAS PAUSAS</small>
              <p>{text}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>
      <button
        type="button"
        className="complete-activity"
        disabled={progress < 65}
        onClick={complete}
      >
        Marcar revisão como concluída <Check />
      </button>
    </div>
  );
}

function MiniSimulation({
  activity,
  complete,
}: {
  activity: LearningActivity;
  complete: () => void;
}) {
  const [started, setStarted] = useState(false);
  const [answered, setAnswered] = useState(0);
  const [confidence, setConfidence] = useState<"chute" | "duvida" | "seguro" | null>(null);
  const [paused, setPaused] = useState(false);
  const [remaining, setRemaining] = useState(18 * 60);
  useEffect(() => {
    if (!started || paused || remaining <= 0) return;
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [paused, remaining, started]);
  const remainingLabel = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(
    remaining % 60,
  ).padStart(2, "0")}`;
  if (!started) {
    return (
      <div className="mini-simulation">
        <ActivityHeader activity={activity} progress={0} />
        <section className="simulation-gate">
          <LivingShader energy={0.9} />
          <Target />
          <span>CHECKPOINT 01</span>
          <h2>
            10 itens.
            <br />
            18 minutos.
            <br />
            Uma leitura honesta.
          </h2>
          <div>
            <p>
              <Clock3 /> timer opcional
            </p>
            <p>
              <Brain /> dificuldade adaptativa
            </p>
            <p>
              <Trophy /> relatório final
            </p>
          </div>
          <button type="button" onClick={() => setStarted(true)}>
            iniciar checkpoint <Play fill="currentColor" />
          </button>
        </section>
      </div>
    );
  }
  return (
    <div className="mini-simulation">
      <ActivityHeader activity={activity} progress={(answered / 10) * 100} />
      <section className="simulation-running">
        <header>
          <span>
            <Clock3 /> {remainingLabel}
          </span>
          <strong>ITEM {String(answered + 1).padStart(2, "0")} / 10</strong>
          <button
            type="button"
            aria-label={paused ? "Retomar cronômetro" : "Pausar cronômetro"}
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? <Play /> : <CirclePause />}
          </button>
        </header>
        <div className="simulation-target">
          <Target />
          <i />
        </div>
        <h2>
          Marque sua segurança antes de responder. Isso ajuda o plano a diferenciar dúvida de
          distração.
        </h2>
        <div className="confidence">
          <button
            type="button"
            className={confidence === "chute" ? "is-active" : undefined}
            onClick={() => setConfidence("chute")}
          >
            chute
          </button>
          <button
            type="button"
            className={confidence === "duvida" ? "is-active" : undefined}
            onClick={() => setConfidence("duvida")}
          >
            em dúvida
          </button>
          <button
            type="button"
            className={confidence === "seguro" ? "is-active" : undefined}
            onClick={() => setConfidence("seguro")}
          >
            seguro
          </button>
        </div>
        <button
          type="button"
          className="simulation-answer"
          disabled={!confidence || paused}
          onClick={() => {
            if (answered >= 9) complete();
            else {
              setAnswered((value) => value + 1);
              setConfidence(null);
            }
          }}
        >
          {answered >= 9 ? "finalizar simulado" : "registrar e avançar"} <ArrowRight />
        </button>
      </section>
    </div>
  );
}

function DiagnosticExpedition({ go }: { go: (screen: ExperienceScreen) => void }) {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Alternativa["letra"] | null>(null);
  const [answers, setAnswers] = useState<{ id: string; correct: boolean }[]>([]);
  const question = DIAGNOSTICO[index] ?? DIAGNOSTICO[0]!;
  const finished = answers.length === DIAGNOSTICO.length;
  if (!started) {
    return (
      <AppShell current="study" go={go} fullBleed>
        <section className="diagnostic-gate">
          <LivingShader energy={0.88} />
          <button type="button" onClick={() => go("dashboard")}>
            <ArrowLeft /> fazer depois
          </button>
          <div>
            <span>CALIBRAÇÃO / 10 SINAIS</span>
            <h1>Antes do plano, vamos descobrir como você pensa.</h1>
            <p>
              Não é uma prova aleatória. Cada item mede um eixo do edital e muda a proporção de
              teoria, revisão e questões no cronograma.
            </p>
            <div>
              <strong>
                <Brain /> 4 disciplinas
              </strong>
              <strong>
                <Clock3 /> cerca de 8 min
              </strong>
              <strong>
                <Sparkles /> feedback ao final
              </strong>
            </div>
            <button type="button" onClick={() => setStarted(true)}>
              começar calibração <ArrowRight />
            </button>
          </div>
        </section>
      </AppShell>
    );
  }
  if (finished) {
    const correct = answers.filter((answer) => answer.correct).length;
    return (
      <AppShell current="study" go={go} fullBleed>
        <section className="diagnostic-result">
          <LivingShader energy={1.1} />
          <div>
            <Trophy />
            <span>MAPA CALIBRADO</span>
            <h1>{correct}/10 sinais encontrados.</h1>
            <p>
              Português entra como missão de consolidação; Direito Administrativo ganha mais teoria
              visual; Raciocínio Lógico recebe blocos curtos de prática.
            </p>
            <div>
              <strong>
                <Zap /> +180 XP
              </strong>
              <strong>
                <CalendarRange /> plano recalculado
              </strong>
            </div>
            <button
              type="button"
              onClick={() => {
                journey.premiar("diagnostico-v2", 180, 24);
                go("dashboard");
              }}
            >
              abrir minha central <ArrowRight />
            </button>
          </div>
        </section>
      </AppShell>
    );
  }
  return (
    <AppShell current="study" go={go} fullBleed>
      <section className="diagnostic-run">
        <header>
          <button type="button" onClick={() => go("dashboard")}>
            <X />
          </button>
          <div>
            <span>SINAL {String(index + 1).padStart(2, "0")} / 10</span>
            <i>
              <b style={{ width: `${((index + 1) / 10) * 100}%` }} />
            </i>
          </div>
          <strong>{question.disciplina}</strong>
        </header>
        <main>
          <small>
            {question.topico} · {question.nivel}
          </small>
          <h1>{question.enunciado}</h1>
          <div>
            {question.alternativas.map((answer) => (
              <button
                type="button"
                key={answer.letra}
                className={selected === answer.letra ? "is-selected" : undefined}
                onClick={() => setSelected(answer.letra)}
              >
                <span>{answer.letra}</span>
                <p>{answer.texto}</p>
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={!selected}
            onClick={() => {
              if (!selected) return;
              const isCorrect = selected === question.correta;
              journey.registrarDiagnostico(question.id, selected, isCorrect);
              setAnswers((items) => [...items, { id: question.id, correct: isCorrect }]);
              setSelected(null);
              setIndex((value) => Math.min(DIAGNOSTICO.length - 1, value + 1));
            }}
          >
            registrar sinal <ArrowRight />
          </button>
        </main>
      </section>
    </AppShell>
  );
}
