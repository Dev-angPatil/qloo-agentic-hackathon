"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Compass, Crosshair, Plus, Search, Sparkles } from "lucide-react";
import { Domain, Shelf, ShelfItem, Vibe } from "@/types";
import { getMemoryItems } from "@/lib/whiteboard";
import { getStoredCanvasItems, getStoredShelves, getStoredVibes, saveStoredCanvasItems, saveStoredShelves, saveStoredVibes } from "@/lib/storage";
import { jellyTap } from "@/lib/physics";
import { WhiteboardBook } from "@/components/WhiteboardBook";
import { MemoryPostIt } from "@/components/MemoryPostIt";
import { AddFlowChooserModal } from "@/components/AddFlowChooserModal";
import { NoteFlowModal } from "@/components/NoteFlowModal";
import { RecordFlowModal } from "@/components/RecordFlowModal";
import { ShelfDetailView } from "@/components/ShelfDetailView";
import { SmartAddModal } from "@/components/SmartAddModal";
import { TasteCompassModal } from "@/components/TasteCompassModal";
import { CreateVibeModal } from "@/components/CreateVibeModal";
import { VibeBoundary } from "@/components/VibeBoundary";
import { useTasteMemSync } from "@/lib/firebase/syncBridge";

export default function Home() {
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [canvasItems, setCanvasItems] = useState<ShelfItem[]>([]);
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [activeShelf, setActiveShelf] = useState<Shelf | null>(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [addFlow, setAddFlow] = useState<"note" | "record" | "vibe" | null>(null);
  const [isMediaSearchOpen, setIsMediaSearchOpen] = useState(false);
  const [isCompassOpen, setIsCompassOpen] = useState(false);
  const [compassDomain, setCompassDomain] = useState<Domain | undefined>();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panState = useRef({ dragging: false, x: 0, y: 0, startX: 0, startY: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchState = useRef({ distance: 0, zoom: 1 });

  // Real-time Cloud Firestore Synchronization Hook
  useTasteMemSync(
    useCallback((remoteShelves: Shelf[]) => {
      setShelves(remoteShelves);
    }, []),
    useCallback((remoteCanvas: ShelfItem[]) => {
      setCanvasItems(remoteCanvas);
    }, [])
  );

  useEffect(() => {
    setShelves(getStoredShelves());
    setCanvasItems(getStoredCanvasItems());
    setVibes(getStoredVibes());
  }, []);

  const persist = useCallback((nextShelves: Shelf[]) => {
    setShelves(nextShelves);
    saveStoredShelves(nextShelves);
    setActiveShelf((current) => current ? nextShelves.find((shelf) => shelf.id === current.id) || null : null);
  }, []);

  const openAddMenu = useCallback(() => setIsAddMenuOpen(true), []);

  const persistVibes = useCallback((nextVibes: Vibe[]) => {
    setVibes(nextVibes);
    saveStoredVibes(nextVibes);
  }, []);

  const saveCanvasItems = useCallback((nextItems: ShelfItem[]) => {
    setCanvasItems(nextItems);
    saveStoredCanvasItems(nextItems);
  }, []);

  const addCanvasItem = useCallback((item: ShelfItem) => {
    saveCanvasItems([item, ...canvasItems]);
  }, [canvasItems, saveCanvasItems]);

  const convertCanvasItem = useCallback((item: ShelfItem) => {
    saveCanvasItems(canvasItems.map((existing) => existing.id === item.id ? item : existing));
  }, [canvasItems, saveCanvasItems]);

  const updateCanvasItem = useCallback((item: ShelfItem) => {
    if (item.shelfId === "__canvas__") {
      saveCanvasItems(canvasItems.map((existing) => existing.id === item.id ? item : existing));
      return;
    }
    persist(shelves.map((shelf) => shelf.id === item.shelfId ? {
      ...shelf,
      items: shelf.items.map((existing) => existing.id === item.id ? item : existing),
    } : shelf));
  }, [canvasItems, persist, saveCanvasItems, shelves]);

  const moveCanvasItem = useCallback((item: ShelfItem, position: { x: number; y: number }) => {
    const target = vibes.find((vibe) => position.x >= vibe.position.x && position.x <= vibe.position.x + vibe.size.width && position.y >= vibe.position.y && position.y <= vibe.position.y + vibe.size.height);
    const nextItem = target
      ? { ...item, vibeId: target.id, position: { x: position.x - target.position.x, y: position.y - target.position.y } }
      : { ...item, vibeId: undefined, position };
    updateCanvasItem(nextItem);
  }, [updateCanvasItem, vibes]);

  const updateVibe = useCallback((nextVibe: Vibe) => {
    persistVibes(vibes.map((vibe) => vibe.id === nextVibe.id ? nextVibe : vibe));
  }, [persistVibes, vibes]);

  const addItemToShelf = useCallback((item: ShelfItem, shelfId: string) => {
    persist(shelves.map((shelf) => shelf.id === shelfId ? {
      ...shelf,
      items: [item, ...shelf.items],
      itemCount: shelf.items.length + 1,
      coverItemId: shelf.coverItemId || item.id,
    } : shelf));
  }, [persist, shelves]);

  const updateShelfPosition = useCallback((shelfId: string, x: number, y: number) => {
    persist(shelves.map((shelf) => shelf.id === shelfId ? { ...shelf, position: { x, y } } : shelf));
  }, [persist, shelves]);

  const updateShelf = useCallback((newShelf: Shelf) => {
    persist(shelves.map((shelf) => shelf.id === newShelf.id ? newShelf : shelf));
  }, [persist, shelves]);

  const handleDeleteItem = (shelfId: string, itemId: string) => {
    persist(shelves.map((shelf) => shelf.id === shelfId ? { ...shelf, items: shelf.items.filter((item) => item.id !== itemId), itemCount: shelf.items.length - 1, coverItemId: shelf.coverItemId === itemId ? shelf.items.find((item) => item.id !== itemId)?.id : shelf.coverItemId } : shelf));
  };

  const handleDeleteShelf = (shelfId: string) => {
    persist(shelves.filter((shelf) => shelf.id !== shelfId));
    setActiveShelf(null);
  };

  const handlePinRecommendation = (item: ShelfItem, domain: Domain) => {
    const target = shelves.find((shelf) => shelf.domain === domain) || shelves[0];
    if (target) addItemToShelf({ ...item, shelfId: target.id, memoryType: "media" }, target.id);
  };

  const memoryItems = useMemo(() => [...canvasItems, ...getMemoryItems(shelves)], [canvasItems, shelves]);
  const totalFragments = shelves.reduce((total, shelf) => total + shelf.items.length, 0) + canvasItems.length;

  const onBoardPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("button, article, input, textarea, a")) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture(event.pointerId);

    if (pointers.current.size === 1) {
      panState.current = { dragging: true, x: pan.x, y: pan.y, startX: event.clientX, startY: event.clientY };
    } else if (pointers.current.size === 2) {
      panState.current.dragging = false;
      const [first, second] = Array.from(pointers.current.values());
      pinchState.current = { distance: Math.hypot(second.x - first.x, second.y - first.y), zoom };
    }
  };

  const onBoardPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.current.size >= 2) {
      const [first, second] = Array.from(pointers.current.values());
      const distance = Math.hypot(second.x - first.x, second.y - first.y);
      if (pinchState.current.distance > 0) {
        const nextZoom = pinchState.current.zoom * (distance / pinchState.current.distance);
        setZoom(Math.max(0.05, Number(nextZoom.toFixed(3))));
      }
      return;
    }

    if (!panState.current.dragging) return;
    setPan({ x: panState.current.x + event.clientX - panState.current.startX, y: panState.current.y + event.clientY - panState.current.startY });
  };

  const onBoardPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    pinchState.current.distance = 0;
    panState.current.dragging = false;
  };

  return (
    <main className="whiteboard-app">
      <div className="board-grain" />
      <div className="board-header">
        <div className="brand-lockup">
          <div className="brand-mark"><Sparkles size={15} /></div>
          <div><p className="brand-name">TasteMem</p><p className="brand-subtitle">your life, in fragments</p></div>
        </div>
        <div className="board-stats"><span>{shelves.length} chapters</span><i /> <span>{totalFragments} fragments</span></div>
        <div className="header-actions">
           <button className="center-board-control" title="Center board" aria-label="Center board" onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }}><Crosshair size={15} /><span>center</span></button>
          <button className="header-icon" title="Open compass" onClick={() => { setCompassDomain(undefined); setIsCompassOpen(true); }}><Compass size={15} /></button>
        </div>
      </div>

       <section className="board-viewport" style={{ backgroundPosition: `${pan.x}px ${pan.y}px`, backgroundSize: `${36 * zoom}px ${36 * zoom}px` }} onPointerDown={onBoardPointerDown} onPointerMove={onBoardPointerMove} onPointerUp={onBoardPointerUp} onPointerCancel={onBoardPointerUp}>
         <motion.div className="board-world" style={{ x: pan.x, y: pan.y, scale: zoom }}>
           <div className="board-center-note">
             <h1>Your personal archive starts here.</h1>
           </div>
           {shelves.map((shelf, index) => <WhiteboardBook key={shelf.id} shelf={shelf} index={index} total={shelves.length} onOpen={setActiveShelf} onMove={updateShelfPosition} />)}
            {vibes.map((vibe) => <VibeBoundary key={vibe.id} vibe={vibe} items={memoryItems.filter((item) => item.vibeId === vibe.id)} onMove={(current, position) => updateVibe({ ...current, position })} onResize={(current, size) => updateVibe({ ...current, size })} onToggleCollapse={(current) => updateVibe({ ...current, collapsed: !current.collapsed })} />)}
            {memoryItems.map((item, index) => <MemoryPostIt key={item.id} item={item} index={index} vibes={vibes} onUpdate={updateCanvasItem} onMove={moveCanvasItem} />)}
         </motion.div>
      </section>

      <div className="board-controls">
          <div className="board-actions"><motion.button whileTap={jellyTap} className="board-action board-action-add" aria-label="Add to canvas" title="Add to canvas" onClick={openAddMenu}><Plus size={22} /></motion.button></div>
      </div>

      <AnimatePresence>
        {activeShelf && <ShelfDetailView shelf={activeShelf} onBack={() => setActiveShelf(null)} onOpenAddModal={() => setIsMediaSearchOpen(true)} onDeleteItem={handleDeleteItem} onDeleteShelf={handleDeleteShelf} onSetCoverItem={(shelfId, itemId) => updateShelf({ ...shelves.find((shelf) => shelf.id === shelfId)!, coverItemId: itemId })} onOpenCompass={(domain) => { setCompassDomain(domain); setIsCompassOpen(true); }} />}
      </AnimatePresence>
       <AddFlowChooserModal isOpen={isAddMenuOpen} onClose={() => setIsAddMenuOpen(false)} onChooseNote={() => { setIsAddMenuOpen(false); setAddFlow("note"); }} onChooseRecord={() => { setIsAddMenuOpen(false); setAddFlow("record"); }} onChooseVibe={() => { setIsAddMenuOpen(false); setAddFlow("vibe"); }} />
       <NoteFlowModal isOpen={addFlow === "note"} onClose={() => setAddFlow(null)} onSave={addCanvasItem} onConvert={convertCanvasItem} />
       <RecordFlowModal isOpen={addFlow === "record"} onClose={() => setAddFlow(null)} onSave={addCanvasItem} />
       <CreateVibeModal isOpen={addFlow === "vibe"} onClose={() => setAddFlow(null)} onCreate={(vibe) => { persistVibes([...vibes, vibe]); setAddFlow(null); }} />
      {activeShelf && <SmartAddModal domain={activeShelf.domain} shelfId={activeShelf.id} isOpen={isMediaSearchOpen} onClose={() => setIsMediaSearchOpen(false)} onItemAdded={(item) => addItemToShelf({ ...item, memoryType: "media" }, activeShelf.id)} />}
      <TasteCompassModal isOpen={isCompassOpen} onClose={() => setIsCompassOpen(false)} shelves={shelves} onPinRecommendation={handlePinRecommendation} initialDomain={compassDomain} />
      <div className="board-search-hint"><Search size={13} /> <span>everything here can become a thread</span></div>
    </main>
  );
}
