import { useEffect } from "react";

export function PwaBoot() {
  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    const register = () => {
      void navigator.serviceWorker.register("/sw.js", { scope: "/" });
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
