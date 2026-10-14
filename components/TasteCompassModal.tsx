"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Domain,
  RecommendationItem,
  RecommendationMode,
  RecommendationsApiResponse,
  Shelf,
  ShelfItem,
} from "@/types";
import { liquidSpring, jellyTap } from "@/lib/physics";
import {
  Compass,
  Sparkles,
  Shuffle,
  Globe,
  X,
  Plus,
  Check,
  Loader2,
  Tv,
  Film,
  Disc,
  Book,
  MapPin,
  RefreshCw,
} from "lucide-react";

interface TasteCompassModalProps {
  isOpen: boolean;
  onClose: () => void;
  shelves: Shelf[];
  onPinRecommendation: (item: ShelfItem, targetDomain: Domain) => void;
  initialDomain?: Domain;
}

const MODES: {
  id: RecommendationMode;
  label: string;
  badge: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    id: "more_like_this",
    label: "More Like This",
    badge: "AFFINITY",
    description: "Direct high-affinity matches based on your primary cultural anchors.",
    icon: Sparkles,
  },
  {
    id: "surprise_me",
    label: "Surprise Me",
    badge: "INDIE / NICHE",
    description: "Adjacent indie discoveries filtered to low mainstream popularity (≤ 60%).",
    icon: Shuffle,
  },
  {
    id: "go_wild",
    label: "Go Wild",
    badge: "CROSS-DOMAIN",
    description: "Crosses cultural boundaries into other verticals using multi-shelf seeds.",
    icon: Compass,
  },
  {
    id: "trip_guide",
    label: "Trip Guide",
    badge: "CITY GROUNDED",
    description: "Projects your universal taste fingerprint onto destination venues.",
    icon: Globe,
  },
];

const DOMAIN_TARGETS: { id: Domain; label: string; icon: React.ElementType }[] = [
  { id: "books", label: "Literature", icon: Book },
  { id: "music", label: "Vinyl / Sound", icon: Disc },
  { id: "places", label: "Places & Cafés", icon: MapPin },
  { id: "movies", label: "Cinema / TV", icon: Film },
  { id: "anime", label: "Anime", icon: Tv },
];

const QUICK_CITIES = [
  { id: "tokyo", label: "Tokyo" },
  { id: "kyoto", label: "Kyoto" },
  { id: "london", label: "London" },
  { id: "paris", label: "Paris" },
  { id: "nyc", label: "New York" },
  { id: "berlin", label: "Berlin" },
  { id: "sf", label: "San Francisco" },
];

export const TasteCompassModal: React.FC<TasteCompassModalProps> = ({
  isOpen,
  onClose,
  shelves,
  onPinRecommendation,
  initialDomain,
}) => {
  const [activeMode, setActiveMode] = useState<RecommendationMode>("go_wild");
  const [focusDomain, setFocusDomain] = useState<Domain>(initialDomain || "movies");
  const [targetDomain, setTargetDomain] = useState<Domain>(initialDomain === "books" ? "music" : "books");
  const [selectedCity, setSelectedCity] = useState<string>("tokyo");
  const [customCity, setCustomCity] = useState<string>("");
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());

  // Sync focus domain when initialDomain or open changes
  useEffect(() => {
    if (isOpen && initialDomain) {
      setFocusDomain(initialDomain);
      if (initialDomain === "books") {
        setTargetDomain("music");
      } else {
        setTargetDomain("books");
      }
    }
  }, [isOpen, initialDomain]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Aggregate resolved seeds from user's active shelves (prioritizing current domain for same-domain modes)
  const getSeedIds = useCallback((): string[] => {
    const domainSpecificSeeds: string[] = [];
    const allSeeds: string[] = [];

    for (const shelf of shelves) {
      const isTarget = shelf.domain === focusDomain;
      for (const item of shelf.items) {
        const id = item.qlooEntityId || item.title;
        if (id) {
          allSeeds.push(id);
          if (isTarget) {
            domainSpecificSeeds.push(id);
          }
        }
      }
    }

    if (activeMode === "more_like_this" || activeMode === "surprise_me") {
      if (domainSpecificSeeds.length > 0) {
        return domainSpecificSeeds.slice(0, 8);
      }
    }

    if (allSeeds.length > 0) {
      return allSeeds.slice(0, 8);
    }

    // Canonical fallback seeds if user vault is completely empty
    return [
      "9B33A620-68CA-49B3-BFCF-F09CCF8AD595", // Spirited Away
      "3A02361C-987B-4F7E-9AAD-071C3853AD92", // Blade Runner 2049
      "BAF6317A-DF94-4C90-92AE-63F86560C21B", // Khruangbin
    ];
  }, [shelves, focusDomain, activeMode]);

  const fetchRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const seeds = getSeedIds();
      const params = new URLSearchParams();
      params.set("mode", activeMode);
      params.set("seeds", seeds.join(","));

      if (activeMode === "more_like_this" || activeMode === "surprise_me") {
        params.set("domain", focusDomain);
      } else if (activeMode === "go_wild") {
        params.set("targetDomain", targetDomain);
      } else if (activeMode === "trip_guide") {
        const cityToUse = customCity.trim() || selectedCity;
        params.set("city", cityToUse);
      }

      const res = await fetch(`/api/recommendations?${params.toString()}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${res.status}`);
      }

      const data: RecommendationsApiResponse = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to load recommendations");
      }

      setRecommendations(data.recommendations || []);
    } catch (err: any) {
      console.error("Taste Compass error:", err);
      setError(err.message || "Failed to query cultural graph");
    } finally {
      setIsLoading(false);
    }
  }, [activeMode, targetDomain, focusDomain, selectedCity, customCity, getSeedIds]);

  // Refetch when mode or target domain or city changes
  useEffect(() => {
    if (isOpen) {
      fetchRecommendations();
    }
  }, [isOpen, activeMode, targetDomain, focusDomain, selectedCity, fetchRecommendations]);

  const handlePin = (rec: RecommendationItem) => {
    if (pinnedIds.has(rec.id)) return;

    const newItem: ShelfItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      shelfId: "",
      title: rec.title,
      subtitle: rec.subtitle,
      coverImageUrl: rec.coverImageUrl,
      description: rec.description,
      userNote: `Recommended via Taste Compass (${rec.affinity}% Cultural Affinity)`,
      domain: rec.domain,
      qlooEntityId: rec.id,
      year: rec.year,
      createdAt: new Date().toISOString(),
    };

    onPinRecommendation(newItem, rec.domain);
    setPinnedIds((prev) => new Set(prev).add(rec.id));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={liquidSpring}
          className="relative w-full max-w-4xl max-h-[90vh] bg-black border border-white/15 rounded-3xl sm:rounded-[32px] shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden z-10"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-neutral-950/80 backdrop-blur-md shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-sm">
                <Compass className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-white text-base sm:text-lg font-semibold tracking-tight">
                  Taste Compass
                </h2>
                <p className="font-mono text-[10px] text-neutral-400 tracking-wider uppercase mt-0.5">
                  CROSS-DOMAIN CULTURAL GRAPH
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={fetchRecommendations}
                disabled={isLoading}
                className="w-8 h-8 rounded-full border border-white/15 hover:border-white/30 text-neutral-400 hover:text-white flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
                title="Refresh recommendations"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full border border-white/15 hover:border-white/30 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mode Selector Strip */}
          <div className="px-6 py-3.5 bg-neutral-950 border-b border-white/10 flex flex-wrap gap-2 items-center justify-between shrink-0">
            <div className="flex flex-wrap gap-2">
              {MODES.map((mode) => {
                const IconComponent = mode.icon;
                const isSelected = activeMode === mode.id;
                return (
                  <motion.button
                    key={mode.id}
                    whileTap={jellyTap}
                    onClick={() => setActiveMode(mode.id)}
                    className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full font-mono text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white text-black font-semibold shadow-sm"
                        : "bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10"
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{mode.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Active Mode Description Tag */}
            <div className="hidden md:block font-mono text-[10px] text-neutral-400">
              {MODES.find((m) => m.id === activeMode)?.description}
            </div>
          </div>

          {/* Sub-Filters: Domain Filter for More Like This & Surprise Me */}
          {(activeMode === "more_like_this" || activeMode === "surprise_me") && (
            <div className="px-6 py-2.5 bg-black/90 border-b border-white/10 flex items-center space-x-2 overflow-x-auto shrink-0">
              <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider shrink-0 mr-1">
                EXPLORE DOMAIN:
              </span>
              {DOMAIN_TARGETS.map((target) => {
                const TargetIcon = target.icon;
                const isSelected = focusDomain === target.id;
                return (
                  <button
                    key={target.id}
                    onClick={() => setFocusDomain(target.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-white text-black font-semibold shadow-sm"
                        : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <TargetIcon className="w-3 h-3" />
                    <span>{target.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Sub-Filters: Domain Tabs for Go Wild, City Picker for Trip Guide */}
          {activeMode === "go_wild" && (
            <div className="px-6 py-2.5 bg-black/90 border-b border-white/10 flex items-center space-x-2 overflow-x-auto shrink-0">
              <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider shrink-0 mr-1">
                LEAP TARGET:
              </span>
              {DOMAIN_TARGETS.map((target) => {
                const TargetIcon = target.icon;
                const isSelected = targetDomain === target.id;
                return (
                  <button
                    key={target.id}
                    onClick={() => setTargetDomain(target.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all shrink-0 ${
                      isSelected
                        ? "bg-white/20 text-white border border-white/30"
                        : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <TargetIcon className="w-3 h-3" />
                    <span>{target.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {activeMode === "trip_guide" && (
            <div className="px-6 py-2.5 bg-black/90 border-b border-white/10 flex flex-wrap items-center gap-2 shrink-0">
              <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider shrink-0 mr-1">
                CITY GROUNDING:
              </span>
              {QUICK_CITIES.map((city) => {
                const isSelected = selectedCity === city.id && !customCity;
                return (
                  <button
                    key={city.id}
                    onClick={() => {
                      setSelectedCity(city.id);
                      setCustomCity("");
                    }}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-mono transition-all ${
                      isSelected
                        ? "bg-white/20 text-white border border-white/30"
                        : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    {city.label}
                  </button>
                );
              })}
              <input
                type="text"
                placeholder="Other city..."
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchRecommendations();
                }}
                className="ml-auto bg-neutral-900 border border-white/15 focus:border-white text-white text-xs px-2.5 py-1 rounded-full outline-none font-mono placeholder:text-neutral-600 w-28 sm:w-36"
              />
            </div>
          )}

          {/* Results Grid / Scroll Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-black">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
                <Loader2 className="w-7 h-7 text-white animate-spin stroke-[2.5]" />
                <div className="text-center">
                  <p className="font-mono text-xs text-white uppercase tracking-widest">
                    Finding Cultural Matches...
                  </p>
                  <p className="font-mono text-[10px] text-neutral-400 mt-1">
                    Analyzing taste resonance and aesthetic continuity
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center min-h-[260px] text-center space-y-3">
                <div className="w-12 h-12 rounded-full border border-red-500/30 bg-red-950/20 text-red-400 flex items-center justify-center">
                  <X className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium">Unable to complete query</h3>
                  <p className="text-neutral-400 text-xs mt-1 max-w-md">{error}</p>
                </div>
                <button
                  onClick={fetchRecommendations}
                  className="px-4 py-1.5 rounded-full bg-white text-black font-mono text-xs font-semibold hover:bg-neutral-200"
                >
                  RETRY QUERY
                </button>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[260px] text-center space-y-2">
                <Compass className="w-8 h-8 text-neutral-700" />
                <h3 className="text-white text-sm font-medium">No discoveries found</h3>
                <p className="text-neutral-400 text-xs max-w-sm">
                  Try switching modes or adding more cultural memories to your shelves.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.map((rec) => {
                  const isPinned = pinnedIds.has(rec.id);
                  return (
                    <motion.div
                      key={rec.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group rounded-2xl bg-neutral-950 border border-white/10 hover:border-white/25 overflow-hidden flex flex-col justify-between shadow-lg transition-all"
                    >
                      {/* Top: Poster & Badges */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={rec.coverImageUrl}
                          alt={rec.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                        {/* Affinity Badge */}
                        <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-black shadow-sm uppercase tracking-wider">
                            {rec.affinity}% AFFINITY
                          </span>
                          <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-neutral-300 uppercase tracking-widest">
                            {rec.badgeLabel || `:: ${rec.domain.toUpperCase()}`}
                          </span>
                        </div>

                        {/* Title overlay at bottom of artwork */}
                        <div className="absolute bottom-2.5 left-2.5 right-2.5">
                          <h3 className="text-white font-semibold text-sm sm:text-base leading-tight drop-shadow-md line-clamp-1">
                            {rec.title}
                          </h3>
                          {rec.subtitle && (
                            <p className="text-neutral-300 text-xs mt-0.5 line-clamp-1 drop-shadow-sm font-mono text-[11px]">
                              {rec.subtitle} {rec.year ? `(${rec.year})` : ""}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Content: Bridge Reasoning & Pin Action */}
                      <div className="p-3.5 flex flex-col justify-between flex-1 space-y-3 bg-neutral-950">
                        {/* Bridge Explainability */}
                        <div className="rounded-xl bg-neutral-900/70 border border-white/[0.06] p-2.5">
                          <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
                            TASTE BRIDGE
                          </p>
                          <p className="text-neutral-300 text-xs leading-relaxed line-clamp-2">
                            {rec.bridgeReasoning}
                          </p>
                        </div>

                        {/* Pin Button */}
                        <motion.button
                          whileTap={jellyTap}
                          onClick={() => handlePin(rec)}
                          disabled={isPinned}
                          className={`w-full py-2 px-3 rounded-full flex items-center justify-center space-x-2 font-mono text-xs font-semibold tracking-wider uppercase transition-all ${
                            isPinned
                              ? "bg-neutral-800 text-neutral-400 border border-white/10 cursor-default"
                              : "bg-white text-black hover:bg-neutral-200 shadow-sm"
                          }`}
                        >
                          {isPinned ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>PINNED TO SHELF</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 stroke-[3]" />
                              <span>PIN TO {rec.domain.toUpperCase()} SHELF</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
