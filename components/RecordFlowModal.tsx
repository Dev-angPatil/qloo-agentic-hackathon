"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Loader2, Search, Star, X } from "lucide-react";
import { Domain, MemoryFinish, MemoryPattern, MemoryShape, MemoryTone, RecordStatus, SearchResultItem, ShelfItem } from "@/types";
import { jellyTap, liquidSpring } from "@/lib/physics";

const searchableDomains: Domain[] = ["movies", "anime", "music", "books", "places"];

const statuses: Array<{ value: RecordStatus; label: string }> = [
  { value: "finished", label: "Finished" },
  { value: "in-progress", label: "In progress" },
  { value: "want-to-try", label: "Want to try" },
];

interface RecordFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ShelfItem) => void;
}

export function RecordFlowModal({ isOpen, onClose, onSave }: RecordFlowModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [selected, setSelected] = useState<SearchResultItem | null>(null);
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState<RecordStatus>("finished");
  const [shape, setShape] = useState<MemoryShape>("card");
  const [tone, setTone] = useState<MemoryTone>("sky");
  const [finish, setFinish] = useState<MemoryFinish>("clean");
  const [pattern, setPattern] = useState<MemoryPattern>("none");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setQuery(""); setResults([]); setSelected(null); setReview(""); setRating(0); setStatus("finished"); setShape("card"); setTone("sky"); setFinish("clean"); setPattern("none");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || selected || !query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const responses = await Promise.all(searchableDomains.map(async (domain) => {
          const response = await fetch(`/api/search?domain=${domain}&q=${encodeURIComponent(query.trim())}`);
          const data = response.ok ? await response.json() : { results: [] };
          return (data.results || []) as SearchResultItem[];
        }));
        const uniqueResults = new Map<string, SearchResultItem>();
        responses.flat().forEach((result) => uniqueResults.set(`${result.domain}:${result.title}`, result));
        setResults(Array.from(uniqueResults.values()).slice(0, 12));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [isOpen, query, selected]);

  const save = () => {
    if (!selected || !review.trim() || rating === 0) return;
    onSave({
      id: `record-${Date.now()}`,
      shelfId: "__canvas__",
      title: selected.title,
      subtitle: selected.subtitle,
      coverImageUrl: selected.coverImageUrl,
      description: selected.description,
      userNote: review.trim(),
      domain: selected.domain,
      qlooEntityId: selected.externalId,
      year: selected.year,
      memoryType: "media",
      memoryStyle: "record",
      rating,
      recordStatus: status,
      memoryShape: shape,
      memoryTone: tone,
      memoryFinish: finish,
      memoryPattern: pattern,
      ratingOrStatus: `${rating}/5 · ${status}`,
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[85] flex items-end justify-center p-3 sm:items-center sm:p-6">
        <motion.button aria-label="Close record flow" className="absolute inset-0 bg-[#172027]/25 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />
        <motion.section initial={{ opacity: 0, y: 36, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 36 }} transition={liquidSpring} className="relative w-full max-w-xl overflow-hidden rounded-[30px] border border-[#1e2b31]/15 bg-[#fffdf7] p-6 shadow-[0_24px_80px_rgba(28,41,47,0.22)]">
          <div className="flex items-start justify-between"><div><span className="eyebrow">ADD A RECORD · STEP {selected ? "2" : "1"} OF 2</span><h2 className="mt-2 font-serif text-3xl tracking-[-0.04em] text-[#192a30]">{selected ? "Make it yours." : "What are you reviewing?"}</h2><p className="mt-2 text-sm leading-6 text-[#637076]">{selected ? "Add your opinion, rating, and current status." : "Search for the anime, movie, song, book, or place you want to remember."}</p></div><button onClick={onClose} className="quiet-icon" aria-label="Close record flow"><X size={17} /></button></div>

          {!selected ? <>
            <div className="relative mt-5"><Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#899397]" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search anything you want to review..." className="w-full rounded-2xl border border-[#1e2b31]/12 bg-white py-3.5 pl-11 pr-10 text-sm text-[#192a30] outline-none placeholder:text-[#aab3b5] focus:border-[#192a30]" />{loading && <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#899397]" />}</div>
            <div className="mt-4 max-h-[350px] space-y-2 overflow-y-auto">{results.map((result, index) => <button type="button" key={result.externalId || `${result.title}-${index}`} onClick={() => setSelected(result)} className="record-search-result"><span className="record-search-cover">{result.coverImageUrl ? <img src={result.coverImageUrl} alt="" /> : <span>✦</span>}</span><span className="min-w-0 text-left"><strong>{result.title}</strong><small>{result.domain} · {result.subtitle || result.year || "result"}</small></span><span className="record-search-arrow">→</span></button>)}{query.trim() && !loading && results.length === 0 && <p className="py-8 text-center text-sm text-[#899397]">No matches yet. Try a different title.</p>}{!query.trim() && <p className="py-8 text-center text-sm text-[#899397]">Search across anime, movies, music, books, and places.</p>}</div>
          </> : <>
            <div className="record-selected-summary mt-5"><span className="record-search-cover">{selected.coverImageUrl ? <img src={selected.coverImageUrl} alt="" /> : <span>✦</span>}</span><span className="min-w-0"><strong>{selected.title}</strong><small>{selected.domain} · {selected.subtitle || selected.year || "result"}</small></span><button type="button" onClick={() => setSelected(null)} className="soft-chip"><ArrowLeft size={13} /> change</button></div>
            <label className="mt-5 block text-xs font-semibold uppercase tracking-[.12em] text-[#637076]">Your review<textarea value={review} onChange={(event) => setReview(event.target.value.slice(0, 600))} placeholder="What did it make you feel? What stayed with you?" className="mt-2 min-h-[130px] w-full resize-none rounded-2xl border border-[#1e2b31]/12 bg-white p-4 font-serif text-lg leading-7 text-[#192a30] outline-none placeholder:text-[#aab3b5] focus:border-[#192a30]" /></label>
            <div className="mt-5"><span className="text-xs font-semibold uppercase tracking-[.12em] text-[#637076]">Your rating</span><div className="mt-2 flex gap-1">{[1, 2, 3, 4, 5].map((value) => <button type="button" key={value} aria-label={`${value} stars`} onClick={() => setRating(value)} className={`rating-star ${value <= rating ? "rating-star-active" : ""}`}><Star size={22} fill="currentColor" /></button>)}</div></div>
            <div className="mt-5"><span className="text-xs font-semibold uppercase tracking-[.12em] text-[#637076]">Status</span><div className="mt-2 flex flex-wrap gap-2">{statuses.map((option) => <button type="button" key={option.value} onClick={() => setStatus(option.value)} className={`soft-chip ${status === option.value ? "soft-chip-active" : ""}`}>{option.label}</button>)}</div></div>
            <div className="mt-5 space-y-4"><span className="text-xs font-semibold uppercase tracking-[.12em] text-[#637076]">Appearance</span><div><span className="appearance-category-label">Layout</span><div className="appearance-option-row">{([["card", "Card"], ["note", "Note"], ["circle", "Circle"]] as const).map(([value, label]) => <button type="button" key={value} onClick={() => setShape(value)} className={`appearance-option ${shape === value ? "appearance-option-active" : ""}`}>{label}</button>)}</div></div><div><span className="appearance-category-label">Color</span><div className="appearance-option-row">{([["sky", "Sky"], ["sun", "Sun"], ["rose", "Rose"], ["mint", "Mint"], ["lavender", "Lavender"]] as const).map(([value, label]) => <button type="button" key={value} onClick={() => setTone(value)} className={`appearance-option appearance-option-${value} ${tone === value ? "appearance-option-active" : ""}`}>{label}</button>)}</div></div><div><span className="appearance-category-label">Finish</span><div className="appearance-option-row">{([["clean", "Clean"], ["paper", "Paper"], ["tape", "Tape"], ["shadow", "Shadow"]] as const).map(([value, label]) => <button type="button" key={value} onClick={() => setFinish(value)} className={`appearance-option ${finish === value ? "appearance-option-active" : ""}`}>{label}</button>)}</div></div><div><span className="appearance-category-label">Pattern</span><div className="appearance-option-row">{([["none", "None"], ["dots", "Dots"], ["lines", "Lines"], ["grain", "Grain"]] as const).map(([value, label]) => <button type="button" key={value} onClick={() => setPattern(value)} className={`appearance-option ${pattern === value ? "appearance-option-active" : ""}`}>{label}</button>)}</div></div></div>
          </>}

          <div className="mt-6 flex items-center justify-between gap-3">{selected ? <button type="button" onClick={() => setSelected(null)} className="soft-chip"><ArrowLeft size={13} /> back to search</button> : <span className="text-xs text-[#9ba5a7]">Your record will be placed directly on the canvas.</span>}{selected && <motion.button whileTap={jellyTap} disabled={!review.trim() || rating === 0} onClick={save} className="primary-action"><Check size={16} /> add record</motion.button>}</div>
        </motion.section>
      </div>
    </AnimatePresence>
  );
}
