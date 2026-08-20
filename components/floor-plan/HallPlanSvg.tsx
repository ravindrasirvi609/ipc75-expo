"use client";

import { memo, type ComponentPropsWithoutRef, type RefObject } from "react";
import {
  ARROWS,
  AISLE_PATHS,
  BLOCKED_CELLS,
  CELL_TEXT,
  ENTRY_LABELS,
  HALL_RECT,
  LUNCHEON_RECT,
  RED_APRON,
  RED_FRAME,
  RULER,
  STALLS,
  VIEW_BOX,
  YELLOW_GATE,
  ZONE_LABELS,
  type PlanText,
  type Stall,
} from "@/lib/hall-1c-plan";
import type { StallStatus } from "@/lib/stall-bookings";

export type CellState = StallStatus | "selected";

export type HallPlanSvgProps = {
  /** Status per stall id; anything absent is available. */
  statuses: Record<string, StallStatus>;
  selected: ReadonlySet<string>;
  /** Stall ids to pulse - used by the search box. */
  highlighted?: ReadonlySet<string>;
  companies?: Record<string, string | undefined>;
  onActivate: (stall: Stall) => void;
  onHover?: (stall: Stall | null) => void;
  /** Pan/zoom transform applied to the whole drawing. */
  transform?: string;
  svgRef?: RefObject<SVGSVGElement | null>;
  /** Pointer handlers from usePanZoom. */
  gestures?: Pick<
    ComponentPropsWithoutRef<"svg">,
    | "onPointerDown"
    | "onPointerMove"
    | "onPointerUp"
    | "onPointerCancel"
    | "onPointerLeave"
  >;
};

const planText = (
  { text, x, y, size, length, anchor, rotate }: PlanText,
  key: string,
) => (
  <text
    key={key}
    className="hp-heavy"
    x={rotate ? 0 : x}
    y={rotate ? 0 : y}
    fontSize={size}
    textAnchor={anchor ?? "start"}
    textLength={length}
    lengthAdjust={length ? "spacingAndGlyphs" : undefined}
    transform={rotate ? `translate(${x} ${y}) rotate(90)` : undefined}
  >
    {text}
  </text>
);

/** The printed architecture: walls, frame, zones, aisles, rulers, signage. */
const PlanChrome = memo(function PlanChrome() {
  return (
    <g aria-hidden="true">
      {RED_FRAME.map((band, i) => (
        <rect
          key={`frame-${i}`}
          className="hp-red-fill"
          x={band.x}
          y={band.y}
          width={band.w}
          height={band.h}
        />
      ))}
      <path className="hp-red-fill" d={RED_APRON} />
      <rect
        className="hp-yellow"
        x={YELLOW_GATE.x}
        y={YELLOW_GATE.y}
        width={YELLOW_GATE.w}
        height={YELLOW_GATE.h}
      />

      <rect
        className="hp-wall"
        x={HALL_RECT.x}
        y={HALL_RECT.y}
        width={HALL_RECT.w}
        height={HALL_RECT.h}
      />
      <rect
        className="hp-zone"
        x={LUNCHEON_RECT.x}
        y={LUNCHEON_RECT.y}
        width={LUNCHEON_RECT.w}
        height={LUNCHEON_RECT.h}
      />
      {ZONE_LABELS.map((label, i) => planText(label, `zone-${i}`))}

      {AISLE_PATHS.map((aisle, i) => (
        <path
          key={`aisle-${i}`}
          className="hp-aisle"
          d={aisle.d}
          strokeWidth={aisle.width}
        />
      ))}
      {ARROWS.map((d, i) => (
        <path key={`arrow-${i}`} className="hp-red-fill" d={d} />
      ))}
      {ENTRY_LABELS.map((label, i) => planText(label, `entry-${i}`))}

      <g className="hp-ruler" fontSize={RULER.fontSize}>
        {RULER.top.map((tick) => (
          <text
            key={`rt-${tick.label}`}
            x={tick.x}
            y={tick.y}
            textAnchor="middle"
          >
            {tick.label}
          </text>
        ))}
        {RULER.left.map((tick) => (
          <text
            key={`rl-${tick.label}`}
            x={tick.x}
            y={tick.y}
            textAnchor="middle"
          >
            {tick.label}
          </text>
        ))}
      </g>

      {BLOCKED_CELLS.map((cell, i) => (
        <rect
          key={`blocked-${i}`}
          className="hp-blocked"
          x={cell.x}
          y={cell.y}
          width={cell.w}
          height={cell.h}
        />
      ))}
    </g>
  );
});

function StallCell({
  stall,
  state,
  company,
  highlighted,
  onActivate,
  onHover,
}: {
  stall: Stall;
  state: CellState;
  company?: string;
  highlighted: boolean;
  onActivate: (stall: Stall) => void;
  onHover?: (stall: Stall | null) => void;
}) {
  const locked = state === "booked" || state === "hold";
  const statusWord =
    state === "selected"
      ? "selected"
      : state === "booked"
        ? "booked"
        : state === "hold"
          ? "on hold"
          : "available";

  return (
    <g
      className={`hp-stall is-${state}${highlighted ? " is-found" : ""}`}
      role="button"
      tabIndex={0}
      aria-pressed={state === "selected"}
      aria-disabled={locked || undefined}
      aria-label={`Stall ${stall.id}, ${stall.size}, ${statusWord}${company ? `, ${company}` : ""}`}
      onClick={() => onActivate(stall)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onActivate(stall);
        }
      }}
      onMouseEnter={() => onHover?.(stall)}
      onMouseLeave={() => onHover?.(null)}
      onFocus={() => onHover?.(stall)}
      onBlur={() => onHover?.(null)}
    >
      <title>{`${stall.id} — ${stall.size} / ${stall.area} sqm — ${statusWord}${company ? ` — ${company}` : ""}`}</title>
      <rect x={stall.x} y={stall.y} width={stall.w} height={stall.h} />
      <text
        className="hp-cell-id"
        x={stall.x + CELL_TEXT.idOffset.x}
        y={stall.y + CELL_TEXT.idOffset.y}
        fontSize={CELL_TEXT.fontSize}
      >
        {stall.label}
      </text>
      <text
        x={stall.x + CELL_TEXT.sizeOffset.x}
        y={stall.y + CELL_TEXT.sizeOffset.y}
        fontSize={CELL_TEXT.fontSize}
        textAnchor="end"
      >
        {stall.size}
      </text>
      <text
        x={stall.x + CELL_TEXT.areaOffset.x}
        y={stall.y + CELL_TEXT.areaOffset.y}
        fontSize={CELL_TEXT.fontSize}
        textAnchor="end"
      >
        {stall.area}sqm
      </text>
    </g>
  );
}

export default function HallPlanSvg({
  statuses,
  selected,
  highlighted,
  companies,
  onActivate,
  onHover,
  transform,
  svgRef,
  gestures,
}: HallPlanSvgProps) {
  return (
    <svg
      ref={svgRef}
      className="hp-svg"
      viewBox={`${VIEW_BOX.x} ${VIEW_BOX.y} ${VIEW_BOX.width} ${VIEW_BOX.height}`}
      role="group"
      aria-label="Interactive floor plan of Hall 1C, 75th Indian Pharmaceutical Congress"
      {...gestures}
    >
      <g transform={transform}>
        <PlanChrome />
        {STALLS.map((stall) => {
          const status = statuses[stall.id] ?? "available";
          const state: CellState = selected.has(stall.id) ? "selected" : status;
          return (
            <StallCell
              key={stall.id}
              stall={stall}
              state={state}
              company={companies?.[stall.id]}
              highlighted={Boolean(highlighted?.has(stall.id))}
              onActivate={onActivate}
              onHover={onHover}
            />
          );
        })}
      </g>
    </svg>
  );
}
