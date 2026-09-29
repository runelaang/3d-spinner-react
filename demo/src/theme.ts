import { useEffect, useState } from "react";

// Shared with the 3d-spinner demo, which is served from the same origin.
const STORAGE_KEY = "3d-spinner-examples-theme";
const MODES = ["auto", "light", "dark"] as const;
type Mode = (typeof MODES)[number];

/** The stored color scheme, or "auto". */
function storedMode(): Mode {
  const stored = localStorage.getItem(STORAGE_KEY);
  return MODES.find((mode) => mode === stored) ?? "auto";
}

/** Color scheme state that is applied to the page and remembered. */
export function useTheme() {
  const [mode, setMode] = useState(storedMode);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
    if (mode === "auto") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  const next = () => setMode((current) => MODES[(MODES.indexOf(current) + 1) % MODES.length]);
  return { mode, next };
}
