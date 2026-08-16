export type Priority = "low" | "medium" | "high";

export type WishlistStatus = "wanted" | "purchased";

export interface WishlistItem {
  id: string;
  title: string;
  price?: number;
  priority: Priority;
  link?: string;
  notes?: string;
  category?: string;
  tags?: string[];
  status: WishlistStatus;
  createdAt: string;
  purchasedAt?: string;
  expectedDate?: string;
}

export type NewWishlistItem = Omit<WishlistItem, "id" | "createdAt" | "status" | "purchasedAt">;

export interface UpcomingItem {
  id: string;
  module: "wishlist";
  title: string;
  dueDate: string | null;
  recurrence: null;
  status: "pending";
  notes: string;
}
