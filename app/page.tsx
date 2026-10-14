"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shelf, ShelfItem } from "@/types";
import { getStoredShelves, saveStoredShelves, exportShelvesToJson, resetToSeedShelves } from "@/lib/storage";
import { ShelfBlock } from "@/components/ShelfBlock";
import { ShelfDetailView } from "@/components/ShelfDetailView";
import { SmartAddModal } from "@/components/SmartAddModal";
import { CreateShelfModal } from "@/components/CreateShelfModal";
import { TasteCompassModal } from "@/components/TasteCompassModal";
import { Plus, Compass, Download, Upload, RotateCcw } from "lucide-react";
import { jellyTap } from "@/lib/physics";
import { Domain } from "@/types";

export default function Home() {
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [activeShelf, setActiveShelf] = useState<Shelf | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCompassModalOpen, setIsCompassModalOpen] = useState(false);
  const [compassInitialDomain, setCompassInitialDomain] = useState<Domain | undefined>(undefined);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleExport = () => {
    exportShelvesToJson(shelves);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          handleUpdateShelves(parsed);
        }
      } catch (err) {
        console.error("Failed to parse imported JSON", err);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleResetPresets = () => {
    if (confirm("Reset vaults to curated starter seeds?")) {
      handleUpdateShelves(resetToSeedShelves());
    }
  };

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

  const handleDeleteShelf = (shelfId: string) => {
    const updated = shelves.filter((s) => s.id !== shelfId);
    handleUpdateShelves(updated);
    setActiveShelf(null);
  };

  const handlePinRecommendation = (item: ShelfItem, targetDomain: Domain) => {
    const existingIndex = shelves.findIndex((s) => s.domain === targetDomain);
    if (existingIndex !== -1) {
      const updated = [...shelves];
      const target = updated[existingIndex];
      const updatedItem = { ...item, shelfId: target.id };
      updated[existingIndex] = {
        ...target,
        items: [updatedItem, ...target.items],
        itemCount: target.items.length + 1,
      };
      handleUpdateShelves(updated);
    } else {
      const domainTitles: Record<Domain, string> = {
        anime: "Anime Vault",
        movies: "Cinema Records",
        music: "Vinyl & Sound",
        books: "Literature & Essays",
        places: "Places & Cafés",
      };
      const newShelfId = `shelf-${Date.now()}`;
      const updatedItem = { ...item, shelfId: newShelfId };
      const newShelf: Shelf = {
        id: newShelfId,
        title: domainTitles[targetDomain] || `${targetDomain.toUpperCase()} Vault`,
        domain: targetDomain,
        itemCount: 1,
        items: [updatedItem],
        createdAt: new Date().toISOString(),
      };
      handleUpdateShelves([...shelves, newShelf]);
    }
  };

  const totalEntries = shelves.reduce((acc, s) => acc + s.items.length, 0);

  return (
    <div className="relative min-h-screen bg-white text-black flex flex-col justify-between items-center overflow-x-hidden select-none px-6 pt-24 pb-28">
      {/* Top Header Bar (Clean, sleek, always accessible across mobile & desktop) */}
      <header className="fixed top-0 left-0 right-0 z-40 px-6 sm:px-8 py-3.5 flex items-center justify-between border-b border-black/[0.08] bg-white/90 backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-black animate-pulse" />
          <div>
            <h1 className="font-mono text-xs font-semibold tracking-widest uppercase text-black">
              TASTEMEM
            </h1>
            <p className="font-mono text-[9px] text-neutral-500 tracking-wider">
              LIQUID MONOCHROME
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="hidden sm:flex items-center space-x-2 font-mono text-[10px] text-neutral-600 bg-neutral-100 px-3 py-1.5 rounded-full border border-black/10">
            <span>{shelves.length} VAULTS</span>
            <span>•</span>
            <span>{totalEntries} ENTRIES</span>
          </div>

          {/* Export JSON Backup */}
          <button
            onClick={handleExport}
            title="Export JSON Vault Backup"
            className="w-8 h-8 rounded-full border border-black/10 hover:border-black/30 flex items-center justify-center text-neutral-600 hover:text-black transition-colors bg-neutral-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Import JSON Backup */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import JSON Vault Backup"
            className="w-8 h-8 rounded-full border border-black/10 hover:border-black/30 flex items-center justify-center text-neutral-600 hover:text-black transition-colors bg-neutral-50 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />

          {/* Reset Curated Seeds */}
          <button
            onClick={handleResetPresets}
            title="Reset Starter Seeds"
            className="w-8 h-8 rounded-full border border-black/10 hover:border-black/30 flex items-center justify-center text-neutral-600 hover:text-black transition-colors bg-neutral-50 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <motion.button
            whileTap={jellyTap}
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-black text-white font-mono text-[11px] font-semibold tracking-wider uppercase hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline">NEW SHELF</span>
            <span className="sm:hidden">NEW</span>
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
            onDeleteShelf={handleDeleteShelf}
            onOpenCompass={(domain) => {
              setCompassInitialDomain(domain);
              setIsCompassModalOpen(true);
            }}
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

      {/* Floating Taste Compass Pill (Tactile trigger on canvas) */}
      {!activeShelf && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={jellyTap}
            onClick={() => {
              setCompassInitialDomain(undefined);
              setIsCompassModalOpen(true);
            }}
            className="flex items-center space-x-2.5 px-6 py-3 rounded-full bg-black text-white border border-neutral-800 hover:border-neutral-600 shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all font-mono text-xs tracking-wider uppercase group cursor-pointer"
          >
            <Compass className="w-4 h-4 text-white stroke-[2.2] group-hover:rotate-45 transition-transform duration-300" />
            <span className="font-semibold">TASTE COMPASS</span>
          </motion.button>
        </motion.div>
      )}

      {/* Taste Compass Modal (4 Recommendation Modes) */}
      <TasteCompassModal
        isOpen={isCompassModalOpen}
        onClose={() => setIsCompassModalOpen(false)}
        shelves={shelves}
        onPinRecommendation={handlePinRecommendation}
        initialDomain={compassInitialDomain}
      />
    </div>
  );
}
