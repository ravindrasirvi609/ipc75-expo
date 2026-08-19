import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { Observer } from "gsap/Observer";
import { CustomEase } from "gsap/CustomEase";

let registered = false;

export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, Flip, Observer, CustomEase);
  CustomEase.create("ipcSmooth", "M0,0 C0.16,1 0.3,1 1,1");
  registered = true;
}

export { gsap, ScrollTrigger, Flip, Observer, CustomEase };
