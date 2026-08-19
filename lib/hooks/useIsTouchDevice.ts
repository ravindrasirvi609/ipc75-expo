import { useMediaQuery } from "./useMediaQuery";

export function useIsTouchDevice() {
  return useMediaQuery("(pointer: coarse)");
}
