"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, FileText, Sparkles, X } from "lucide-react";
import { MemoryFinish, MemoryPattern, MemoryShape, MemoryTone, ShelfItem } from "@/types";
import { suggestRecordFromNote } from "@/lib/whiteboard";
import { jellyTap, liquidSpring } from "@/lib/physics";

interface NoteFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ShelfItem) => void;
  onConvert: (item: ShelfItem) => void;
}

export function NoteFlowModal({ isOpen, onClose, onSave, onConvert }: NoteFlowModalProps) {
  const [step, setStep] = useState<1 | 2 | "suggestion">(1);
  const [text, setText] = useState("");
  const [shape, setShape] = useState<MemoryShape>("note");
  const [tone, setTone] = useState<MemoryTone>("sun");
  const [finish, setFinish] = useState<MemoryFinish>("paper");
  const [pattern, setPattern] = useState<MemoryPattern>("none");
  const [savedItem, setSavedItem] = useState<ShelfItem | null>(null);
  const [suggestion, setSuggestion] = useState<{ title: string; domain: ShelfItem["domain"] } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setText("");
      setShape("note");
      setTone("sun");
      setFinish("paper");
      setPattern("none");
      setSavedItem(null);
      setSuggestion(null);
    }
  }, [isOpen]);

  const close = () => {
    setText("");
    setSavedItem(null);
    setSuggestion(null);
    onClose();
  };

  const save = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const item: ShelfItem = {
      id: `note-${Date.now()}`,
      shelfId: "__canvas__",
      title: trimmed.split(/[.!?\n]/)[0].slice(0, 52) || "Untitled note",
      coverImageUrl: "",
      userNote: trimmed,
      domain: "places",
      memoryType: "memory",
      memoryStyle: "post-it",
      memoryShape: shape,
      memoryTone: tone,
      memoryFinish: finish,
      memoryPattern: pattern,
      pinned: false,
      createdAt: new Date().toISOString(),
    };
    onSave(item);
    const detected = suggestRecordFromNote(trimmed);
    setSavedItem(item);
    setSuggestion(detected);
    setStep(detected ? "suggestion" : 2);
    if (!detected) close();
  };

  const convert = () => {
    if (!savedItem || !suggestion) return;
    onConvert({ ...savedItem, title: suggestion.title, domain: suggestion.domain, memoryType: "media", memoryStyle: "record" });
    close();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[85] flex items-end justify-center p-3 sm:items-center sm:p-6">
        <motion.button aria-label="Close note flow" className="absolute inset-0 bg-[#172027]/25 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={close} />
        <motion.section initial={{ opacity: 0, y: 36, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 36 }} transition={liquidSpring} className="relative w-full max-w-xl overflow-hidden rounded-[30px] border border-[#1e2b31]/15 bg-[#fffdf7] p-6 shadow-[0_24px_80px_rgba(28,41,47,0.22)]">
          <div className="flex items-start justify-between">
            <div>
              <span className="eyebrow">ADD A NOTE · {step === "suggestion" ? "FOLLOW-UP" : `STEP ${step} OF 2`}</span>
              <h2 className="mt-2 font-serif text-3xl tracking-[-0.04em] text-[#192a30]">{step === 1 ? "Write the moment." : step === 2 ? "Choose its shape." : "One more possibility."}</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#637076]">{step === 1 ? "Start with the thought itself. Nothing else is required yet." : step === 2 ? "Give the note a visual home on the canvas." : "This note sounds like it might belong to a record."}</p>
            </div>
            <button onClick={close} className="quiet-icon" aria-label="Close note flow"><X size={17} /></button>
          </div>

          {step === 1 && <div className="mt-6 rounded-[22px] border border-[#1e2b31]/10 bg-white p-4 shadow-[0_8px_24px_rgba(28,41,47,0.05)]">
            <textarea autoFocus value={text} onChange={(event) => setText(event.target.value.slice(0, 500))} placeholder="A thought, a place, a feeling, a tiny detail..." className="min-h-[220px] w-full resize-none bg-transparent font-serif text-xl leading-8 text-[#192a30] outline-none placeholder:text-[#aab3b5]" />
            <div className="flex items-center justify-end border-t border-[#1e2b31]/10 pt-3"><span className="text-xs text-[#9ba5a7]">{text.length}/500</span></div>
          </div>}

          {step === 2 && <div className="mt-6 space-y-5">
            <div><span className="appearance-category-label">Layout</span><div className="appearance-option-row">{([["note", "Note"], ["card", "Card"], ["circle", "Circle"]] as const).map(([value, label]) => <button type="button" key={value} onClick={() => setShape(value)} className={`appearance-option ${shape === value ? "appearance-option-active" : ""}`}>{label}</button>)}</div></div>
            <div><span className="appearance-category-label">Color</span><div className="appearance-option-row">{([["sun", "Sun"], ["rose", "Rose"], ["mint", "Mint"], ["sky", "Sky"], ["lavender", "Lavender"]] as const).map(([value, label]) => <button type="button" key={value} onClick={() => setTone(value)} className={`appearance-option appearance-option-${value} ${tone === value ? "appearance-option-active" : ""}`}>{label}</button>)}</div></div>
            <div><span className="appearance-category-label">Finish</span><div className="appearance-option-row">{([["paper", "Paper"], ["tape", "Tape"], ["clean", "Clean"]] as const).map(([value, label]) => <button type="button" key={value} onClick={() => setFinish(value)} className={`appearance-option ${finish === value ? "appearance-option-active" : ""}`}>{label}</button>)}</div></div>
            <div><span className="appearance-category-label">Pattern</span><div className="appearance-option-row">{([["none", "None"], ["dots", "Dots"], ["lines", "Lines"], ["grain", "Grain"]] as const).map(([value, label]) => <button type="button" key={value} onClick={() => setPattern(value)} className={`appearance-option ${pattern === value ? "appearance-option-active" : ""}`}>{label}</button>)}</div></div>
          </div>}

          {step === "suggestion" && suggestion && <div className="mt-6 rounded-[22px] border border-[#1e2b31]/10 bg-white p-5 shadow-[0_8px_24px_rgba(28,41,47,0.05)]"><div className="flex items-start gap-3"><span className="flow-choice-icon flow-choice-icon-small"><Sparkles size={17} /></span><div><p className="text-sm font-semibold text-[#192a30]">Turn this into a record about “{suggestion.title}”?</p><p className="mt-1 text-sm leading-6 text-[#637076]">It will stay on the canvas, but become a reviewable {suggestion.domain} record.</p></div></div></div>}

          <div className="mt-6 flex items-center justify-between gap-3">
            {step === 1 ? <button type="button" onClick={close} className="soft-chip"><X size={13} /> cancel</button> : step === 2 ? <button type="button" onClick={() => setStep(1)} className="soft-chip"><ArrowLeft size={13} /> back</button> : <button type="button" onClick={close} className="soft-chip">keep as note</button>}
            {step === 1 && <motion.button whileTap={jellyTap} disabled={!text.trim()} onClick={() => setStep(2)} className="primary-action"><ArrowRight size={16} /> continue</motion.button>}
            {step === 2 && <motion.button whileTap={jellyTap} onClick={save} className="primary-action"><Check size={16} /> add note</motion.button>}
            {step === "suggestion" && <motion.button whileTap={jellyTap} onClick={convert} className="primary-action"><FileText size={16} /> turn into record</motion.button>}
          </div>
        </motion.section>
      </div>
    </AnimatePresence>
  );
}
