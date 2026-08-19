import { useEffect, useState } from "react";

export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse)");
    setIsTouch(query.matches);

    const onChange = (event: MediaQueryListEvent) => setIsTouch(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return isTouch;
}
