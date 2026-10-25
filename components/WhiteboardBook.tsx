"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight, Sparkles } from "lucide-react";
import { Shelf } from "@/types";
import { getBoardPosition, getChapterLabel, getMediaItems } from "@/lib/whiteboard";

interface WhiteboardBookProps {
  shelf: Shelf;
  index: number;
  total: number;
  onOpen: (shelf: Shelf) => void;
  onMove: (shelfId: string, x: number, y: number) => void;
}

export function WhiteboardBook({ shelf, index, total, onOpen, onMove }: WhiteboardBookProps) {
  const media = getMediaItems(shelf);
  const tint = shelf.colorTheme || ["#1d2b38", "#493b57", "#273b35", "#543d2a"][index % 4];
  const fallbackPosition = shelf.position && (index === 0 || shelf.position.x !== 0 || shelf.position.y !== 0)
    ? shelf.position
    : getBoardPosition(index, total);

  return (
    <motion.article
      drag
      dragMomentum={false}
      onDragEnd={(_, info) => onMove(shelf.id, fallbackPosition.x + info.offset.x, fallbackPosition.y + info.offset.y)}
      whileHover={{ y: -8, rotate: 0, transition: { type: "spring", stiffness: 260, damping: 18 } }}
      whileDrag={{ scale: 1.04, rotate: -1, zIndex: 20, cursor: "grabbing" }}
      onDoubleClick={() => onOpen(shelf)}
      className="board-book absolute left-1/2 top-1/2 w-[238px] -translate-x-1/2 -translate-y-1/2 cursor-grab"
      style={{ x: fallbackPosition.x, y: fallbackPosition.y, rotate: [-2, 1, -1, 2][index % 4] }}
      data-testid={`board-book-${shelf.id}`}
    >
      <div className="book-shadow" />
      <div className="book-cover" style={{ backgroundColor: tint }}>
        <div className="book-binding" />
        <div className="book-mark">CHAPTER {String(index + 1).padStart(2, "0")}</div>
        <div className="book-symbol"><BookOpen size={22} strokeWidth={1.4} /></div>
        <h2>{shelf.title}</h2>
        <p>{getChapterLabel(shelf)}</p>
        <span className="book-footnote">{shelf.items.length} fragments · double click to open</span>
      </div>
      {media[0] && (
        <div className="book-peek book-peek-one">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={media[0].coverImageUrl} alt="" />
        </div>
      )}
      {media[1] && (
        <div className="book-peek book-peek-two">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={media[1].coverImageUrl} alt="" />
        </div>
      )}
      <div className="book-caption">
        <span><Sparkles size={11} /> {shelf.domain}</span>
        <ChevronRight size={13} />
      </div>
    </motion.article>
  );
}
