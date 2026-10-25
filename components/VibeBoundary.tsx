"use client";

import React, { useRef } from "react";
import { motion, useDragControls } from "framer-motion";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { ShelfItem, Vibe } from "@/types";
import { getVibeBoundaryMetrics } from "@/lib/whiteboard";

interface VibeBoundaryProps {
  vibe: Vibe;
  items: ShelfItem[];
  onMove: (vibe: Vibe, position: { x: number; y: number }) => void;
  onResize: (vibe: Vibe, size: { width: number; height: number }) => void;
  onToggleCollapse: (vibe: Vibe) => void;
}

export function VibeBoundary({ vibe, items, onMove, onResize, onToggleCollapse }: VibeBoundaryProps) {
  const dragControls = useDragControls();
  const resizeState = useRef<{ startX: number; startY: number; width: number; height: number } | null>(null);
  const metrics = getVibeBoundaryMetrics(vibe, items);
  const isDark = vibe.style === "blackboard";
  const fill = isDark ? "#343a40" : vibe.color;
  const headerLeft = Math.max(22, -metrics.left + 24);
  const headerTop = Math.max(18, -metrics.top + 22);

  const startResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    resizeState.current = { startX: event.clientX, startY: event.clientY, width: vibe.size.width, height: vibe.size.height };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const resize = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!resizeState.current) return;
    onResize(vibe, {
      width: Math.max(300, resizeState.current.width + event.clientX - resizeState.current.startX),
      height: Math.max(220, resizeState.current.height + event.clientY - resizeState.current.startY),
    });
  };

  const endResize = () => { resizeState.current = null; };

  return (
    <motion.section
      drag
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      onDragEnd={(_, info) => onMove(vibe, { x: vibe.position.x + info.offset.x, y: vibe.position.y + info.offset.y })}
      className={`vibe-boundary vibe-style-${vibe.style} vibe-texture-${vibe.texture} vibe-border-${vibe.border}`}
      style={{ x: vibe.position.x + metrics.left, y: vibe.position.y + metrics.top, width: metrics.width, height: vibe.collapsed ? 58 : metrics.height, opacity: isDark ? 0.94 : vibe.opacity }}
      whileDrag={{ scale: 1.01, zIndex: 5, cursor: "grabbing" }}
    >
      <svg className="vibe-surface" style={{ "--vibe-fill": fill } as React.CSSProperties} width={metrics.width} height={vibe.collapsed ? 58 : metrics.height} viewBox={`0 0 ${metrics.width} ${vibe.collapsed ? 58 : metrics.height}`} aria-hidden="true">
        <path d={vibe.collapsed ? `M 18 20 C 120 2 ${metrics.width - 70} 5 ${metrics.width - 18} 28 C ${metrics.width - 52} 64 120 62 18 42 Z` : metrics.path} />
      </svg>
      <div className="vibe-header" style={{ left: headerLeft, top: headerTop }} onPointerDown={(event) => { event.stopPropagation(); dragControls.start(event); }}>
        <span className="vibe-drag-handle"><GripVertical size={14} /></span>
        <div className="min-w-0"><strong>{vibe.title}</strong><span>{items.length}</span></div>
        <button type="button" className="vibe-collapse-button" aria-label={vibe.collapsed ? "Expand Vibe" : "Collapse Vibe"} onPointerDown={(event) => event.stopPropagation()} onClick={() => onToggleCollapse(vibe)}>{vibe.collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}</button>
      </div>
      {!vibe.collapsed && <><p className="vibe-description" style={{ left: headerLeft + 23, top: headerTop + 39 }}>{vibe.description || "A space for things that belong together."}</p><button type="button" className="vibe-resize-handle" aria-label="Resize Vibe" onPointerDown={startResize} onPointerMove={resize} onPointerUp={endResize} /></>}
    </motion.section>
  );
}
