"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Domain, Shelf, ShelfItem } from "@/types";
import { ArrowLeft, Plus, Tv, Film, Disc, Book, MapPin, Trash2, Compass } from "lucide-react";
import { liquidSpring, jellyTap } from "@/lib/physics";

interface ShelfDetailViewProps {
  shelf: Shelf;
  onBack: () => void;
  onOpenAddModal: () => void;
  onDeleteItem: (shelfId: string, itemId: string) => void;
  onDeleteShelf?: (shelfId: string) => void;
  onOpenCompass?: (domain: Domain) => void;
}

const DOMAIN_ICONS: Record<string, React.ElementType> = {
  anime: Tv,
  movies: Film,
  music: Disc,
  books: Book,
  places: MapPin,
};

export const ShelfDetailView: React.FC<ShelfDetailViewProps> = ({
  shelf,
  onBack,
  onOpenAddModal,
  onDeleteItem,
  onDeleteShelf,
  onOpenCompass,
}) => {
  const IconComponent = DOMAIN_ICONS[shelf.domain] || Tv;

  // Escape key to navigate back to canvas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onBack]);

  const handleDeleteShelf = () => {
    if (!onDeleteShelf) return;
    if (confirm(`Delete the "${shelf.title}" vault and its entries?`)) {
      onDeleteShelf(shelf.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={liquidSpring}
      className="fixed inset-0 z-50 bg-black flex flex-col overflow-y-auto"
    >
      {/* Top Floating Glass Navigation Bar */}
      <header className="sticky top-0 z-20 w-full px-6 py-4 flex items-center justify-between border-b border-white/[0.08] bg-black/80 backdrop-blur-xl">
        <motion.button
          whileTap={jellyTap}
          onClick={onBack}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-white/10 hover:border-white/30 bg-neutral-950 text-neutral-300 hover:text-white transition-all text-xs font-mono tracking-wider uppercase"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>CANVAS</span>
        </motion.button>

        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-1.5">
            <IconComponent className="w-3.5 h-3.5 text-neutral-400" />
            <span className="font-mono text-[10px] tracking-widest text-neutral-400 uppercase">
              :: {shelf.domain}
            </span>
          </div>
          <h1 className="text-white text-lg font-medium tracking-tight">
            {shelf.title}
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <span className="font-mono text-xs text-neutral-500 uppercase tracking-widest hidden sm:inline">
            {shelf.items.length} {shelf.items.length === 1 ? "ITEM" : "ITEMS"}
          </span>
          {onDeleteShelf && (
            <button
              onClick={handleDeleteShelf}
              title="Delete Shelf"
              className="w-8 h-8 rounded-full bg-neutral-950 border border-neutral-800 hover:border-red-500/40 text-neutral-500 hover:text-red-400 flex items-center justify-center transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        {shelf.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl border border-dashed border-white/20 flex items-center justify-center text-neutral-600">
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-white text-base font-medium">Vault is currently empty</h2>
              <p className="text-neutral-500 text-sm mt-1 max-w-sm">
                Tap the liquid add button below to search {shelf.domain} and add to this shelf.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            <AnimatePresence>
              {shelf.items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={liquidSpring}
                  className="group relative rounded-2xl bg-neutral-950 border border-white/10 hover:border-white/25 overflow-hidden flex flex-col justify-between shadow-lg transition-all"
                >
                  {/* Poster / Artwork Container */}
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.coverImageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Top Overlay Badge: Year & Delete action */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.year ? (
                        <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-white">
                          {item.year}
                        </span>
                      ) : <span />}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(shelf.id, item.id);
                        }}
                        className="w-6 h-6 rounded-full bg-black/80 border border-red-500/30 text-neutral-400 hover:text-red-400 flex items-center justify-center transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata and Human Memory Plaque */}
                  <div className="p-3.5 flex flex-col justify-between flex-1 bg-neutral-950">
                    <div>
                      <h3 className="text-white font-medium text-sm leading-snug line-clamp-1">
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="text-neutral-500 text-xs mt-0.5 line-clamp-1">
                          {item.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Personal Human Note */}
                    {item.userNote && (
                      <div className="mt-2.5 pt-2 border-t border-white/[0.06]">
                        <p className="text-neutral-300 text-[11px] italic leading-relaxed line-clamp-2">
                          “{item.userNote}”
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-30 flex items-center space-x-3">
        {onOpenCompass && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={jellyTap}
            onClick={() => onOpenCompass(shelf.domain)}
            className="flex items-center space-x-2 px-4 py-3 rounded-full bg-neutral-900 border border-neutral-700 hover:border-white text-white font-mono text-xs tracking-wider uppercase shadow-xl transition-all cursor-pointer"
            title={`Open Taste Compass for ${shelf.domain}`}
          >
            <Compass className="w-4 h-4 text-white stroke-[2.2]" />
            <span className="hidden sm:inline">TASTE COMPASS</span>
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={jellyTap}
          onClick={onOpenAddModal}
          className="flex items-center space-x-2 px-5 py-3.5 rounded-full bg-white text-black font-medium text-sm shadow-[0_10px_35px_rgba(255,255,255,0.25)] hover:bg-neutral-200 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="font-mono text-xs tracking-wider uppercase font-semibold">
            ADD {shelf.domain.toUpperCase()}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};
