"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shelf, ShelfItem } from "@/types";
import { getStoredShelves, saveStoredShelves } from "@/lib/storage";
import { ShelfBlock } from "@/components/ShelfBlock";
import { ShelfDetailView } from "@/components/ShelfDetailView";
import { SmartAddModal } from "@/components/SmartAddModal";
import { CreateShelfModal } from "@/components/CreateShelfModal";
import { Plus } from "lucide-react";
import { jellyTap } from "@/lib/physics";

export default function Home() {
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [activeShelf, setActiveShelf] = useState<Shelf | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);

  // Load shelves on client mount
  useEffect(() => {
    setShelves(getStoredShelves());
  }, []);

  // Update storage whenever shelves change
  const handleUpdateShelves = (newShelves: Shelf[]) => {
    setShelves(newShelves);
    saveStoredShelves(newShelves);
    if (activeShelf) {
      const updatedActive = newShelves.find((s) => s.id === activeShelf.id) || null;
      setActiveShelf(updatedActive);
    }
  };

  const handleShelfCreated = (newShelf: Shelf) => {
    const updated = [...shelves, newShelf];
    handleUpdateShelves(updated);
  };

  const handleItemAdded = (item: ShelfItem) => {
    if (!activeShelf) return;
    const updated = shelves.map((s) => {
      if (s.id === activeShelf.id) {
        return {
          ...s,
          items: [item, ...s.items],
          itemCount: s.items.length + 1,
        };
      }
      return s;
    });
    handleUpdateShelves(updated);
  };

  const handleDeleteItem = (shelfId: string, itemId: string) => {
    const updated = shelves.map((s) => {
      if (s.id === shelfId) {
        const filtered = s.items.filter((i) => i.id !== itemId);
        return {
          ...s,
          items: filtered,
          itemCount: filtered.length,
        };
      }
      return s;
    });
    handleUpdateShelves(updated);
  };

  const totalEntries = shelves.reduce((acc, s) => acc + s.items.length, 0);

  return (
    <div className="relative min-h-screen bg-white text-black flex flex-col justify-center items-center overflow-x-hidden select-none px-6 py-16">
      {/* Top Hover Detection Zone: hovering mouse at the top edge reveals the header */}
      <div
        onMouseEnter={() => setIsHeaderVisible(true)}
        className="fixed top-0 left-0 right-0 h-10 z-40"
      />

      {/* Hidden Top Header (Only visible when dragging mouse up) */}
      <header
        onMouseEnter={() => setIsHeaderVisible(true)}
        onMouseLeave={() => setIsHeaderVisible(false)}
        className={`fixed top-0 left-0 right-0 z-50 px-8 py-4 flex items-center justify-between border-b border-black/10 bg-white/95 backdrop-blur-xl transition-all duration-300 transform ${
          isHeaderVisible
            ? "translate-y-0 opacity-100 shadow-md"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-black" />
          <div>
            <h1 className="font-mono text-xs font-semibold tracking-widest uppercase text-black">
              TASTEMEM
            </h1>
            <p className="font-mono text-[9px] text-neutral-500 tracking-wider">
              LIQUID MONOCHROME
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 font-mono text-[10px] text-neutral-600 bg-neutral-100 px-3 py-1.5 rounded-full border border-black/10">
            <span>{shelves.length} VAULTS</span>
            <span>•</span>
            <span>{totalEntries} ENTRIES</span>
          </div>

          <motion.button
            whileTap={jellyTap}
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-black text-white font-mono text-[11px] font-semibold tracking-wider uppercase hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>NEW SHELF</span>
          </motion.button>
        </div>
      </header>

      {/* Main Auto-Arranging Spatial Playground */}
      <main className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center my-auto">
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 justify-items-center items-center w-full"
        >
          {shelves.map((shelf) => (
            <ShelfBlock
              key={shelf.id}
              shelf={shelf}
              onOpen={(s) => setActiveShelf(s)}
            />
          ))}

          {/* Spawn Shelf Tile on Canvas (Black Squircle) */}
          <motion.div
            layout
            whileHover={{ scale: 1.04 }}
            whileTap={jellyTap}
            onClick={() => setIsCreateModalOpen(true)}
            className="w-64 h-64 sm:w-72 sm:h-72 p-5 rounded-squircle bg-black text-white border border-neutral-800 shadow-[0_15px_40px_rgba(0,0,0,0.18)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center text-center cursor-pointer transition-all group select-none"
          >
            <div className="w-14 h-14 rounded-full border border-neutral-700 bg-neutral-900 flex items-center justify-center text-neutral-300 group-hover:text-white group-hover:border-white transition-all mb-3.5">
              <Plus className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-white text-base font-medium tracking-tight">
              Create New Shelf
            </h3>
            <p className="font-mono text-[10px] text-neutral-400 mt-1 uppercase tracking-widest">
              :: SPAWN VAULT TILE
            </p>
          </motion.div>
        </motion.div>
      </main>

      {/* Expanded Shelf Detail View */}
      <AnimatePresence>
        {activeShelf && (
          <ShelfDetailView
            shelf={activeShelf}
            onBack={() => setActiveShelf(null)}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onDeleteItem={handleDeleteItem}
          />
        )}
      </AnimatePresence>

      {/* Domain-Aware Smart Add Modal */}
      {activeShelf && (
        <SmartAddModal
          domain={activeShelf.domain}
          shelfId={activeShelf.id}
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onItemAdded={handleItemAdded}
        />
      )}

      {/* Create Shelf Modal */}
      <CreateShelfModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onShelfCreated={handleShelfCreated}
      />
    </div>
  );
}
