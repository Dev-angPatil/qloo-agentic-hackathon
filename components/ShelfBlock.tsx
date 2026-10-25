"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shelf } from "@/types";
import { Tv, Film, Disc, Book, MapPin, Layers } from "lucide-react";
import { jiggleVariants } from "@/lib/physics";

interface ShelfBlockProps {
  shelf: Shelf;
  onOpen: (shelf: Shelf) => void;
  onSetCoverItem?: (shelfId: string, itemId: string) => void;
}

const DOMAIN_ICONS: Record<string, React.ElementType> = {
  anime: Tv,
  movies: Film,
  music: Disc,
  books: Book,
  places: MapPin,
};

export const ShelfBlock: React.FC<ShelfBlockProps> = ({
  shelf,
  onOpen,
  onSetCoverItem,
}) => {
  const IconComponent = DOMAIN_ICONS[shelf.domain] || Tv;
  const isDraggingRef = React.useRef(false);

  // Single poster selection: either user-selected coverItemId or the first item
  const activePosterItem =
    (shelf.coverItemId && shelf.items.find((i) => i.id === shelf.coverItemId)) ||
    shelf.items[0];

  const currentIndex = shelf.items.findIndex(
    (i) => i.id === activePosterItem?.id
  );

  const handleCyclePoster = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (shelf.items.length <= 1 || !onSetCoverItem) return;
    const nextIndex = (currentIndex + 1) % shelf.items.length;
    const nextItem = shelf.items[nextIndex];
    if (nextItem) {
      onSetCoverItem(shelf.id, nextItem.id);
    }
  };

  return (
    <motion.div
      layout
      drag
      dragSnapToOrigin={true}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.65}
      dragTransition={{ bounceStiffness: 350, bounceDamping: 10, power: 0.2 }}
      onDragStart={() => {
        isDraggingRef.current = true;
      }}
      onDragEnd={() => {
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 120);
      }}
      whileDrag={{
        scaleX: 1.12,
        scaleY: 0.9,
        scale: 1.05,
        cursor: "grabbing",
        zIndex: 50,
        boxShadow: "0 30px 60px -10px rgba(0, 0, 0, 0.6)",
      }}
      variants={jiggleVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      onClick={() => {
        if (!isDraggingRef.current) {
          onOpen(shelf);
        }
      }}
      className="relative w-64 h-64 sm:w-72 sm:h-72 aspect-square p-5 rounded-[32px] sm:rounded-[36px] bg-black text-white shadow-[0_20px_50px_rgba(0,0,0,0.25)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.38)] border border-neutral-800 flex flex-col justify-between cursor-grab active:cursor-grabbing select-none transition-shadow group overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:via-transparent before:to-transparent before:pointer-events-none before:rounded-[32px] sm:before:rounded-[36px]"
      style={{ touchAction: "none" }}
    >
      {/* Top Header: Domain Dot Matrix Badge, Poster Cycle Button, & Icon */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="font-mono text-[10px] tracking-widest text-neutral-400 uppercase">
            :: {shelf.domain}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Quick tactile cycle poster button if multiple items exist */}
          {shelf.items.length > 1 && (
            <button
              onClick={handleCyclePoster}
              title="Click to cycle vault poster"
              className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700/80 hover:border-neutral-500 text-neutral-300 hover:text-white transition-all text-[9px] font-mono cursor-pointer"
            >
              <Layers className="w-2.5 h-2.5" />
              <span>
                {currentIndex >= 0 ? currentIndex + 1 : 1}/{shelf.items.length}
              </span>
            </button>
          )}

          <div className="w-7 h-7 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-neutral-300 group-hover:text-white transition-colors">
            <IconComponent className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Center: Single Poster Frame with Soft Viscous Depth */}
      <div className="relative my-auto flex flex-col items-center justify-center py-1">
        {!activePosterItem ? (
          <div className="w-full h-32 rounded-2xl border border-dashed border-neutral-800 flex flex-col items-center justify-center text-neutral-600">
            <span className="font-mono text-[11px] tracking-wider uppercase">
              EMPTY VAULT
            </span>
          </div>
        ) : (
          <div className="relative w-28 h-36 sm:w-32 sm:h-44 rounded-xl overflow-hidden shadow-[0_14px_30px_rgba(0,0,0,0.7)] border border-neutral-700/70 bg-neutral-900 group-hover:scale-105 transition-transform duration-300">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activePosterItem.coverImageUrl}
              alt={activePosterItem.title}
              className="w-full h-full object-cover pointer-events-none"
            />
            {/* Ambient gloss reflection */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-white/10 pointer-events-none" />
            {/* Title pill on poster */}
            <div className="absolute bottom-1.5 left-1.5 right-1.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md border border-white/10">
              <p className="text-[10px] font-mono text-white/90 truncate text-center">
                {activePosterItem.title}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer: Title, Count, & Open Indicator */}
      <div className="border-t border-neutral-800 pt-3 flex items-end justify-between relative z-10">
        <div className="truncate pr-2">
          <h3 className="text-white font-medium text-base tracking-tight truncate group-hover:text-white transition-colors">
            {shelf.title}
          </h3>
          <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
            {shelf.items.length === 1
              ? "1 ENTRY"
              : `${shelf.items.length} ENTRIES`}
          </span>
        </div>
        <div className="font-mono text-[9px] text-neutral-500 tracking-widest uppercase">
          [OPEN]
        </div>
      </div>
    </motion.div>
  );
};
