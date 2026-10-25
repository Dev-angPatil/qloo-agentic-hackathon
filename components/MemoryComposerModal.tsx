"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Disc3, Sparkles, StickyNote, X } from "lucide-react";
import { MemoryStyle, Shelf, ShelfItem } from "@/types";
import { jellyTap, liquidSpring } from "@/lib/physics";

interface MemoryComposerModalProps {
  isOpen: boolean;
  shelves: Shelf[];
  onClose: () => void;
  onSave: (item: ShelfItem, shelfId: string) => void;
  onOpenMediaSearch: () => void;
}

export function MemoryComposerModal({ isOpen, shelves, onClose, onSave, onOpenMediaSearch }: MemoryComposerModalProps) {
  const [text, setText] = useState("");
  const [selectedShelf, setSelectedShelf] = useState("");
  const [memoryStyle, setMemoryStyle] = useState<MemoryStyle>("post-it");

  useEffect(() => {
    if (isOpen) {
      setSelectedShelf(shelves[0]?.id || "__new__");
      setMemoryStyle("post-it");
    }
  }, [isOpen, shelves]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    if (isOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const save = () => {
    if (!text.trim() || !selectedShelf) return;
    const item: ShelfItem = {
      id: `memory-${Date.now()}`,
      shelfId: selectedShelf,
      title: text.trim().split(/[.!?]/)[0].slice(0, 42) || "Untitled memory",
      coverImageUrl: "",
      userNote: text.trim(),
      domain: shelves.find((shelf) => shelf.id === selectedShelf)?.domain || "places",
      memoryType: "memory",
      memoryStyle,
      accent: ["#f8dc74", "#ffc6cf", "#bde4d4", "#cad7ff"][Date.now() % 4],
      createdAt: new Date().toISOString(),
    };
    onSave(item, selectedShelf);
    setText("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6">
        <motion.button aria-label="Close composer" className="absolute inset-0 bg-[#172027]/25 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />
        <motion.section initial={{ opacity: 0, y: 36, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 36 }} transition={liquidSpring} className="relative w-full max-w-xl overflow-hidden rounded-[30px] border border-[#1e2b31]/15 bg-[#fffdf7] p-6 shadow-[0_24px_80px_rgba(28,41,47,0.22)]">
          <div className="flex items-start justify-between">
            <div>
              <span className="eyebrow">A NEW PIECE OF YOUR LIFE</span>
              <h2 className="mt-2 font-serif text-3xl tracking-[-0.04em] text-[#192a30]">Leave it on the board.</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#637076]">A thought, a place, a feeling, a tiny detail. It does not need to become a task.</p>
            </div>
            <button onClick={onClose} className="quiet-icon"><X size={17} /></button>
          </div>
          <div className="mt-6 rounded-[22px] border border-[#1e2b31]/10 bg-white p-4 shadow-[0_8px_24px_rgba(28,41,47,0.05)]">
            <textarea autoFocus value={text} onChange={(event) => setText(event.target.value)} placeholder="I loved the fog on the river this morning..." className="min-h-[140px] w-full resize-none bg-transparent font-serif text-xl leading-8 text-[#192a30] outline-none placeholder:text-[#aab3b5]" />
            <div className="flex items-center justify-between border-t border-[#1e2b31]/10 pt-3">
              <span className="text-xs text-[#9ba5a7]">{text.length}/280</span>
            </div>
          </div>
          <div className="mt-5">
            <span className="text-xs font-medium text-[#637076]">How should it live on the board?</span>
            <div className="mt-2 grid grid-cols-3 gap-2" role="group" aria-label="Memory appearance">
              <button type="button" onClick={() => setMemoryStyle("post-it")} className={`memory-style-option ${memoryStyle === "post-it" ? "memory-style-option-active" : ""}`}>
                <span className="memory-style-preview memory-style-preview-post-it"><StickyNote size={17} /></span>
                <span><strong>Post-it</strong><small>bright + loose</small></span>
              </button>
              <button type="button" onClick={() => setMemoryStyle("sticky")} className={`memory-style-option ${memoryStyle === "sticky" ? "memory-style-option-active" : ""}`}>
                <span className="memory-style-preview memory-style-preview-sticky"><StickyNote size={17} /></span>
                <span><strong>Sticky note</strong><small>soft + layered</small></span>
              </button>
              <button type="button" onClick={() => setMemoryStyle("vinyl")} className={`memory-style-option ${memoryStyle === "vinyl" ? "memory-style-option-active" : ""}`}>
                <span className="memory-style-preview memory-style-preview-vinyl"><Disc3 size={17} /></span>
                <span><strong>Vinyl album</strong><small>bold + graphic</small></span>
              </button>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[#637076]">Place it in</span>
            {shelves.length === 0 && <span className="soft-chip soft-chip-active">first chapter</span>}
            {shelves.map((shelf) => <button type="button" key={shelf.id} onClick={() => setSelectedShelf(shelf.id)} className={`soft-chip ${selectedShelf === shelf.id ? "soft-chip-active" : ""}`}>{shelf.title}</button>)}
          </div>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            {shelves.length > 0 ? <button type="button" onClick={onOpenMediaSearch} className="text-left text-sm font-medium text-[#637076] underline decoration-[#c2cbca] underline-offset-4 hover:text-[#192a30]">Looking for a book, film, song or place?</button> : <span className="text-sm text-[#9ba5a7]">Add this first memory, then build threads around it.</span>}
            <motion.button whileTap={jellyTap} disabled={!text.trim() || !selectedShelf} onClick={save} className="primary-action"><Check size={16} /> pin memory</motion.button>
          </div>
          <div className="mt-5 flex items-center gap-2 text-xs text-[#9ba5a7]"><Sparkles size={13} /> your board will find the right chapter later</div>
        </motion.section>
      </div>
    </AnimatePresence>
  );
}
