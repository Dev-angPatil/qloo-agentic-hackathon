"use client";

import React from "react";
import { motion } from "framer-motion";
import { Disc3, Heart, Pin, Star } from "lucide-react";
import { ShelfItem, Vibe } from "@/types";
import { getMemoryToneColor, getVibeItemPosition, normalizeMemoryStyle } from "@/lib/whiteboard";

interface MemoryPostItProps {
  item: ShelfItem;
  index: number;
  onUpdate: (item: ShelfItem) => void;
  vibes: Vibe[];
  onMove: (item: ShelfItem, position: { x: number; y: number }) => void;
}

export function MemoryPostIt({ item, index, onUpdate, vibes, onMove }: MemoryPostItProps) {
  const color = item.accent || getMemoryToneColor(item.memoryTone);
  const note = item.userNote || item.description || item.title;
  const style = normalizeMemoryStyle(item.memoryStyle);
  const isRecord = item.memoryType === "media" || style === "record";
  const vibe = item.vibeId ? vibes.find((candidate) => candidate.id === item.vibeId) : undefined;
  const fallbackPosition = { x: 180 + (index % 3) * 190, y: -20 + Math.floor(index / 3) * 230 };
  const absolutePosition = item.position ? getVibeItemPosition(item, vibe) : fallbackPosition;
  const baseX = absolutePosition.x;
  const baseY = absolutePosition.y;

  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      drag={!item.pinned}
      dragMomentum={false}
      onDragEnd={(_, info) => onMove(item, { x: baseX + info.offset.x, y: baseY + info.offset.y })}
      whileHover={{ scale: 1.04, rotate: 0, zIndex: 30, transition: { type: "spring", stiffness: 280, damping: 16 } }}
      whileDrag={{ scale: 1.06, rotate: 0, zIndex: 40, cursor: "grabbing" }}
      className={`memory-card memory-card-${isRecord ? "record" : style} memory-card-shape-${item.memoryShape || "note"} memory-card-finish-${item.memoryFinish || "paper"} memory-card-pattern-${item.memoryPattern || "none"} absolute left-1/2 top-1/2 w-[196px] ${item.pinned ? "cursor-default" : "cursor-grab"}`}
      style={{
        x: baseX,
        y: baseY,
        rotate: [-4, 3, -1, 5, -3][index % 5],
        backgroundColor: color,
      }}
      title={`${item.title} · ${new Date(item.createdAt).toLocaleDateString()}`}
    >
      <button type="button" className={`memory-card-pin ${item.pinned ? "memory-card-pin-active" : ""}`} aria-label={item.pinned ? "Unpin item" : "Pin item"} title={item.pinned ? "Unpin item" : "Pin item"} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onUpdate({ ...item, pinned: !item.pinned }); }}><Pin size={13} fill={item.pinned ? "currentColor" : "none"} /></button>
      {isRecord ? (
        <>
          <div className="record-card-header"><span>{item.domain}</span><span>{item.recordStatus?.replace("-", " ") || "record"}</span></div>
          <div className="record-card-cover">{item.coverImageUrl ? <img src={item.coverImageUrl} alt="" /> : <Disc3 size={44} />}</div>
          <h3>{item.title}</h3>
          <p>{note}</p>
          <div className="record-card-rating">{[1, 2, 3, 4, 5].map((value) => <Star key={value} size={12} fill={value <= (item.rating || 0) ? "currentColor" : "none"} />)}</div>
        </>
      ) : style === "vinyl" ? (
        <>
          <div className="vinyl-album-art" style={{ backgroundColor: color }}><Disc3 size={78} strokeWidth={1} /></div>
          <div className="vinyl-label"><span>{item.domain}</span><Heart size={12} /></div>
          <p>{note}</p>
          <div className="post-it-footer"><span>{item.title}</span><span>{new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span></div>
        </>
      ) : (
        <>
           <div className="post-it-eyebrow"><span>{item.domain}</span><Heart size={12} /></div>
          <p>{note}</p>
          <div className="post-it-footer"><span>{item.title}</span><span>{new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span></div>
        </>
      )}
    </motion.article>
  );
}
