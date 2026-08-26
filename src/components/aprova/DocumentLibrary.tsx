import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Download,
  Eye,
  FileClock,
  FileDiff,
  FileSearch,
  FileText,
  FolderOpen,
  Layers3,
  Maximize2,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import type { Concurso } from "@/data/types";
import { CIDADES } from "@/data/mock/geografia";
import { getCatalogoNacional, getConcurso } from "@/data/mock/concursos";
import { getContestDocuments, type ContestDocument, type DocumentKind } from "@/data/mock/content";
import { journey, useJourney } from "@/lib/journey";
import { cn } from "@/lib/utils";
import { AppShell, EmptyTarget, SectionTitle } from "./CarnivalShell";
import type { ExperienceScreen } from "./experience";
import { LivingShader } from "./LivingShader";
import { soundEngine } from "./sound-engine";

type LibraryFilter = "todos" | "edital" | "prova" | "gabarito" | "enviados";

const KIND_LABEL: Record<DocumentKind, string> = {
  edital: "Edital",
  retificacao: "Retificação",
  prova: "Prova anterior",
  gabarito: "Gabarito",
  manual: "Manual de etapas",
};

function selectedContest(): Concurso | undefined {
  const state = journey.get();
  return state.cidadeId && state.concursoId
    ? getConcurso(state.cidadeId, state.concursoId)
    : undefined;
}

export function DocumentLibrary({
  go,
  uploadFocus = false,
}: {
  go: (screen: ExperienceScreen) => void;
  uploadFocus?: boolean;
}) {
  const state = useJourney();
  const contest = selectedContest();
  const fallback = useMemo(() => getCatalogoNacional()[0], []);
  const activeContest = contest ?? fallback;
  const documents = useMemo(
    () => (activeContest ? getContestDocuments(activeContest) : []),
    [activeContest],
  );
  const [filter, setFilter] = useState<LibraryFilter>(uploadFocus ? "enviados" : "todos");
  const [query, setQuery] = useState("");
  const [reader, setReader] = useState<ContestDocument | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = documents.filter((document) => {
    const matchesKind =
      filter === "todos" ||
      (filter === "edital" && ["edital", "retificacao", "manual"].includes(document.kind)) ||
      document.kind === filter;
    const text = `${document.title} ${document.subtitle} ${document.year}`.toLocaleLowerCase(
      "pt-BR",
    );
    return matchesKind && text.includes(query.toLocaleLowerCase("pt-BR"));
  });

  const handleFile = (file?: File) => {
    if (!file) return;
    setUploadError(null);
    const validExtension = file.name.toLowerCase().endsWith(".pdf");
    const validMime = !file.type || file.type === "application/pdf";
    if (!validExtension || !validMime) {
      setUploadError("Envie um arquivo PDF válido.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setUploadError("O PDF precisa ter no máximo 25 MB nesta demonstração.");
      return;
    }
    setUploading(true);
    setUploadProgress(12);
    const steps = [34, 57, 78, 100];
    steps.forEach((value, index) => {
      window.setTimeout(
        () => {
          setUploadProgress(value);
          if (value === 100) {
            journey.registrarEdital(file.name, `${(file.size / 1024 / 1024).toFixed(1)} MB`);
            setUploading(false);
            soundEngine.play("reward");
          }
        },
        360 * (index + 1),
      );
    });
  };

  return (
    <AppShell current="library" go={go} fullBleed>
      <div className="library-page">
        <SectionTitle
          eyebrow="ARQUIVO VIVO / EDITAIS + PROVAS"
          title="Abra o documento. Enxergue o que ele muda."
          text="Editais, retificações, cadernos, gabaritos e manuais ficam ligados ao concurso e ao seu cronograma. Os itens abaixo são demonstrativos e claramente marcados."
          action={
            <button
              type="button"
              className="library-upload-button"
              onClick={() => inputRef.current?.click()}
            >
              <UploadCloud className="size-4" /> Enviar ou substituir PDF
            </button>
          }
        />
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />

        {!contest ? <EmptyTarget go={go} /> : null}

        <section className="library-hero">
          <LivingShader energy={0.82} />
          <div className="library-hero__copy">
            <span>DOSSIÊ ATIVO · CENÁRIO DEMONSTRATIVO</span>
            <h2>{activeContest?.apelido ?? "Acervo nacional"}</h2>
            <p>
              {documents.length} documentos conectados ·{" "}
              {documents.reduce((sum, document) => sum + document.pages, 0)} páginas navegáveis
            </p>
          </div>
          <div className="library-hero__signals">
            <div>
              <FileDiff />
              <span>
                <small>RETIFICAÇÕES</small>
                <strong>1 mudança rastreada</strong>
              </span>
            </div>
            <div>
              <ClipboardCheck />
              <span>
                <small>PROVAS ANTERIORES</small>
                <strong>2 cadernos + gabarito</strong>
              </span>
            </div>
            <div>
              <ShieldCheck />
              <span>
                <small>ETAPAS</small>
                <strong>{activeContest?.etapas.length ?? 0} conectadas</strong>
              </span>
            </div>
          </div>
        </section>

        <div className="library-toolbar">
          <div className="library-tabs" role="tablist" aria-label="Tipos de documento">
            {(
              [
                ["todos", "Todos"],
                ["edital", "Editais"],
                ["prova", "Provas"],
                ["gabarito", "Gabaritos"],
                ["enviados", `Meus PDFs (${state.documentosEnviados.length})`],
              ] as const
            ).map(([value, label]) => (
              <button
                type="button"
                role="tab"
                aria-selected={filter === value}
                key={value}
                onClick={() => setFilter(value)}
                className={filter === value ? "is-active" : undefined}
              >
                {label}
              </button>
            ))}
          </div>
          <label>
            <Search className="size-4" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar no acervo"
            />
          </label>
        </div>

        {filter === "enviados" ? (
          <section className="upload-workbench">
            <button
              type="button"
              className={cn("upload-dropzone", uploading && "is-uploading")}
              onClick={() => !uploading && inputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handleFile(event.dataTransfer.files[0]);
              }}
            >
              <span>
                <UploadCloud />
              </span>
              <strong>
                {uploading ? "Lendo estrutura do PDF..." : "Solte qualquer edital em PDF"}
              </strong>
              <p>
                {uploading
                  ? "Simulação local: identificando seções e criando um mapa revisável."
                  : "ou clique para escolher · até 25 MB · o arquivo não sai deste protótipo"}
              </p>
              {uploading ? (
                <i>
                  <b style={{ width: `${uploadProgress}%` }} />
                </i>
              ) : null}
              {uploading ? <em>{uploadProgress}%</em> : null}
            </button>
            {uploadError ? (
              <p className="upload-error" role="alert">
                {uploadError}
              </p>
            ) : null}
            <div className="uploaded-list">
              {state.documentosEnviados.map((document) => (
                <article key={document.id}>
                  <FileSearch />
                  <div>
                    <small>
                      {document.status} · {document.size}
                    </small>
                    <strong>{document.name}</strong>
                    <span>{document.mappedSections} seções demonstrativas mapeadas</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => journey.removerDocumento(document.id)}
                    aria-label={`Remover ${document.name}`}
                  >
                    <Trash2 />
                  </button>
                </article>
              ))}
              {!state.documentosEnviados.length && !uploading ? (
                <div className="uploaded-empty">
                  <FolderOpen />
                  <span>
                    <strong>Nenhum PDF enviado ainda.</strong>
                    <p>
                      Seu primeiro documento aparecerá aqui com histórico e opções de substituição.
                    </p>
                  </span>
                </div>
              ) : null}
            </div>
          </section>
        ) : (
          <section className="document-filmstrip">
            {filtered.map((document, index) => (
              <motion.button
                type="button"
                key={document.id}
                className={cn("document-cover", `is-${document.color}`)}
                onClick={() => {
                  setReader(document);
                  soundEngine.play("open");
                }}
                initial={{ opacity: 0, y: 20, rotate: index % 2 ? 1 : -1 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                whileHover={{ y: -12, rotate: 0 }}
              >
                <span className="document-cover__index">{String(index + 1).padStart(2, "0")}</span>
                <span className="document-cover__mark">
                  <FileText />
                </span>
                <small>
                  {KIND_LABEL[document.kind]} · {document.year}
                </small>
                <strong>{document.title}</strong>
                <p>{document.subtitle}</p>
                <div>
                  {document.highlights.map((highlight) => (
                    <span key={highlight}>{highlight}</span>
                  ))}
                </div>
                <footer>
                  <span>
                    {document.pages} págs · {document.size}
                  </span>
                  <Eye />
                </footer>
              </motion.button>
            ))}
          </section>
        )}
      </div>

      <AnimatePresence>
        {reader ? (
          <DocumentReader
            document={reader}
            close={() => setReader(null)}
            startStudy={() => {
              setReader(null);
              go("study");
            }}
          />
        ) : null}
      </AnimatePresence>
    </AppShell>
  );
}

function DocumentReader({
  document,
  close,
  startStudy,
}: {
  document: ContestDocument;
  close: () => void;
  startStudy: () => void;
}) {
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const displayPage = Math.min(document.pages, page);
  const downloadDemo = () => {
    const body = [
      "VITÓRIA EM FOCO · ARQUIVO DEMONSTRATIVO",
      "",
      document.title,
      document.subtitle,
      "",
      ...document.sections.flatMap((section) => [section.heading, section.body, ""]),
      "Este arquivo demonstra o fluxo de download. Antes de uma publicação real, o PDF oficial deve ser conferido na fonte do órgão.",
    ].join("\n");
    const url = URL.createObjectURL(new Blob([body], { type: "text/plain;charset=utf-8" }));
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = `${document.title.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}-demonstracao.txt`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 500);
  };
  return (
    <motion.div
      className="reader-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={cn("document-reader", expanded && "is-expanded")}
        initial={{ scale: 0.94, y: 28 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 20 }}
      >
        <header>
          <div>
            <button type="button" onClick={close}>
              <ArrowLeft /> voltar ao acervo
            </button>
            <span>{KIND_LABEL[document.kind]} · demonstração</span>
          </div>
          <strong>{document.title}</strong>
          <nav>
            <button
              type="button"
              onClick={() => setZoom((value) => Math.max(0.78, value - 0.1))}
              aria-label="Diminuir zoom"
            >
              <ZoomOut />
            </button>
            <button
              type="button"
              onClick={() => setZoom((value) => Math.min(1.35, value + 0.1))}
              aria-label="Aumentar zoom"
            >
              <ZoomIn />
            </button>
            <button
              type="button"
              aria-label={expanded ? "Sair da tela cheia" : "Tela cheia"}
              aria-pressed={expanded}
              onClick={() => setExpanded((value) => !value)}
            >
              <Maximize2 />
            </button>
            <button type="button" aria-label="Fechar" onClick={close}>
              <X />
            </button>
          </nav>
        </header>
        <div className="reader-layout">
          <aside>
            <span>ÍNDICE INTELIGENTE</span>
            {document.sections.map((section, index) => (
              <button
                type="button"
                key={section.heading}
                onClick={() => setPage(Math.min(document.pages, index * 6 + 1))}
              >
                <small>{String(index + 1).padStart(2, "0")}</small>
                <strong>{section.heading}</strong>
                <ChevronRight />
              </button>
            ))}
            <div className="reader-insights">
              <Sparkles />
              <strong>Leitura assistida</strong>
              <p>
                Os destaques são demonstrativos e sempre podem ser conferidos na página original.
              </p>
            </div>
          </aside>
          <main>
            <motion.article
              className="pdf-sheet"
              animate={{ scale: zoom }}
              style={{ transformOrigin: "top center" }}
            >
              <div className="pdf-sheet__brand">
                VITÓRIA EM FOCO <span>LEITOR DEMONSTRATIVO</span>
              </div>
              <small>{document.subtitle}</small>
              <h1>{document.title}</h1>
              <div className="pdf-sheet__rule" />
              {(document.sections.length
                ? document.sections
                : [{ heading: "Documento", body: "Conteúdo demonstrativo." }]
              ).map((section, index) => (
                <section
                  key={section.heading}
                  className={index > 1 ? "pdf-sheet__muted" : undefined}
                >
                  <span>{index + 1}</span>
                  <h2>{section.heading}</h2>
                  <p>{section.body}</p>
                  {index === 0 ? (
                    <blockquote>
                      <Bookmark /> ponto conectado ao seu cronograma
                    </blockquote>
                  ) : null}
                </section>
              ))}
              <footer>
                PÁGINA {String(displayPage).padStart(2, "0")} / {document.pages}
              </footer>
            </motion.article>
          </main>
          <aside className="reader-notes">
            <span>RADAR DE IMPACTO</span>
            {document.highlights.map((highlight) => (
              <div key={highlight}>
                <Check />
                <strong>{highlight}</strong>
              </div>
            ))}
            <button type="button" onClick={startStudy}>
              <Play fill="currentColor" /> Transformar em missão
            </button>
            <button type="button" onClick={downloadDemo}>
              <Download /> Baixar versão demo
            </button>
          </aside>
        </div>
        <footer className="reader-footer">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={page === 1}
          >
            <ChevronLeft />
          </button>
          <span>
            <b>{displayPage}</b> / {document.pages}
          </span>
          <i>
            <b style={{ width: `${(displayPage / document.pages) * 100}%` }} />
          </i>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(document.pages, value + 1))}
            disabled={page === document.pages}
          >
            <ChevronRight />
          </button>
        </footer>
      </motion.div>
    </motion.div>
  );
}
