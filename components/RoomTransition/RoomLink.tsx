"use client";

import Link, { LinkProps } from "next/link";
import { AnchorHTMLAttributes } from "react";
import { useRoomTransition } from "@/providers/RoomTransitionProvider";

type RoomLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    direction: "forward" | "back";
  };

export function RoomLink({ direction, ...props }: RoomLinkProps) {
  const { playIn } = useRoomTransition();

  return (
    <Link
      {...props}
      transitionTypes={[direction === "forward" ? "nav-forward" : "nav-back"]}
      onClick={(event) => {
        playIn();
        props.onClick?.(event);
      }}
    />
  );
}
