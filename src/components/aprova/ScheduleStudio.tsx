import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CalendarClock,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Edit3,
  GripVertical,
  ListRestart,
  Lock,
  Minus,
  Plus,
  RefreshCw,
  Settings2,
  Sparkles,
  Target,
  Trash2,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";

import {
  BLOCOS,
  journey,
  type ScheduleTask,
  type ScheduleTaskKind,
  useJourney,
} from "@/lib/journey";
import { cn } from "@/lib/utils";
import { AppShell, RewardBurst, SectionTitle } from "./CarnivalShell";
import type { ExperienceScreen } from "./experience";
import { soundEngine } from "./sound-engine";

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const SHORT_DAYS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
const BASE_WEEK = Date.UTC(2026, 7, 24);

function weekDate(offset: number, day: number) {
  return new Date(BASE_WEEK + (offset * 7 + day) * 86_400_000);
}

function weekLabel(offset: number) {
  const start = weekDate(offset, 0);
  const end = weekDate(offset, 6);
  const formatter = new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" });
  const startMonth = formatter.format(start).replace(".", "").toUpperCase();
  const endMonth = formatter.format(end).replace(".", "").toUpperCase();
  const position = offset === 0 ? "ATUAL" : offset > 0 ? `+${offset}` : String(offset);
  const startDay = String(start.getUTCDate()).padStart(2, "0");
  const endDay = String(end.getUTCDate()).padStart(2, "0");
  const range =
    startMonth === endMonth
      ? `${startDay}–${endDay} ${endMonth}`
      : `${startDay} ${startMonth}–${endDay} ${endMonth}`;
  return `SEMANA ${position} · ${range}`;
}

const KIND_LABEL: Record<ScheduleTaskKind, string> = {
  teoria: "Teoria guiada",
  revisao: "Revisão ativa",
  questoes: "Questões",
  simulado: "Simulado",
  etapa: "Etapa do concurso",
};

export function ScheduleStudio({
  go,
  setupFocus = false,
}: {
  go: (screen: ExperienceScreen) => void;
  setupFocus?: boolean;
}) {
  const state = useJourney();
  const [view, setView] = useState<"semana" | "30dias">(setupFocus ? "semana" : "semana");
  const [weekOffset, setWeekOffset] = useState(0);
  const [editing, setEditing] = useState<ScheduleTask | null>(null);
  const [addingDay, setAddingDay] = useState<number | null>(null);
  const [settings, setSettings] = useState(setupFocus);
  const [replan, setReplan] = useState(false);
  const [reward, setReward] = useState(false);

  const totalMinutes = state.cronograma.reduce((sum, task) => sum + task.minutes, 0);
  const completedMinutes = state.cronograma
    .filter((task) => task.completed)
    .reduce((sum, task) => sum + task.minutes, 0);
  const daily = useMemo(
    () => DAYS.map((_, day) => state.cronograma.filter((task) => task.day === day)),
    [state.cronograma],
  );

  const toggleTask = (task: ScheduleTask) => {
    journey.atualizarTarefa(task.id, { completed: !task.completed });
    if (!task.completed) {
      const won = journey.premiar(
        `schedule-${task.id}`,
        Math.max(30, task.minutes * 2),
        Math.max(5, Math.round(task.minutes / 4)),
      );
      if (won) {
        setReward(true);
        soundEngine.play("reward");
      }
    }
  };

  const applyReplan = () => {
    const incomplete = state.cronograma.filter((task) => !task.completed);
    incomplete.forEach((task, index) => journey.atualizarTarefa(task.id, { day: index % 6 }));
    setReplan(false);
    soundEngine.play("open");
  };

  return (
    <AppShell current="schedule" go={go} fullBleed>
      <div className="schedule-page">
        <SectionTitle
          eyebrow="ESTÚDIO DE ROTA / TOTALMENTE EDITÁVEL"
          title="O plano muda quando a vida muda."
          text="Mova blocos, altere tempo, troque matéria, crie uma tarefa ou conclua no seu ritmo. Replanejar nunca apaga o que já foi feito."
          action={
            <div className="schedule-actions">
              <button type="button" onClick={() => setSettings(true)}>
                <Settings2 /> disponibilidade
              </button>
              <button type="button" onClick={() => setReplan(true)}>
                <WandSparkles /> replanejar
              </button>
            </div>
          }
        />

        <section className="schedule-signal">
          <div>
            <span>META SEMANAL</span>
            <strong>
              {state.metaSemanal}
              <small>min</small>
            </strong>
            <i>
              <b
                style={{ width: `${Math.min(100, (completedMinutes / state.metaSemanal) * 100)}%` }}
              />
            </i>
            <p>
              {completedMinutes} min cumpridos · {Math.max(0, state.metaSemanal - completedMinutes)}{" "}
              min restantes
            </p>
          </div>
          <div>
            <span>CARGA PLANEJADA</span>
            <strong>
              {Math.round((totalMinutes / 60) * 10) / 10}
              <small>horas</small>
            </strong>
            <p>{state.cronograma.length} blocos em 7 dias</p>
          </div>
          <div>
            <span>RITMO SUGERIDO</span>
            <strong>
              {Math.round(totalMinutes / 7)}
              <small>min/dia</small>
            </strong>
            <p>ajustável a qualquer momento</p>
          </div>
          <div>
            <span>ATÉ A PROVA</span>
            <strong>
              82<small>dias</small>
            </strong>
            <p>janela demonstrativa</p>
          </div>
        </section>

        <div className="schedule-toolbar">
          <div>
            <button
              type="button"
              className={view === "semana" ? "is-active" : undefined}
              onClick={() => setView("semana")}
            >
              <CalendarClock /> Semana
            </button>
            <button
              type="button"
              className={view === "30dias" ? "is-active" : undefined}
              onClick={() => setView("30dias")}
            >
              <CalendarDays /> 30 dias
            </button>
          </div>
          <span>{weekLabel(weekOffset)}</span>
          <div>
            <button
              type="button"
              aria-label="Semana anterior"
              onClick={() => setWeekOffset((value) => value - 1)}
            >
              <ChevronLeft />
            </button>
            <button type="button" onClick={() => setWeekOffset(0)}>
              hoje
            </button>
            <button
              type="button"
              aria-label="Próxima semana"
              onClick={() => setWeekOffset((value) => value + 1)}
            >
              <ChevronRight />
            </button>
          </div>
        </div>

        {view === "semana" ? (
          <section className="week-studio">
            {DAYS.map((day, dayIndex) => (
              <article
                key={day}
                className={cn("day-column", weekOffset === 0 && dayIndex === 0 && "is-today")}
              >
                <header>
                  <span>{SHORT_DAYS[dayIndex]}</span>
                  <strong>{weekDate(weekOffset, dayIndex).getUTCDate()}</strong>
                  <small>
                    {daily[dayIndex]?.reduce((sum, task) => sum + task.minutes, 0) ?? 0} min
                  </small>
                </header>
                <div className="day-column__tasks">
                  {daily[dayIndex]?.map((task, taskIndex) => (
                    <motion.div
                      layout
                      key={task.id}
                      className={cn(
                        "schedule-task",
                        `is-${task.kind}`,
                        task.completed && "is-complete",
                      )}
                    >
                      <button
                        type="button"
                        className="schedule-task__grip"
                        aria-label="Opções de movimento"
                        onClick={() => setEditing(task)}
                      >
                        <GripVertical />
                      </button>
                      <button
                        type="button"
                        className="schedule-task__body"
                        onClick={() => setEditing(task)}
                      >
                        <small>{KIND_LABEL[task.kind]}</small>
                        <strong>{task.title}</strong>
                        <span>{task.discipline}</span>
                        <em>
                          <Clock3 /> {task.minutes} min
                        </em>
                      </button>
                      <button
                        type="button"
                        className="schedule-task__check"
                        onClick={() => toggleTask(task)}
                        aria-label={task.completed ? "Marcar como pendente" : "Concluir tarefa"}
                      >
                        {task.completed ? <Check /> : <i />}
                      </button>
                      <div className="schedule-task__move">
                        <button
                          type="button"
                          disabled={dayIndex === 0}
                          onClick={() => journey.atualizarTarefa(task.id, { day: dayIndex - 1 })}
                          aria-label="Mover para o dia anterior"
                        >
                          <ChevronLeft />
                        </button>
                        <button
                          type="button"
                          disabled={dayIndex === 6}
                          onClick={() => journey.atualizarTarefa(task.id, { day: dayIndex + 1 })}
                          aria-label="Mover para o dia seguinte"
                        >
                          <ChevronRight />
                        </button>
                      </div>
                      <span className="schedule-task__order">
                        {String(taskIndex + 1).padStart(2, "0")}
                      </span>
                    </motion.div>
                  ))}
                  <button type="button" className="add-task" onClick={() => setAddingDay(dayIndex)}>
                    <Plus /> adicionar bloco
                  </button>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <ThirtyDayRoute tasks={state.cronograma} edit={(task) => setEditing(task)} />
        )}

        <section className="schedule-rules">
          <div>
            <Lock />
            <span>
              <strong>Blocos concluídos ficam protegidos.</strong>
              <p>Nenhum replanejamento move o que já virou progresso.</p>
            </span>
          </div>
          <div>
            <RefreshCw />
            <span>
              <strong>Você sempre pode desfazer.</strong>
              <p>A rota demonstrativa preserva a semana anterior antes de recalcular.</p>
            </span>
          </div>
          <button type="button" onClick={() => journey.restaurarCronograma()}>
            <ListRestart /> restaurar plano demonstrativo
          </button>
        </section>
      </div>

      <AnimatePresence>
        {editing ? <TaskEditor task={editing} close={() => setEditing(null)} /> : null}
        {addingDay !== null ? <NewTask day={addingDay} close={() => setAddingDay(null)} /> : null}
        {settings ? (
          <AvailabilityStudio
            close={() => setSettings(false)}
            continueToPlan={() => {
              setSettings(false);
              if (setupFocus) go("diagnostic");
            }}
          />
        ) : null}
        {replan ? <ReplanPreview close={() => setReplan(false)} apply={applyReplan} /> : null}
        {reward ? (
          <RewardBurst
            show
            xp={60}
            coins={8}
            title="Bloco concluído"
            onClose={() => setReward(false)}
          />
        ) : null}
      </AnimatePresence>
    </AppShell>
  );
}

function ThirtyDayRoute({
  tasks,
  edit,
}: {
  tasks: ScheduleTask[];
  edit: (task: ScheduleTask) => void;
}) {
  return (
    <section className="thirty-route">
      <div className="thirty-route__legend">
        <span>
          <i /> missão
        </span>
        <span>
          <i /> revisão
        </span>
        <span>
          <i /> simulado
        </span>
        <span>
          <i /> descanso ativo
        </span>
      </div>
      <div>
        {Array.from({ length: 30 }, (_, index) => {
          const day = index + 1;
          const weeklyTask = tasks[index % Math.max(1, tasks.length)];
          const kind =
            day % 7 === 0 ? "revisao" : day % 6 === 0 ? "simulado" : (weeklyTask?.kind ?? "teoria");
          return (
            <motion.button
              type="button"
              key={day}
              className={cn("route-day", `is-${kind}`, day === 1 && "is-current")}
              onClick={() => weeklyTask && edit(weeklyTask)}
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(index * 0.018, 0.35) }}
            >
              <span>DIA</span>
              <strong>{String(day).padStart(2, "0")}</strong>
              <small>
                {day % 7 === 0 ? "recalibrar" : (weeklyTask?.discipline.split(" ")[0] ?? "foco")}
              </small>
              <i />
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

function TaskEditor({ task, close }: { task: ScheduleTask; close: () => void }) {
  const [draft, setDraft] = useState(task);
  const save = () => {
    journey.atualizarTarefa(task.id, draft);
    close();
  };
  return (
    <motion.div
      className="modal-scrim"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.section
        className="task-editor"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
      >
        <header>
          <div>
            <small>EDITAR BLOCO</small>
            <h2>Este plano é seu.</h2>
          </div>
          <button type="button" onClick={close}>
            <X />
          </button>
        </header>
        <label>
          <span>Título</span>
          <input
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
          />
        </label>
        <label>
          <span>Disciplina</span>
          <input
            value={draft.discipline}
            onChange={(event) => setDraft({ ...draft, discipline: event.target.value })}
          />
        </label>
        <div className="task-editor__duration">
          <span>Duração</span>
          <div>
            <button
              type="button"
              onClick={() => setDraft({ ...draft, minutes: Math.max(10, draft.minutes - 5) })}
            >
              <Minus />
            </button>
            <strong>
              {draft.minutes}
              <small> min</small>
            </strong>
            <button
              type="button"
              onClick={() => setDraft({ ...draft, minutes: Math.min(180, draft.minutes + 5) })}
            >
              <Plus />
            </button>
          </div>
        </div>
        <fieldset>
          <legend>Modalidade</legend>
          <div>
            {(Object.keys(KIND_LABEL) as ScheduleTaskKind[]).map((kind) => (
              <button
                type="button"
                key={kind}
                className={draft.kind === kind ? "is-active" : undefined}
                onClick={() => setDraft({ ...draft, kind })}
              >
                {KIND_LABEL[kind]}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Dia da semana</legend>
          <div className="task-editor__days">
            {SHORT_DAYS.map((day, index) => (
              <button
                type="button"
                key={day}
                className={draft.day === index ? "is-active" : undefined}
                onClick={() => setDraft({ ...draft, day: index })}
              >
                {day}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="task-editor__tools">
          <button
            type="button"
            onClick={() =>
              journey.adicionarTarefa({
                day: draft.day,
                title: `${draft.title} · cópia`,
                discipline: draft.discipline,
                minutes: draft.minutes,
                kind: draft.kind,
              })
            }
          >
            <Copy /> duplicar
          </button>
          <button
            type="button"
            onClick={() => {
              journey.removerTarefa(task.id);
              close();
            }}
          >
            <Trash2 /> excluir
          </button>
        </div>
        <button type="button" className="task-editor__save" onClick={save}>
          salvar mudanças <Check />
        </button>
      </motion.section>
    </motion.div>
  );
}

function NewTask({ day, close }: { day: number; close: () => void }) {
  const [title, setTitle] = useState("");
  const [discipline, setDiscipline] = useState("Português");
  const [minutes, setMinutes] = useState(30);
  const [kind, setKind] = useState<ScheduleTaskKind>("teoria");
  return (
    <motion.div
      className="modal-scrim"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.section
        className="task-editor task-editor--new"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 12 }}
      >
        <header>
          <div>
            <small>NOVO BLOCO · {SHORT_DAYS[day]}</small>
            <h2>O que entra na rota?</h2>
          </div>
          <button type="button" onClick={close}>
            <X />
          </button>
        </header>
        <label>
          <span>Título</span>
          <input
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex.: Revisão de crase"
          />
        </label>
        <label>
          <span>Disciplina</span>
          <input value={discipline} onChange={(event) => setDiscipline(event.target.value)} />
        </label>
        <div className="task-editor__duration">
          <span>Duração</span>
          <div>
            <button type="button" onClick={() => setMinutes((value) => Math.max(10, value - 5))}>
              <Minus />
            </button>
            <strong>
              {minutes}
              <small> min</small>
            </strong>
            <button type="button" onClick={() => setMinutes((value) => Math.min(180, value + 5))}>
              <Plus />
            </button>
          </div>
        </div>
        <fieldset>
          <legend>Modalidade</legend>
          <div>
            {(Object.keys(KIND_LABEL) as ScheduleTaskKind[]).map((item) => (
              <button
                type="button"
                key={item}
                className={kind === item ? "is-active" : undefined}
                onClick={() => setKind(item)}
              >
                {KIND_LABEL[item]}
              </button>
            ))}
          </div>
        </fieldset>
        <button
          type="button"
          className="task-editor__save"
          disabled={!title.trim()}
          onClick={() => {
            journey.adicionarTarefa({ day, title: title.trim(), discipline, minutes, kind });
            close();
          }}
        >
          adicionar ao plano <Plus />
        </button>
      </motion.section>
    </motion.div>
  );
}

function AvailabilityStudio({
  close,
  continueToPlan,
}: {
  close: () => void;
  continueToPlan: () => void;
}) {
  const state = useJourney();
  const [blocks, setBlocks] = useState(state.disponibilidade);
  const total = blocks
    .filter((block) => block.ativo)
    .reduce((sum, block) => sum + block.minutos, 0);
  return (
    <motion.div
      className="modal-scrim"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.section
        className="availability-studio"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
      >
        <header>
          <div>
            <small>DISPONIBILIDADE VIVA</small>
            <h2>Quando o estudo cabe melhor?</h2>
            <p>Você poderá mudar tudo depois. Esta escolha só define o primeiro ritmo.</p>
          </div>
          <button type="button" onClick={close}>
            <X />
          </button>
        </header>
        <div className="availability-blocks">
          {BLOCOS.map((item) => {
            const block = blocks.find((entry) => entry.bloco === item.bloco)!;
            return (
              <article key={item.bloco} className={block.ativo ? "is-active" : undefined}>
                <button
                  type="button"
                  onClick={() =>
                    setBlocks((values) =>
                      values.map((entry) =>
                        entry.bloco === item.bloco ? { ...entry, ativo: !entry.ativo } : entry,
                      ),
                    )
                  }
                >
                  <span>{block.ativo ? <Check /> : <Plus />}</span>
                  <div>
                    <strong>{item.label}</strong>
                    <small>{item.hint}</small>
                  </div>
                </button>
                <div>
                  <button
                    type="button"
                    disabled={!block.ativo}
                    onClick={() =>
                      setBlocks((values) =>
                        values.map((entry) =>
                          entry.bloco === item.bloco
                            ? { ...entry, minutos: Math.max(15, entry.minutos - 15) }
                            : entry,
                        ),
                      )
                    }
                  >
                    <Minus />
                  </button>
                  <strong>
                    {block.minutos}
                    <small> min</small>
                  </strong>
                  <button
                    type="button"
                    disabled={!block.ativo}
                    onClick={() =>
                      setBlocks((values) =>
                        values.map((entry) =>
                          entry.bloco === item.bloco
                            ? { ...entry, minutos: Math.min(180, entry.minutos + 15) }
                            : entry,
                        ),
                      )
                    }
                  >
                    <Plus />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        <div className="availability-total">
          <span>
            <Clock3 /> CARGA DIÁRIA
          </span>
          <strong>
            {total}
            <small> minutos</small>
          </strong>
          <i>
            <b style={{ width: `${Math.min(100, total / 1.8)}%` }} />
          </i>
        </div>
        <label className="weekly-goal">
          <span>Meta semanal</span>
          <input
            type="range"
            min="120"
            max="900"
            step="30"
            value={state.metaSemanal}
            onChange={(event) => journey.definirMetaSemanal(Number(event.target.value))}
          />
          <strong>{state.metaSemanal} min</strong>
        </label>
        <button
          type="button"
          className="availability-save"
          disabled={total === 0}
          onClick={() => {
            journey.definirDisponibilidade(blocks);
            continueToPlan();
          }}
        >
          salvar novo ritmo <ArrowRight />
        </button>
      </motion.section>
    </motion.div>
  );
}

function ReplanPreview({ close, apply }: { close: () => void; apply: () => void }) {
  return (
    <motion.div
      className="modal-scrim"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.section
        className="replan-preview"
        initial={{ scale: 0.88 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.94 }}
      >
        <button type="button" onClick={close}>
          <X />
        </button>
        <span>
          <Sparkles />
        </span>
        <small>PRÉVIA DE REPLANEJAMENTO</small>
        <h2>Mais leve nos dias úteis. Mais profundo no sábado.</h2>
        <p>
          6 blocos pendentes serão redistribuídos. Itens concluídos permanecem exatamente onde
          estão.
        </p>
        <div>
          <article>
            <ArrowDown />
            <span>
              <strong>Seg–Sex</strong>
              <small>blocos de até 40 min</small>
            </span>
          </article>
          <article>
            <ArrowUp />
            <span>
              <strong>Sábado</strong>
              <small>simulado de 90 min</small>
            </span>
          </article>
          <article>
            <Lock />
            <span>
              <strong>Concluídos</strong>
              <small>nenhuma alteração</small>
            </span>
          </article>
        </div>
        <footer>
          <button type="button" onClick={close}>
            cancelar
          </button>
          <button type="button" onClick={apply}>
            aplicar nova rota <RefreshCw />
          </button>
        </footer>
      </motion.section>
    </motion.div>
  );
}
