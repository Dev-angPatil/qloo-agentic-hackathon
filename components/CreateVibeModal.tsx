"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Vibe, VibeBorder, VibeStyle, VibeTexture } from "@/types";
import { jellyTap, liquidSpring } from "@/lib/physics";

interface CreateVibeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (vibe: Vibe) => void;
}

const colors = ["#d8c6a2", "#9db7b1", "#9eaac8", "#c99ca8", "#343a40"];
const styles: Array<{ value: VibeStyle; label: string; description: string }> = [
  { value: "paper", label: "Paper", description: "soft framed space" },
  { value: "blackboard", label: "Blackboard", description: "dark gallery zone" },
  { value: "sheet", label: "Sheet", description: "pinned paper surface" },
];
const borders: Array<{ value: VibeBorder; label: string }> = [["solid", "Solid"], ["dashed", "Dashed"], ["hand-drawn", "Hand-drawn"]].map(([value, label]) => ({ value: value as VibeBorder, label }));
const textures: Array<{ value: VibeTexture; label: string }> = [["none", "None"], ["paper-grain", "Paper grain"], ["chalk", "Chalk"], ["grid", "Grid"]].map(([value, label]) => ({ value: value as VibeTexture, label }));

export function CreateVibeModal({ isOpen, onClose, onCreate }: CreateVibeModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState<VibeStyle>("paper");
  const [color, setColor] = useState(colors[0]);
  const [opacity, setOpacity] = useState(42);
  const [border, setBorder] = useState<VibeBorder>("solid");
  const [texture, setTexture] = useState<VibeTexture>("none");

  useEffect(() => {
    if (isOpen) {
      setTitle(""); setDescription(""); setStyle("paper"); setColor(colors[0]); setOpacity(42); setBorder("solid"); setTexture("none");
    }
  }, [isOpen]);

  const create = () => {
    if (!title.trim()) return;
    onCreate({
      id: `vibe-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      style,
      color,
      opacity: opacity / 100,
      border,
      texture,
      position: { x: 0, y: 0 },
      size: { width: 620, height: 420 },
      collapsed: false,
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[85] flex items-end justify-center p-3 sm:items-center sm:p-6">
        <motion.button aria-label="Close Vibe creator" className="absolute inset-0 bg-[#172027]/25 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />
        <motion.section initial={{ opacity: 0, y: 36, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 36 }} transition={liquidSpring} className="relative max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-[30px] border border-[#1e2b31]/15 bg-[#fffdf7] p-6 shadow-[0_24px_80px_rgba(28,41,47,0.22)]">
          <div className="flex items-start justify-between"><div><span className="eyebrow">CREATE A VIBE</span><h2 className="mt-2 font-serif text-3xl tracking-[-0.04em] text-[#192a30]">Give this space a feeling.</h2><p className="mt-2 text-sm leading-6 text-[#637076]">Make a boundary for notes and records that belong together.</p></div><button onClick={onClose} className="quiet-icon" aria-label="Close Vibe creator"><X size={17} /></button></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_220px]">
            <div className="space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-[.12em] text-[#637076]">Name<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Rainy Sundays" className="mt-2 w-full rounded-2xl border border-[#1e2b31]/12 bg-white p-3.5 text-base font-normal normal-case tracking-normal text-[#192a30] outline-none placeholder:text-[#aab3b5] focus:border-[#192a30]" /></label>
              <label className="block text-xs font-semibold uppercase tracking-[.12em] text-[#637076]">Description <span className="font-normal normal-case tracking-normal text-[#9ba5a7]">optional</span><textarea value={description} onChange={(event) => setDescription(event.target.value.slice(0, 120))} placeholder="quiet things for slow afternoons" className="mt-2 min-h-[78px] w-full resize-none rounded-2xl border border-[#1e2b31]/12 bg-white p-3.5 text-sm font-normal normal-case tracking-normal text-[#192a30] outline-none placeholder:text-[#aab3b5] focus:border-[#192a30]" /></label>
              <div><span className="appearance-category-label">Boundary style</span><div className="appearance-option-row">{styles.map((option) => <button type="button" key={option.value} onClick={() => setStyle(option.value)} className={`appearance-option ${style === option.value ? "appearance-option-active" : ""}`}>{option.label}</button>)}</div></div>
              <div><span className="appearance-category-label">Border</span><div className="appearance-option-row">{borders.map((option) => <button type="button" key={option.value} onClick={() => setBorder(option.value)} className={`appearance-option ${border === option.value ? "appearance-option-active" : ""}`}>{option.label}</button>)}</div></div>
              <div><span className="appearance-category-label">Texture</span><div className="appearance-option-row">{textures.map((option) => <button type="button" key={option.value} onClick={() => setTexture(option.value)} className={`appearance-option ${texture === option.value ? "appearance-option-active" : ""}`}>{option.label}</button>)}</div></div>
              <div><span className="appearance-category-label">Color</span><div className="vibe-color-row">{colors.map((value) => <button type="button" key={value} aria-label={`Choose ${value}`} onClick={() => setColor(value)} className={`vibe-color-swatch ${color === value ? "vibe-color-swatch-active" : ""}`} style={{ backgroundColor: value }} />)}</div></div>
              <label className="block text-xs font-semibold uppercase tracking-[.12em] text-[#637076]">Opacity <span className="font-normal normal-case tracking-normal text-[#9ba5a7]">{opacity}%</span><input type="range" min="18" max="72" value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} className="mt-3 w-full accent-[#192a30]" /></label>
            </div>
            <div className={`vibe-preview vibe-preview-${style} vibe-texture-${texture} vibe-border-${border}`} style={{ backgroundColor: style === "blackboard" ? "#343a40" : color, opacity: style === "blackboard" ? 0.95 : opacity / 100 }}><div className="vibe-preview-header"><strong>{title || "Your Vibe"}</strong><span>0</span></div><small>{description || "notes and records that belong together"}</small></div>
          </div>
          <div className="mt-6 flex justify-end"><motion.button whileTap={jellyTap} disabled={!title.trim()} onClick={create} className="primary-action"><Check size={16} /> create vibe</motion.button></div>
        </motion.section>
      </div>
    </AnimatePresence>
  );
}
