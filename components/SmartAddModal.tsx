"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Domain, SearchResultItem, ShelfItem } from "@/types";
import { X, Search, Loader2, Check, Sparkles } from "lucide-react";
import { liquidSpring, jellyTap } from "@/lib/physics";

interface SmartAddModalProps {
  domain: Domain;
  shelfId: string;
  isOpen: boolean;
  onClose: () => void;
  onItemAdded: (item: ShelfItem) => void;
}

export const SmartAddModal: React.FC<SmartAddModalProps> = ({
  domain,
  shelfId,
  isOpen,
  onClose,
  onItemAdded,
}) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResultItem | null>(null);
  const [userNote, setUserNote] = useState("");
  const [saving, setSaving] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?domain=${domain}&q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, domain]);

  const handleSave = async () => {
    if (!selectedResult) return;
    setSaving(true);

    const newItem: ShelfItem = {
      id: "item-" + Date.now(),
      shelfId,
      title: selectedResult.title,
      subtitle: selectedResult.subtitle,
      coverImageUrl: selectedResult.coverImageUrl,
      description: selectedResult.description,
      userNote: userNote.trim() || undefined,
      domain,
      year: selectedResult.year,
      createdAt: new Date().toISOString(),
    };

    // Asynchronously resolve Qloo entity ID
    try {
      fetch(`/api/qloo/resolve?query=${encodeURIComponent(selectedResult.title)}&domain=${domain}`)
        .then((res) => res.json())
        .then((qlooData) => {
          if (qlooData?.entity_id) {
            newItem.qlooEntityId = qlooData.entity_id;
          }
        })
        .catch(() => {});
    } catch {
      // Non-blocking
    }

    onItemAdded(newItem);
    setSaving(false);
    resetAndClose();
  };

  const resetAndClose = () => {
    setQuery("");
    setResults([]);
    setSelectedResult(null);
    setUserNote("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={resetAndClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={liquidSpring}
          className="relative w-full max-w-lg max-h-[85vh] rounded-3xl bg-neutral-950 border border-white/15 shadow-2xl flex flex-col overflow-hidden z-10"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest">
                SMART ADD :: {domain}
              </span>
            </div>
            <button
              onClick={resetAndClose}
              className="w-7 h-7 rounded-full bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search Input Bar */}
          <div className="p-6 pb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                autoFocus
                placeholder={`Search ${domain} title (e.g. ${
                  domain === "anime"
                    ? "Chainsaw Man"
                    : domain === "movies"
                    ? "Interstellar"
                    : domain === "music"
                    ? "Khruangbin"
                    : "Norwegian Wood"
                })...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-neutral-900/90 border border-white/15 focus:border-white focus:outline-none text-white placeholder-neutral-500 text-sm transition-colors"
              />
              {loading && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 animate-spin" />
              )}
            </div>
          </div>

          {/* Content / Results List */}
          <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-6">
            {selectedResult ? (
              /* Selected Preview & Personal Note Step */
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-neutral-900 border border-white/20 space-y-4"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-22 rounded-xl overflow-hidden bg-neutral-800 border border-white/10 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedResult.coverImageUrl}
                      alt={selectedResult.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider">
                        SELECTED MATCH
                      </span>
                      <button
                        onClick={() => setSelectedResult(null)}
                        className="text-neutral-400 hover:text-white text-xs font-mono underline"
                      >
                        Change
                      </button>
                    </div>
                    <h4 className="text-white font-medium text-sm mt-1 truncate">
                      {selectedResult.title}
                    </h4>
                    {selectedResult.subtitle && (
                      <p className="text-neutral-500 text-xs truncate">
                        {selectedResult.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Personal Memory Input */}
                <div>
                  <label className="block font-mono text-[10px] text-neutral-400 tracking-wider uppercase mb-1.5">
                    YOUR NOTE / MEMORY (OPTIONAL)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. watched on a rainy night, best soundtrack, comfort watch..."
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/15 focus:border-white focus:outline-none text-white text-xs placeholder-neutral-600 resize-none transition-colors"
                  />
                </div>

                <motion.button
                  whileTap={jellyTap}
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-3 rounded-xl bg-white text-black font-semibold text-xs tracking-wider uppercase flex items-center justify-center space-x-2 shadow-lg hover:bg-neutral-200 transition-colors"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{saving ? "SAVING..." : "SAVE TO SHELF"}</span>
                </motion.button>
              </motion.div>
            ) : results.length > 0 ? (
              /* Search Results */
              <div className="space-y-2">
                {results.map((res, idx) => (
                  <motion.div
                    key={res.externalId || idx}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedResult(res)}
                    className="p-3 rounded-2xl bg-neutral-900/60 hover:bg-neutral-900 border border-white/10 hover:border-white/30 flex items-center space-x-3.5 cursor-pointer transition-colors"
                  >
                    <div className="w-12 h-16 rounded-xl overflow-hidden bg-neutral-800 border border-white/10 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={res.coverImageUrl}
                        alt={res.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-sm truncate">
                        {res.title}
                      </h4>
                      {res.subtitle && (
                        <p className="text-neutral-500 text-xs truncate">
                          {res.subtitle}
                        </p>
                      )}
                      {res.year && (
                        <span className="inline-block mt-1 font-mono text-[9px] text-neutral-400">
                          {res.year}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : query.trim() && !loading ? (
              <div className="py-12 text-center text-neutral-500 font-mono text-xs">
                NO MATCHES FOUND FOR &quot;{query}&quot;
              </div>
            ) : (
              <div className="py-12 text-center text-neutral-600 font-mono text-xs">
                TYPE A TITLE TO SEARCH {domain.toUpperCase()}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
