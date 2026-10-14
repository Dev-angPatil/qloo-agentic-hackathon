"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shelf } from "@/types";
import { Tv, Film, Disc, Book, MapPin } from "lucide-react";
import { jiggleVariants } from "@/lib/physics";

interface ShelfBlockProps {
  shelf: Shelf;
  onOpen: (shelf: Shelf) => void;
}

const DOMAIN_ICONS: Record<string, React.ElementType> = {
  anime: Tv,
  movies: Film,
  music: Disc,
  books: Book,
  places: MapPin,
};

export const ShelfBlock: React.FC<ShelfBlockProps> = ({ shelf, onOpen }) => {
  const IconComponent = DOMAIN_ICONS[shelf.domain] || Tv;
  const previewItems = shelf.items.slice(0, 4);
  const isDraggingRef = React.useRef(false);

  return (
    <motion.div
      layout
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.4}
      dragTransition={{ bounceStiffness: 450, bounceDamping: 22 }}
      onDragStart={() => {
        isDraggingRef.current = true;
      }}
      onDragEnd={() => {
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 80);
      }}
      whileDrag={{ scale: 1.08, zIndex: 50, cursor: "grabbing" }}
      variants={jiggleVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      onClick={() => {
        if (!isDraggingRef.current) {
          onOpen(shelf);
        }
      }}
      className="relative w-64 h-64 sm:w-72 sm:h-72 p-5 rounded-squircle bg-black text-white shadow-[0_15px_40px_rgba(0,0,0,0.18)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.3)] border border-neutral-800 flex flex-col justify-between cursor-grab active:cursor-grabbing select-none transition-shadow group"
      style={{ touchAction: "none" }}
    >
      {/* Top Header: Domain Dot Matrix Badge & Icon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="font-mono text-[10px] tracking-widest text-neutral-400 uppercase">
            :: {shelf.domain}
          </span>
        </div>
        <div className="w-7 h-7 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-neutral-300 group-hover:text-white transition-colors">
          <IconComponent className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Center: Tactile 2x2 Mini Collage or Empty State */}
      <div className="my-auto py-2">
        {previewItems.length === 0 ? (
          <div className="w-full h-24 rounded-2xl border border-dashed border-neutral-800 flex flex-col items-center justify-center text-neutral-600">
            <span className="font-mono text-[11px] tracking-wider">EMPTY VAULT</span>
          </div>
        ) : previewItems.length === 1 ? (
          <div className="w-20 h-28 mx-auto rounded-xl overflow-hidden border border-neutral-800 shadow-md relative bg-neutral-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewItems[0].coverImageUrl}
              alt={previewItems[0].title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 w-32 mx-auto">
            {previewItems.map((item, idx) => (
              <div
                key={item.id || idx}
                className="w-14 h-14 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 relative shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.coverImageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Footer: Title and Count */}
      <div className="border-t border-neutral-800 pt-3 flex items-end justify-between">
        <div className="truncate pr-2">
          <h3 className="text-white font-medium text-base tracking-tight truncate group-hover:text-white transition-colors">
            {shelf.title}
          </h3>
          <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
            {shelf.items.length === 1 ? "1 ENTRY" : `${shelf.items.length} ENTRIES`}
          </span>
        </div>
        <div className="font-mono text-[9px] text-neutral-500 tracking-widest uppercase">
          [OPEN]
        </div>
      </div>
    </motion.div>
  );
};
