"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Domain, Shelf } from "@/types";
import { X, Tv, Film, Disc, Book, MapPin, Plus } from "lucide-react";
import { liquidSpring, jellyTap } from "@/lib/physics";

interface CreateShelfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShelfCreated: (shelf: Shelf) => void;
}

const DOMAIN_OPTIONS: { id: Domain; label: string; icon: React.ElementType }[] = [
  { id: "anime", label: "Anime", icon: Tv },
  { id: "movies", label: "Cinema / TV", icon: Film },
  { id: "music", label: "Music / Vinyl", icon: Disc },
  { id: "books", label: "Literature", icon: Book },
  { id: "places", label: "Places / Cafés", icon: MapPin },
];

export const CreateShelfModal: React.FC<CreateShelfModalProps> = ({
  isOpen,
  onClose,
  onShelfCreated,
}) => {
  const [title, setTitle] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<Domain>("anime");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newShelf: Shelf = {
      id: "shelf-" + Date.now(),
      title: title.trim(),
      domain: selectedDomain,
      itemCount: 0,
      items: [],
      createdAt: new Date().toISOString(),
      position: { x: 0, y: 0 },
    };

    onShelfCreated(newShelf);
    setTitle("");
    setSelectedDomain("anime");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={liquidSpring}
          className="relative w-full max-w-md rounded-3xl bg-neutral-950 border border-white/15 p-6 shadow-2xl z-10"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-white" />
              <h3 className="font-mono text-xs text-neutral-400 uppercase tracking-widest">
                CREATE NEW SHELF
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            {/* Shelf Name Input */}
            <div>
              <label className="block font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-2">
                SHELF NAME
              </label>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Studio Ghibli Archive, Cyberpunk, Tokyo Cafés..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-neutral-900 border border-white/15 focus:border-white focus:outline-none text-white text-sm placeholder-neutral-600 transition-colors"
              />
            </div>

            {/* Domain Picker */}
            <div>
              <label className="block font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-2">
                DOMAIN ANCHOR (FOR SMART ADD)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DOMAIN_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedDomain === opt.id;
                  return (
                    <motion.button
                      type="button"
                      key={opt.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedDomain(opt.id)}
                      className={`p-3 rounded-2xl border text-left flex items-center space-x-3 transition-colors ${
                        isSelected
                          ? "bg-white text-black border-white"
                          : "bg-neutral-900 text-neutral-400 border-white/10 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-medium">{opt.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              whileTap={jellyTap}
              disabled={!title.trim()}
              className="w-full py-3.5 rounded-2xl bg-white text-black font-semibold text-xs tracking-wider uppercase flex items-center justify-center space-x-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all mt-4"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>SPAWN SHELF TILE</span>
            </motion.button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
