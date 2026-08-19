import { ViewTransition } from "react";
import { RoomLink } from "@/components/RoomTransition/RoomLink";
import { ROOM_VIEW_TRANSITION } from "@/components/animations/pageTransitions";

export default function Home() {
  return (
    <ViewTransition {...ROOM_VIEW_TRANSITION}>
      <main className="flex min-h-screen flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--accent)]">
          75th Edition
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl">
          Indian Pharmaceutical Congress
        </h1>
        <p className="max-w-xl text-base text-[color:color-mix(in_srgb,var(--foreground)_70%,transparent)] sm:text-lg">
          A digital exhibition marking seventy-five years of pharmaceutical
          science, discovery, and community in India.
        </p>
        <RoomLink
          href="/register"
          direction="forward"
          className="mt-4 rounded-full border border-[color:var(--accent)] px-8 py-3 text-sm uppercase tracking-[0.15em] text-[color:var(--accent)] transition-colors hover:bg-[color:var(--accent)] hover:text-[color:var(--surface)]"
        >
          Register
        </RoomLink>
      </main>
    </ViewTransition>
  );
}
