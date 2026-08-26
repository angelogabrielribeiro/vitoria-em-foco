import { useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

import { journey, useJourney } from "@/lib/journey";
import { cn } from "@/lib/utils";
import { soundEngine } from "./sound-engine";

export function Soundscape() {
  const state = useJourney();

  useEffect(() => {
    soundEngine.setEnabled(state.somAtivo);
    return () => soundEngine.setEnabled(false);
  }, [state.somAtivo]);

  useEffect(() => {
    const tap = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest("button, a, [data-sound]")) {
        soundEngine.play("tap");
      }
    };
    document.addEventListener("pointerdown", tap, { capture: true });
    return () => document.removeEventListener("pointerdown", tap, { capture: true });
  }, []);

  return null;
}

export function SoundToggle({ compact = false }: { compact?: boolean }) {
  const state = useJourney();
  const toggle = () => {
    const next = !state.somAtivo;
    journey.definirSom(next);
    soundEngine.setEnabled(next);
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={state.somAtivo}
      className={cn("sound-toggle", compact && "sound-toggle--compact", state.somAtivo && "is-on")}
      title={state.somAtivo ? "Desligar trilha e efeitos" : "Ligar trilha e efeitos"}
    >
      <span className="sound-toggle__icon">
        {state.somAtivo ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
        {state.somAtivo ? <i aria-hidden="true" /> : null}
      </span>
      {!compact ? <span>{state.somAtivo ? "Som ligado" : "Ativar som"}</span> : null}
    </button>
  );
}
