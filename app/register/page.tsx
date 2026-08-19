"use client";

import { useState, ViewTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { RoomLink } from "@/components/RoomTransition/RoomLink";
import { ROOM_VIEW_TRANSITION } from "@/components/animations/pageTransitions";

export default function Register() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <ViewTransition {...ROOM_VIEW_TRANSITION}>
      <main className="mx-auto flex min-h-screen w-full max-w-lg flex-1 flex-col items-center justify-center gap-8 px-6 py-32 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--accent)]">
          Join Us
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Register</h1>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full rounded-lg border border-[color:color-mix(in_srgb,var(--foreground)_15%,transparent)] px-6 py-10"
            >
              <p className="text-lg">
                Thank you for registering for the 75th Indian Pharmaceutical
                Congress. A confirmation will follow shortly.
              </p>
              <RoomLink
                href="/"
                direction="back"
                className="mt-6 inline-block text-sm uppercase tracking-[0.15em] text-[color:var(--accent)]"
              >
                Back to Home
              </RoomLink>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex w-full flex-col gap-4 text-left"
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
              }}
            >
              <label className="flex flex-col gap-2 text-sm">
                Full name
                <input
                  required
                  name="name"
                  type="text"
                  className="rounded border border-[color:color-mix(in_srgb,var(--foreground)_20%,transparent)] bg-transparent px-4 py-3 outline-none focus:border-[color:var(--accent)]"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                Email
                <input
                  required
                  name="email"
                  type="email"
                  className="rounded border border-[color:color-mix(in_srgb,var(--foreground)_20%,transparent)] bg-transparent px-4 py-3 outline-none focus:border-[color:var(--accent)]"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                Organisation
                <input
                  name="organisation"
                  type="text"
                  className="rounded border border-[color:color-mix(in_srgb,var(--foreground)_20%,transparent)] bg-transparent px-4 py-3 outline-none focus:border-[color:var(--accent)]"
                />
              </label>
              <button
                type="submit"
                className="mt-2 rounded-full border border-[color:var(--accent)] px-8 py-3 text-sm uppercase tracking-[0.15em] text-[color:var(--accent)] transition-colors hover:bg-[color:var(--accent)] hover:text-[color:var(--surface)]"
              >
                Submit
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </main>
    </ViewTransition>
  );
}
