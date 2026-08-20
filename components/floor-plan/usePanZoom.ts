"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type Viewport = { z: number; tx: number; ty: number };

const MIN_Z = 0.75;
const MAX_Z = 9;
const IDENTITY: Viewport = { z: 1, tx: 0, ty: 0 };

type Box = { x: number; y: number; width: number; height: number };
type Rect = { x: number; y: number; w: number; h: number };

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const DEFAULT_FOCUS_Z = 3.2;

/**
 * Viewport that centres `rect`. Pure so it can seed useState on the first
 * render - a deep link then renders already zoomed in, server and client alike.
 */
function focusViewport(
  viewBox: Box,
  rect: Rect,
  z = DEFAULT_FOCUS_Z,
): Viewport {
  const zoom = clamp(z, MIN_Z, MAX_Z);
  return {
    z: zoom,
    tx: viewBox.x + viewBox.width / 2 - zoom * (rect.x + rect.w / 2),
    ty: viewBox.y + viewBox.height / 2 - zoom * (rect.y + rect.h / 2),
  };
}

/**
 * Pan/zoom for an SVG whose content is wrapped in a single transformed <g>.
 *
 * Works in the SVG's own user-space units: the wheel zooms about the pointer,
 * dragging pans, two fingers pinch. Panning is clamped so the drawing always
 * keeps at least a third of itself on screen.
 */
export function usePanZoom(viewBox: Box, initialFocus?: Rect) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [view, setView] = useState<Viewport>(() =>
    initialFocus ? focusViewport(viewBox, initialFocus) : IDENTITY,
  );
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number } | null>(null);
  /** Set once a gesture travels far enough to be a drag rather than a click. */
  const dragged = useRef(false);

  /** Client coords -> untransformed SVG user space. */
  const toUserSpace = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const point = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    return { x: point.x, y: point.y };
  }, []);

  /** User-space distance covered by one client pixel at the current fit. */
  const unitsPerPixel = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return 1;
    const rect = svg.getBoundingClientRect();
    if (!rect.width || !rect.height) return 1;
    return Math.max(viewBox.width / rect.width, viewBox.height / rect.height);
  }, [viewBox.height, viewBox.width]);

  const clampPan = useCallback(
    ({ z, tx, ty }: Viewport): Viewport => {
      // Keep the scaled drawing overlapping the viewport by at least a third.
      const slackX = viewBox.width * (z - 1) + viewBox.width * 0.66;
      const slackY = viewBox.height * (z - 1) + viewBox.height * 0.66;
      return {
        z,
        tx: clamp(tx, -slackX, viewBox.width * 0.66),
        ty: clamp(ty, -slackY, viewBox.height * 0.66),
      };
    },
    [viewBox.height, viewBox.width],
  );

  /** Zoom to `z` while pinning `anchor` (user space) to its current position. */
  const zoomAbout = useCallback(
    (nextZ: number, anchor: { x: number; y: number }) => {
      setView((current) => {
        const z = clamp(nextZ, MIN_Z, MAX_Z);
        const px = (anchor.x - current.tx) / current.z;
        const py = (anchor.y - current.ty) / current.z;
        return clampPan({ z, tx: anchor.x - z * px, ty: anchor.y - z * py });
      });
    },
    [clampPan],
  );

  const zoomBy = useCallback(
    (factor: number) => {
      const centre = {
        x: viewBox.x + viewBox.width / 2,
        y: viewBox.y + viewBox.height / 2,
      };
      setView((current) => {
        const z = clamp(current.z * factor, MIN_Z, MAX_Z);
        const px = (centre.x - current.tx) / current.z;
        const py = (centre.y - current.ty) / current.z;
        return clampPan({ z, tx: centre.x - z * px, ty: centre.y - z * py });
      });
    },
    [clampPan, viewBox.height, viewBox.width, viewBox.x, viewBox.y],
  );

  const reset = useCallback(() => setView(IDENTITY), []);

  /** Centre a rect in the viewport at the given zoom - used by search. */
  const focusRect = useCallback(
    (rect: Rect, z = DEFAULT_FOCUS_Z) =>
      setView(clampPan(focusViewport(viewBox, rect, z))),
    [clampPan, viewBox],
  );

  /**
   * Wheel zoom is registered natively because React's onWheel is passive and
   * cannot call preventDefault, which would let the host page scroll instead.
   */
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const factor = Math.exp(-event.deltaY * 0.0016);
      zoomAbout(view.z * factor, toUserSpace(event.clientX, event.clientY));
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [toUserSpace, view.z, zoomAbout]);

  const onPointerDown = useCallback((event: React.PointerEvent) => {
    if (pointers.current.size === 0) dragged.current = false;
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { distance: Math.hypot(a.x - b.x, a.y - b.y) || 1 };
      dragged.current = true;
    }
  }, []);

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      const previous = pointers.current.get(event.pointerId);
      if (!previous) return;
      const next = { x: event.clientX, y: event.clientY };
      pointers.current.set(event.pointerId, next);

      if (pointers.current.size >= 2) {
        const [a, b] = [...pointers.current.values()];
        const distance = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        const start = pinch.current;
        if (start) {
          const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
          zoomAbout(
            view.z * (distance / start.distance),
            toUserSpace(mid.x, mid.y),
          );
          pinch.current = { distance };
        }
        return;
      }

      if (
        Math.abs(next.x - previous.x) > 2 ||
        Math.abs(next.y - previous.y) > 2
      ) {
        dragged.current = true;
      }
      const scale = unitsPerPixel();
      const dx = (next.x - previous.x) * scale;
      const dy = (next.y - previous.y) * scale;
      if (!dx && !dy) return;
      setView((current) =>
        clampPan({ ...current, tx: current.tx + dx, ty: current.ty + dy }),
      );
    },
    [clampPan, toUserSpace, unitsPerPixel, view.z, zoomAbout],
  );

  const endPointer = useCallback((event: React.PointerEvent) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  }, []);

  const handlers = useMemo(
    () => ({
      onPointerDown,
      onPointerMove,
      onPointerUp: endPointer,
      onPointerCancel: endPointer,
      onPointerLeave: endPointer,
    }),
    [endPointer, onPointerDown, onPointerMove],
  );

  return {
    svgRef,
    view,
    transform: `translate(${view.tx} ${view.ty}) scale(${view.z})`,
    handlers,
    zoomBy,
    reset,
    focusRect,
    /** True when the last gesture was a drag, so the click should be ignored. */
    hasDragged: () => dragged.current,
    canZoomIn: view.z < MAX_Z,
    canZoomOut: view.z > MIN_Z,
    isDefault: view.z === 1 && view.tx === 0 && view.ty === 0,
  };
}
