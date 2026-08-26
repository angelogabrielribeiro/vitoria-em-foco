import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";

import { CommandCenter } from "./CommandCenter";
import { ContestAtlas } from "./ContestAtlas";
import { DocumentLibrary } from "./DocumentLibrary";
import { EXPERIENCE_ROUTES, type ExperienceScreen } from "./experience";
import { LandingCarnival } from "./LandingCarnival";
import { ScheduleStudio } from "./ScheduleStudio";
import { Soundscape } from "./Soundscape";
import { StudyRoom } from "./StudyRoom";

export type { ExperienceScreen } from "./experience";

export function VitoriaExperience({
  screen,
  questionId,
}: {
  screen: ExperienceScreen;
  questionId?: string;
}) {
  const navigate = useNavigate();
  const reduced = Boolean(useReducedMotion());
  const go = (next: ExperienceScreen) => {
    void navigate({ to: EXPERIENCE_ROUTES[next] as never });
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <>
      <Soundscape />
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? {} : { opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {screen === "landing" ? <LandingCarnival go={go} /> : null}
          {screen === "dashboard" ? <CommandCenter go={go} /> : null}
          {screen === "finder" || screen === "contests" ? <ContestAtlas go={go} /> : null}
          {screen === "contest" ? <ContestAtlas go={go} detailOnly /> : null}
          {screen === "upload" ? <DocumentLibrary go={go} uploadFocus /> : null}
          {screen === "library" ? <DocumentLibrary go={go} /> : null}
          {screen === "availability" ? <ScheduleStudio go={go} setupFocus /> : null}
          {screen === "plan" || screen === "schedule" || screen === "paywall" ? (
            <ScheduleStudio go={go} />
          ) : null}
          {screen === "diagnostic" ? <StudyRoom go={go} mode="diagnostic" /> : null}
          {screen === "question" ? (
            <StudyRoom go={go} mode="question" {...(questionId ? { questionId } : {})} />
          ) : null}
          {screen === "study" ? <StudyRoom go={go} /> : null}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
