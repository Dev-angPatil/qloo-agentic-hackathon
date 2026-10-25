import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import { db } from "./client";
import { Shelf, ShelfItem } from "@/types";

/**
 * Fetch all shelves with their nested items for a given user.
 */
export async function fetchUserShelves(userId: string): Promise<Shelf[]> {
  if (!userId) return [];
  try {
    const shelvesRef = collection(db, "users", userId, "shelves");
    const shelvesSnap = await getDocs(shelvesRef);
    const shelves: Shelf[] = [];

    for (const shelfDoc of shelvesSnap.docs) {
      const data = shelfDoc.data() as Omit<Shelf, "items">;
      const itemsRef = collection(db, "users", userId, "shelves", shelfDoc.id, "items");
      const itemsSnap = await getDocs(query(itemsRef, orderBy("createdAt", "desc")));
      const items: ShelfItem[] = itemsSnap.docs.map((d) => d.data() as ShelfItem);

      shelves.push({
        id: shelfDoc.id,
        title: data.title || "Untitled Shelf",
        domain: data.domain || "movies",
        itemCount: items.length,
        items,
        coverItemId: data.coverItemId || (items[0]?.id),
        colorTheme: data.colorTheme,
        position: data.position,
        createdAt: data.createdAt || new Date().toISOString(),
      });
    }

    return shelves;
  } catch (err) {
    console.error("TasteMem Firestore: Error fetching user shelves", err);
    return [];
  }
}

/**
 * Save a complete shelf and its items to Firestore.
 */
export async function saveShelfToFirestore(userId: string, shelf: Shelf): Promise<void> {
  if (!userId || !shelf?.id) return;
  try {
    const batch = writeBatch(db);
    const shelfRef = doc(db, "users", userId, "shelves", shelf.id);

    // Save shelf metadata
    const shelfPayload = {
      id: shelf.id,
      title: shelf.title,
      domain: shelf.domain,
      itemCount: shelf.items?.length || 0,
      coverItemId: shelf.coverItemId || null,
      colorTheme: shelf.colorTheme || null,
      position: shelf.position || null,
      createdAt: shelf.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    batch.set(shelfRef, shelfPayload, { merge: true });

    // Save items
    if (Array.isArray(shelf.items)) {
      for (const item of shelf.items) {
        if (!item.id) continue;
        const itemRef = doc(db, "users", userId, "shelves", shelf.id, "items", item.id);
        batch.set(itemRef, {
          ...item,
          shelfId: shelf.id,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }
    }

    await batch.commit();
  } catch (err) {
    console.error(`TasteMem Firestore: Error saving shelf ${shelf.id}`, err);
  }
}

/**
 * Delete a shelf and its subcollection items from Firestore.
 */
export async function deleteShelfFromFirestore(userId: string, shelfId: string): Promise<void> {
  if (!userId || !shelfId) return;
  try {
    const itemsRef = collection(db, "users", userId, "shelves", shelfId, "items");
    const itemsSnap = await getDocs(itemsRef);
    const batch = writeBatch(db);

    itemsSnap.docs.forEach((d) => batch.delete(d.ref));
    const shelfRef = doc(db, "users", userId, "shelves", shelfId);
    batch.delete(shelfRef);

    await batch.commit();
  } catch (err) {
    console.error(`TasteMem Firestore: Error deleting shelf ${shelfId}`, err);
  }
}

/**
 * Save a single item to a shelf.
 */
export async function saveItemToFirestore(userId: string, shelfId: string, item: ShelfItem): Promise<void> {
  if (!userId || !shelfId || !item?.id) return;
  try {
    const itemRef = doc(db, "users", userId, "shelves", shelfId, "items", item.id);
    await setDoc(itemRef, {
      ...item,
      shelfId,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.error(`TasteMem Firestore: Error saving item ${item.id}`, err);
  }
}

/**
 * Delete a single item from a shelf.
 */
export async function deleteItemFromFirestore(userId: string, shelfId: string, itemId: string): Promise<void> {
  if (!userId || !shelfId || !itemId) return;
  try {
    const itemRef = doc(db, "users", userId, "shelves", shelfId, "items", itemId);
    await deleteDoc(itemRef);
  } catch (err) {
    console.error(`TasteMem Firestore: Error deleting item ${itemId}`, err);
  }
}

/**
 * Fetch canvas / whiteboard items.
 */
export async function fetchCanvasItems(userId: string): Promise<ShelfItem[]> {
  if (!userId) return [];
  try {
    const canvasRef = collection(db, "users", userId, "canvas_items");
    const snap = await getDocs(canvasRef);
    return snap.docs.map((d) => d.data() as ShelfItem);
  } catch (err) {
    console.error("TasteMem Firestore: Error fetching canvas items", err);
    return [];
  }
}

/**
 * Save canvas items to Firestore.
 */
export async function saveCanvasItemsToFirestore(userId: string, items: ShelfItem[]): Promise<void> {
  if (!userId) return;
  try {
    const batch = writeBatch(db);
    for (const item of items) {
      if (!item.id) continue;
      const ref = doc(db, "users", userId, "canvas_items", item.id);
      batch.set(ref, { ...item, updatedAt: new Date().toISOString() }, { merge: true });
    }
    await batch.commit();
  } catch (err) {
    console.error("TasteMem Firestore: Error saving canvas items", err);
  }
}

/**
 * Real-time listener for user shelves.
 */
export function subscribeToUserShelves(
  userId: string,
  onShelvesUpdated: (shelves: Shelf[]) => void
): () => void {
  if (!userId) return () => {};

  const shelvesRef = collection(db, "users", userId, "shelves");
  return onSnapshot(shelvesRef, async () => {
    const refreshed = await fetchUserShelves(userId);
    onShelvesUpdated(refreshed);
  });
}
