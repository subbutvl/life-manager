import Dexie, { type Table } from "dexie";
import { generateId } from "@/core/idUtils";
import type { WishlistItem, NewWishlistItem, UpcomingItem } from "./types";

const PRIORITY_RANK: Record<WishlistItem["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

class WishlistDB extends Dexie {
  items!: Table<WishlistItem, string>;

  constructor() {
    super("app-wishlist");
    this.version(1).stores({
      items: "id, status, priority, createdAt",
    });
  }
}

const db = new WishlistDB();

export async function getAll(): Promise<WishlistItem[]> {
  return db.items.orderBy("createdAt").reverse().toArray();
}

export async function create(item: NewWishlistItem): Promise<string> {
  const id = generateId();
  const record: WishlistItem = {
    ...item,
    id,
    status: "wanted",
    createdAt: new Date().toISOString(),
  };
  await db.items.add(record);
  return id;
}

export async function update(
  id: string,
  changes: Partial<Omit<WishlistItem, "id" | "createdAt">>
): Promise<void> {
  await db.items.update(id, changes);
}

export async function remove(id: string): Promise<void> {
  await db.items.delete(id);
}

export async function getUpcoming(): Promise<UpcomingItem[]> {
  const wanted = await db.items
    .where("status")
    .equals("wanted")
    .toArray();
  return wanted
    .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])
    .map((item) => ({
      id: item.id,
      module: "wishlist" as const,
      title: item.title,
      dueDate: item.expectedDate ?? null,
      recurrence: null,
      status: "pending" as const,
      notes: item.notes ?? "",
    }));
}
