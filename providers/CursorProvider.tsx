"use client";

import { createContext, useContext, useState } from "react";

export type CursorState = "default" | "view" | "explore" | "drag" | "open" | "play";

type CursorContextValue = {
  state: CursorState;
  setState: (state: CursorState) => void;
};

const CursorContext = createContext<CursorContextValue | null>(null);

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CursorState>("default");

  return (
    <CursorContext.Provider value={{ state, setState }}>
      {children}
    </CursorContext.Provider>
  );
}

export function useCursor() {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error("useCursor must be used within a CursorProvider");
  }
  return context;
}

export function useCursorHover(state: CursorState) {
  const { setState } = useCursor();
  return {
    onMouseEnter: () => setState(state),
    onMouseLeave: () => setState("default"),
  };
}
