import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookMarked,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  FileText,
  GraduationCap,
  Heart,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";

import type { Concurso } from "@/data/types";
import { CIDADES, ESTADOS, getCidade } from "@/data/mock/geografia";
import {
  ESFERA_LABEL,
  STATUS_LABEL,
  diasAte,
  formatarData,
  getCatalogoNacional,
  getConcurso,
} from "@/data/mock/concursos";
import { getContestDocuments } from "@/data/mock/content";
import { journey, useJourney } from "@/lib/journey";
import { cn } from "@/lib/utils";
import { AppShell, SectionTitle } from "./CarnivalShell";
import type { ExperienceScreen } from "./experience";
import { soundEngine } from "./sound-engine";

type DetailTab = "visao" | "cargos" | "edital" | "provas" | "etapas";

const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);

export function ContestAtlas({
  go,
  detailOnly = false,
}: {
  go: (screen: ExperienceScreen) => void;
  detailOnly?: boolean;
}) {
  const state = useJourney();
  const catalog = useMemo(() => getCatalogoNacional(), []);
  const selectedFromState =
    state.cidadeId && state.concursoId ? getConcurso(state.cidadeId, state.concursoId) : undefined;
  const [detail, setDetail] = useState<Concurso | null>(
    detailOnly ? (selectedFromState ?? null) : null,
  );
  const [tab, setTab] = useState<DetailTab>("visao");
  const [query, setQuery] = useState("");
  const [uf, setUf] = useState<string>(state.uf ?? "TODOS");
  const [sphere, setSphere] = useState<"todas" | Concurso["esfera"]>("todas");
  const [status, setStatus] = useState<"todos" | Concurso["statusEdital"]>("todos");
  const [shown, setShown] = useState(18);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("pt-BR");
    return catalog.filter((contest) => {
      const city = contest.cidadeId ? getCidade(contest.cidadeId) : undefined;
      const cargoText = contest.cargos.map((cargo) => cargo.nome).join(" ");
      const text =
        `${contest.orgao} ${contest.apelido} ${contest.banca} ${cargoText} ${city?.nome ?? ""}`.toLocaleLowerCase(
          "pt-BR",
        );
      return (
        (!needle || text.includes(needle)) &&
        (uf === "TODOS" || contest.uf === uf) &&
        (sphere === "todas" || contest.esfera === sphere) &&
        (status === "todos" || contest.statusEdital === status)
      );
    });
  }, [catalog, query, sphere, status, uf]);

  const chooseTarget = (contest: Concurso, cargoId?: string) => {
    const fallbackCity = CIDADES.find((city) => city.uf === contest.uf);
    const cityId = contest.cidadeId ?? fallbackCity?.id;
    if (!cityId) return;
    journey.selecionarUf(contest.uf);
    journey.selecionarCidade(cityId);
    journey.selecionarConcurso(contest.id);
    journey.selecionarCargo(cargoId ?? contest.cargos[0]?.id ?? "");
    soundEngine.play("reward");
    go("dashboard");
  };

  const openDetail = (contest: Concurso, nextTab: DetailTab = "visao") => {
    setDetail(contest);
    setTab(nextTab);
    soundEngine.play("open");
  };

  return (
    <AppShell current="contests" go={go} fullBleed>
      <div className="atlas-page">
        <SectionTitle
          eyebrow="ATLAS NACIONAL / BASE DEMONSTRATIVA"
          title="Encontre a vaga que merece entrar no centro."
          text={`${catalog.length} oportunidades demonstrativas atravessando ${ESTADOS.length} estados e ${CIDADES.length} municípios. Localidade é filtro — nunca uma parede.`}
          action={
            <button type="button" className="atlas-upload" onClick={() => go("upload")}>
              <FileText className="size-4" /> Enviar outro edital
            </button>
          }
        />

        <div className="atlas-searchbar">
          <Search className="size-5" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setShown(18);
            }}
            placeholder="Órgão, cargo, banca, cidade..."
            aria-label="Buscar concursos"
          />
          <span>
            <SlidersHorizontal className="size-4" /> {filtered.length} resultados
          </span>
        </div>

        <div className="atlas-stats">
          {[
            [Building2, "3 esferas", "Federal, estadual e municipal"],
            [MapPin, `${CIDADES.length} cidades`, "Amostra nacional navegável"],
            [FileText, "Editais ligados", "Documentos e retificações"],
            [Award, "Todas as etapas", "Da objetiva até a formação"],
          ].map(([Icon, value, label]) => {
            const MetricIcon = Icon as typeof Building2;
            return (
              <div key={String(value)}>
                <MetricIcon className="size-4" />
                <strong>{String(value)}</strong>
                <span>{String(label)}</span>
              </div>
            );
          })}
        </div>

        <section className="atlas-board">
          <aside className="atlas-filters">
            <div>
              <span>ESFERA</span>
              {(["todas", "federal", "estadual", "municipal"] as const).map((item) => (
                <button
                  type="button"
                  key={item}
                  className={sphere === item ? "is-active" : undefined}
                  onClick={() => {
                    setSphere(item);
                    setShown(18);
                  }}
                >
                  {item === "todas" ? "Todas" : ESFERA_LABEL[item]}
                  <ChevronRight className="size-3" />
                </button>
              ))}
            </div>
            <div>
              <span>STATUS</span>
              {(["todos", "inscricoes_abertas", "publicado", "previsto"] as const).map((item) => (
                <button
                  type="button"
                  key={item}
                  className={status === item ? "is-active" : undefined}
                  onClick={() => {
                    setStatus(item);
                    setShown(18);
                  }}
                >
                  {item === "todos" ? "Todos" : STATUS_LABEL[item]}
                  <ChevronRight className="size-3" />
                </button>
              ))}
            </div>
            <button
              type="button"
              className="atlas-filters__clear"
              onClick={() => {
                setQuery("");
                setUf("TODOS");
                setSphere("todas");
                setStatus("todos");
              }}
            >
              limpar filtros
            </button>
          </aside>

          <div className="atlas-results">
            <div className="brazil-grid" aria-label="Filtrar por estado">
              <button
                type="button"
                className={uf === "TODOS" ? "is-active" : undefined}
                onClick={() => setUf("TODOS")}
              >
                BR
              </button>
              {ESTADOS.map((stateItem) => (
                <button
                  type="button"
                  key={stateItem.uf}
                  title={stateItem.nome}
                  className={uf === stateItem.uf ? "is-active" : undefined}
                  onClick={() => {
                    setUf(stateItem.uf);
                    setShown(18);
                  }}
                >
                  {stateItem.uf}
                </button>
              ))}
            </div>

            <div className="contest-grid">
              {filtered.slice(0, shown).map((contest, index) => {
                const city = contest.cidadeId ? getCidade(contest.cidadeId) : undefined;
                const favorite = state.favoritos.includes(contest.id);
                const salary = Math.max(...contest.cargos.map((cargo) => cargo.salario));
                return (
                  <motion.article
                    key={contest.id}
                    className="contest-card"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.025, 0.25) }}
                  >
                    <div className="contest-card__head">
                      <span className={cn("contest-card__sphere", `is-${contest.esfera}`)}>
                        {ESFERA_LABEL[contest.esfera]}
                      </span>
                      <button
                        type="button"
                        onClick={() => journey.alternarFavorito(contest.id)}
                        aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                        className={favorite ? "is-favorite" : undefined}
                      >
                        <Heart className="size-4" fill={favorite ? "currentColor" : "none"} />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="contest-card__body"
                      onClick={() => openDetail(contest)}
                    >
                      <small>{contest.banca} · cenário demonstrativo</small>
                      <h2>{contest.apelido}</h2>
                      <p>{city ? `${city.nome} · ${contest.uf}` : `Cobertura em ${contest.uf}`}</p>
                      <div className="contest-card__metrics">
                        <span>
                          <Users /> <b>{contest.vagasTotais}</b> vagas
                        </span>
                        <span>
                          <CircleDollarSign /> até <b>{money(salary)}</b>
                        </span>
                        <span>
                          <CalendarDays /> <b>{diasAte(contest.dataProva)}</b> dias
                        </span>
                      </div>
                    </button>
                    <div className="contest-card__status">
                      <span>
                        <i /> {STATUS_LABEL[contest.statusEdital]}
                      </span>
                      <button type="button" onClick={() => openDetail(contest)}>
                        abrir dossiê <ArrowRight className="size-4" />
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </div>
            {shown < filtered.length ? (
              <button
                type="button"
                className="atlas-more"
                onClick={() => setShown((value) => value + 18)}
              >
                Revelar mais 18 oportunidades <ArrowRight className="size-4" />
              </button>
            ) : null}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {detail ? (
          <ContestDossier
            contest={detail}
            tab={tab}
            setTab={setTab}
            close={() => {
              if (detailOnly) go("contests");
              else setDetail(null);
            }}
            chooseTarget={chooseTarget}
            openLibrary={() => {
              const fallbackCity = CIDADES.find((city) => city.uf === detail.uf);
              const cityId = detail.cidadeId ?? fallbackCity?.id;
              if (cityId) {
                journey.selecionarUf(detail.uf);
                journey.selecionarCidade(cityId);
                journey.selecionarConcurso(detail.id);
              }
              go("library");
            }}
          />
        ) : null}
      </AnimatePresence>
    </AppShell>
  );
}

function ContestDossier({
  contest,
  tab,
  setTab,
  close,
  chooseTarget,
  openLibrary,
}: {
  contest: Concurso;
  tab: DetailTab;
  setTab: (tab: DetailTab) => void;
  close: () => void;
  chooseTarget: (contest: Concurso, cargoId?: string) => void;
  openLibrary: () => void;
}) {
  const city = contest.cidadeId ? getCidade(contest.cidadeId) : undefined;
  const documents = getContestDocuments(contest);
  return (
    <motion.div
      className="dossier-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.aside
        className="dossier"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 32 }}
      >
        <div className="dossier__masthead">
          <button type="button" onClick={close}>
            <ArrowLeft className="size-4" /> voltar ao atlas
          </button>
          <button type="button" onClick={close} aria-label="Fechar">
            <X className="size-5" />
          </button>
        </div>
        <div className="dossier__hero">
          <span>
            {ESFERA_LABEL[contest.esfera]} · {contest.banca} · base demonstrativa
          </span>
          <h1>{contest.apelido}</h1>
          <p>
            <MapPin className="size-4" />{" "}
            {city ? `${city.nome}, ${contest.uf}` : `Cobertura estadual · ${contest.uf}`}
          </p>
          <div>
            <strong>
              {contest.vagasTotais}
              <small>vagas</small>
            </strong>
            <strong>
              {contest.cargos.length}
              <small>cargos</small>
            </strong>
            <strong>
              {diasAte(contest.dataProva)}
              <small>dias até a prova</small>
            </strong>
            <strong>
              {contest.etapas.length}
              <small>etapas</small>
            </strong>
          </div>
        </div>
        <nav className="dossier__tabs" aria-label="Dossiê do concurso">
          {(["visao", "cargos", "edital", "provas", "etapas"] as const).map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setTab(item)}
              className={tab === item ? "is-active" : undefined}
            >
              {item === "visao" ? "Visão geral" : item}
            </button>
          ))}
        </nav>
        <div className="dossier__content">
          {tab === "visao" ? (
            <div className="dossier-overview">
              <div className="dossier-deadline">
                <CalendarDays />
                <span>
                  <small>PROVA PROGRAMADA</small>
                  <strong>{formatarData(contest.dataProva)}</strong>
                </span>
                <span>
                  <small>INSCRIÇÕES ATÉ</small>
                  <strong>
                    {contest.inscricoesAte ? formatarData(contest.inscricoesAte) : "a confirmar"}
                  </strong>
                </span>
              </div>
              <h2>O mapa em uma leitura</h2>
              <p>
                {contest.orgao} reúne {contest.vagasTotais} vagas e uma jornada de{" "}
                {contest.etapas.length} etapas. O plano cruza peso das disciplinas, tempo restante e
                seu desempenho para sugerir a próxima missão.
              </p>
              <div className="dossier-actions">
                <button type="button" onClick={() => chooseTarget(contest)}>
                  <Target /> Colocar no centro
                </button>
                <button type="button" onClick={openLibrary}>
                  <BookMarked /> Abrir edital e provas
                </button>
              </div>
            </div>
          ) : null}
          {tab === "cargos" ? (
            <div className="dossier-list">
              {contest.cargos.map((cargo) => (
                <article key={cargo.id}>
                  <div>
                    <BriefcaseBusiness />
                    <span>
                      <small>{cargo.escolaridade}</small>
                      <h2>{cargo.nome}</h2>
                    </span>
                  </div>
                  <p>
                    {cargo.disciplinas.length} disciplinas ·{" "}
                    {cargo.disciplinas.reduce((sum, discipline) => sum + discipline.questoes, 0)}{" "}
                    questões previstas
                  </p>
                  <div className="dossier-list__facts">
                    <span>
                      <Users /> {cargo.vagas} vagas
                    </span>
                    <span>
                      <CircleDollarSign /> {money(cargo.salario)}
                    </span>
                    <span>
                      <GraduationCap /> {cargo.escolaridade}
                    </span>
                  </div>
                  <button type="button" onClick={() => chooseTarget(contest, cargo.id)}>
                    Escolher este cargo <ArrowRight />
                  </button>
                </article>
              ))}
            </div>
          ) : null}
          {tab === "edital" ? (
            <div className="dossier-documents">
              {documents
                .filter(
                  (document) =>
                    document.kind === "edital" ||
                    document.kind === "retificacao" ||
                    document.kind === "manual",
                )
                .map((document) => (
                  <button type="button" key={document.id} onClick={openLibrary}>
                    <FileText />
                    <span>
                      <small>
                        {document.kind} · {document.pages} páginas
                      </small>
                      <strong>{document.title}</strong>
                      <em>{document.highlights.join(" · ")}</em>
                    </span>
                    <ArrowRight />
                  </button>
                ))}
            </div>
          ) : null}
          {tab === "provas" ? (
            <div className="dossier-documents">
              {documents
                .filter((document) => document.kind === "prova" || document.kind === "gabarito")
                .map((document) => (
                  <button type="button" key={document.id} onClick={openLibrary}>
                    <ClipboardList />
                    <span>
                      <small>
                        {document.year} · {document.pages} páginas
                      </small>
                      <strong>{document.title}</strong>
                      <em>{document.subtitle}</em>
                    </span>
                    <ArrowRight />
                  </button>
                ))}
            </div>
          ) : null}
          {tab === "etapas" ? (
            <div className="stage-timeline">
              {contest.etapas.map((stage, index) => (
                <article key={stage.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <small>{stage.eliminatoria ? "ELIMINATÓRIA" : "CLASSIFICATÓRIA"}</small>
                    <h2>{stage.titulo}</h2>
                    <p>{stage.descricao}</p>
                  </div>
                  <ShieldCheck />
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </motion.aside>
    </motion.div>
  );
}
