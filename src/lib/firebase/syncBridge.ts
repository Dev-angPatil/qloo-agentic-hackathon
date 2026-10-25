"use client";

import { useEffect, useState, useRef } from "react";
import { User } from "firebase/auth";
import { initAnonymousAuth, onAuthChange } from "./auth";
import {
  fetchUserShelves,
  saveShelfToFirestore,
  fetchCanvasItems,
  saveCanvasItemsToFirestore,
  subscribeToUserShelves,
} from "./firestoreService";
import {
  getStoredShelves,
  saveStoredShelves,
  getStoredCanvasItems,
  saveStoredCanvasItems,
} from "../storage";
import { Shelf, ShelfItem } from "@/types";

export interface SyncState {
  user: User | null;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  cloudActive: boolean;
}

const SYNC_EVENT_NAME = "tastemem_remote_sync";

/**
 * Perform bi-directional reconciliation on startup:
 * 1. Authenticate guest user.
 * 2. If Cloud has data and local is empty, pull Cloud -> Local.
 * 3. If Local has data and Cloud is empty, push Local -> Cloud.
 * 4. Subscribe to Cloud changes.
 */
export async function initializeTasteMemSync(
  onShelvesRemoteChange?: (shelves: Shelf[]) => void,
  onCanvasRemoteChange?: (items: ShelfItem[]) => void
): Promise<() => void> {
  if (typeof window === "undefined") return () => {};

  try {
    const user = await initAnonymousAuth();
    if (!user) return () => {};

    const localShelves = getStoredShelves();
    const localCanvas = getStoredCanvasItems();

    const cloudShelves = await fetchUserShelves(user.uid);
    const cloudCanvas = await fetchCanvasItems(user.uid);

    // Initial Merge / Migration:
    if (cloudShelves.length === 0 && localShelves.length > 0) {
      // Push local data to cloud
      for (const shelf of localShelves) {
        await saveShelfToFirestore(user.uid, shelf);
      }
      if (localCanvas.length > 0) {
        await saveCanvasItemsToFirestore(user.uid, localCanvas);
      }
    } else if (cloudShelves.length > 0 && localShelves.length === 0) {
      // Pull cloud data to local
      saveStoredShelves(cloudShelves);
      if (onShelvesRemoteChange) onShelvesRemoteChange(cloudShelves);

      if (cloudCanvas.length > 0) {
        saveStoredCanvasItems(cloudCanvas);
        if (onCanvasRemoteChange) onCanvasRemoteChange(cloudCanvas);
      }
    }

    // Subscribe to ongoing real-time updates from other devices / browser tabs
    const unsubscribe = subscribeToUserShelves(user.uid, (remoteShelves) => {
      saveStoredShelves(remoteShelves);
      if (onShelvesRemoteChange) {
        onShelvesRemoteChange(remoteShelves);
      }
      // Dispatch browser custom event for decoupling
      window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME, { detail: remoteShelves }));
    });

    return unsubscribe;
  } catch (err) {
    console.error("TasteMem Sync initialization failed", err);
    return () => {};
  }
}

/**
 * Sync active shelves & canvas to Cloud Firestore on mutation.
 */
export async function syncLocalChangesToCloud(
  shelves: Shelf[],
  canvasItems?: ShelfItem[]
): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const user = await initAnonymousAuth();
    if (!user) return;

    for (const shelf of shelves) {
      await saveShelfToFirestore(user.uid, shelf);
    }

    if (canvasItems && canvasItems.length > 0) {
      await saveCanvasItemsToFirestore(user.uid, canvasItems);
    }
  } catch (err) {
    console.error("TasteMem: Failed to sync changes to Cloud Firestore", err);
  }
}

/**
 * React hook for components to observe cloud synchronization status.
 */
export function useTasteMemSync(
  onRemoteShelves?: (shelves: Shelf[]) => void,
  onRemoteCanvas?: (items: ShelfItem[]) => void
) {
  const [syncState, setSyncState] = useState<SyncState>({
    user: null,
    isSyncing: true,
    lastSyncedAt: null,
    cloudActive: false,
  });

  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let mounted = true;

    const setup = async () => {
      const user = await initAnonymousAuth();
      if (!mounted) return;

      if (user) {
        setSyncState({
          user,
          isSyncing: false,
          lastSyncedAt: new Date(),
          cloudActive: true,
        });

        const unsub = await initializeTasteMemSync(onRemoteShelves, onRemoteCanvas);
        unsubRef.current = unsub;
      } else {
        setSyncState((prev) => ({ ...prev, isSyncing: false, cloudActive: false }));
      }
    };

    setup();

    const unsubAuth = onAuthChange((user) => {
      if (!mounted) return;
      setSyncState((prev) => ({
        ...prev,
        user,
        cloudActive: Boolean(user),
      }));
    });

    return () => {
      mounted = false;
      unsubAuth();
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  return syncState;
}
