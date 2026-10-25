"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, LibraryBig, Layers3, X } from "lucide-react";
import { jellyTap, liquidSpring } from "@/lib/physics";

interface AddFlowChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChooseNote: () => void;
  onChooseRecord: () => void;
  onChooseVibe: () => void;
}

export function AddFlowChooserModal({ isOpen, onClose, onChooseNote, onChooseRecord, onChooseVibe }: AddFlowChooserModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6">
        <motion.button aria-label="Close add menu" className="absolute inset-0 bg-[#172027]/25 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />
        <motion.section initial={{ opacity: 0, y: 28, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 28 }} transition={liquidSpring} className="relative w-full max-w-2xl rounded-[30px] border border-[#1e2b31]/15 bg-[#fffdf7] p-6 shadow-[0_24px_80px_rgba(28,41,47,0.22)]">
          <div className="flex items-start justify-between">
            <div>
              <span className="eyebrow">ADD TO YOUR CANVAS</span>
              <h2 className="mt-2 font-serif text-3xl tracking-[-0.04em] text-[#192a30]">What are you adding?</h2>
              <p className="mt-2 text-sm leading-6 text-[#637076]">Choose the kind of thing you want to leave behind. Each path has its own simple flow.</p>
            </div>
            <button onClick={onClose} className="quiet-icon" aria-label="Close add menu"><X size={17} /></button>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <motion.button whileTap={jellyTap} onClick={onChooseNote} className="flow-choice-card flow-choice-note">
              <span className="flow-choice-icon"><FileText size={23} /></span>
              <span><strong>Add a Note</strong><small>Capture a thought, feeling, detail, or moment.</small></span>
              <span className="flow-choice-arrow">→</span>
            </motion.button>
            <motion.button whileTap={jellyTap} onClick={onChooseRecord} className="flow-choice-card flow-choice-record">
              <span className="flow-choice-icon"><LibraryBig size={23} /></span>
              <span><strong>Add a Record</strong><small>Review an anime, movie, song, book, or place.</small></span>
              <span className="flow-choice-arrow">→</span>
            </motion.button>
            <motion.button whileTap={jellyTap} onClick={onChooseVibe} className="flow-choice-card flow-choice-vibe">
              <span className="flow-choice-icon"><Layers3 size={23} /></span>
              <span><strong>Create a Vibe</strong><small>Make a space for things that belong together.</small></span>
              <span className="flow-choice-arrow">→</span>
            </motion.button>
          </div>
        </motion.section>
      </div>
    </AnimatePresence>
  );
}
