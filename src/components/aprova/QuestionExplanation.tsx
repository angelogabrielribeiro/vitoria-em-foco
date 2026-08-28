import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  Check,
  Eye,
  Lightbulb,
  ShieldAlert,
  Sparkles,
  Star,
  X,
} from "lucide-react";

import { getExplicacaoDidatica } from "@/data/mock/explicacoes";
import type { Alternativa, Questao } from "@/data/types";
import { journey, useJourney } from "@/lib/journey";
import { cn } from "@/lib/utils";
import { soundEngine } from "./sound-engine";

type ExplanationTab = "passos" | "alternativas" | "teste";

export function QuestionExplanation({
  question,
  selected,
  onNext,
  nextLabel = "entendi, próxima",
  compact = false,
}: {
  question: Questao;
  selected: Alternativa["letra"];
  onNext?: () => void;
  nextLabel?: string;
  compact?: boolean;
}) {
  const reduced = Boolean(useReducedMotion());
  const state = useJourney();
  const [tab, setTab] = useState<ExplanationTab>("passos");
  const [revealed, setRevealed] = useState(false);
  const teaching = getExplicacaoDidatica(question);
  const correct = selected === question.correta;
  const saved = state.cadernoErros.includes(question.id);

  return (
    <motion.section
      className={cn("question-coach", correct ? "is-correct" : "is-wrong", compact && "is-compact")}
      initial={reduced ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      role="region"
      aria-label="Explicação guiada da questão"
    >
      <header className="question-coach__verdict">
        <span>{correct ? <Check /> : <X />}</span>
        <div>
          <small>{correct ? "ACERTO COMPROVADO" : "ERRO VIRANDO MEMÓRIA"}</small>
          <h3>
            {correct ? "Você leu a regra certa." : `A resposta correta é ${question.correta}.`}
          </h3>
          <p>{teaching.objetivo}</p>
        </div>
        <strong>
          {question.disciplina} · {question.topico}
        </strong>
      </header>

      <nav className="question-coach__tabs" aria-label="Formas de entender a resposta">
        <button
          type="button"
          className={tab === "passos" ? "is-active" : undefined}
          onClick={() => setTab("passos")}
        >
          <BrainCircuit /> como pensar
        </button>
        <button
          type="button"
          className={tab === "alternativas" ? "is-active" : undefined}
          onClick={() => setTab("alternativas")}
        >
          <Eye /> elimine uma por uma
        </button>
        <button
          type="button"
          className={tab === "teste" ? "is-active" : undefined}
          onClick={() => setTab("teste")}
        >
          <Sparkles /> teste de 10 segundos
        </button>
      </nav>

      <AnimatePresence mode="wait">
        {tab === "passos" ? (
          <motion.div
            key="passos"
            className="question-coach__steps"
            initial={reduced ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            <ol>
              {teaching.passos.map((step, index) => (
                <li key={step}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
            <div className="question-coach__insights">
              <article>
                <ShieldAlert />
                <span>
                  <small>PEGADINHA DA BANCA</small>
                  <p>{teaching.pegadinha}</p>
                </span>
              </article>
              <article>
                <Lightbulb />
                <span>
                  <small>EXEMPLO ESPELHO</small>
                  <p>{teaching.exemplo}</p>
                </span>
              </article>
            </div>
            <blockquote>
              <BookOpenCheck />
              <span>
                <small>REGRA PARA LEVAR</small>
                <strong>{question.memoria ?? question.explicacao}</strong>
              </span>
            </blockquote>
          </motion.div>
        ) : null}

        {tab === "alternativas" ? (
          <motion.div
            key="alternativas"
            className="question-coach__options"
            initial={reduced ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            {question.alternativas.map((alternative) => (
              <article
                key={alternative.letra}
                className={cn(
                  alternative.letra === question.correta && "is-answer",
                  alternative.letra === selected && "is-selected",
                )}
              >
                <span>{alternative.letra}</span>
                <div>
                  <strong>{alternative.texto}</strong>
                  <p>
                    {teaching.alternativas[alternative.letra] ??
                      (alternative.letra === question.correta
                        ? question.explicacao
                        : "Esta opção não passa pelo teste da regra central.")}
                  </p>
                </div>
              </article>
            ))}
          </motion.div>
        ) : null}

        {tab === "teste" ? (
          <motion.div
            key="teste"
            className="question-coach__test"
            initial={reduced ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <small>RECUPERAÇÃO ATIVA · RESPONDA ANTES DE REVELAR</small>
            <h4>{teaching.microDesafio.pergunta}</h4>
            <button type="button" onClick={() => setRevealed((value) => !value)}>
              {revealed ? "ocultar resposta" : "revelar resposta"} <Eye />
            </button>
            <AnimatePresence>
              {revealed ? (
                <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  {teaching.microDesafio.resposta}
                </motion.p>
              ) : null}
            </AnimatePresence>
            {teaching.fundamento ? <em>Base: {teaching.fundamento}</em> : null}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <footer className="question-coach__actions">
        <button
          type="button"
          className={saved ? "is-saved" : undefined}
          aria-pressed={saved}
          onClick={() => {
            journey.alternarCadernoErro(question.id);
            soundEngine.play("tap");
          }}
        >
          <Star fill={saved ? "currentColor" : "none"} />
          {saved ? "salva para revisar" : "salvar no caderno de erros"}
        </button>
        {onNext ? (
          <button type="button" className="question-coach__next" onClick={onNext}>
            {nextLabel} <ArrowRight />
          </button>
        ) : null}
      </footer>
    </motion.section>
  );
}
