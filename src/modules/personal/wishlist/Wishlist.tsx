import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  PencilSimple,
  Trash,
  LinkSimple,
  CheckCircle,
  CaretDown,
  CaretUp,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as db from "./db";
import type { WishlistItem, Priority, NewWishlistItem } from "./types";

const PRIORITY_ORDER: Priority[] = ["high", "medium", "low"];

const PRIORITY_META: Record<
  Priority,
  { label: string; badge: "destructive" | "default" | "secondary" }
> = {
  high: { label: "High", badge: "destructive" },
  medium: { label: "Medium", badge: "default" },
  low: { label: "Low", badge: "secondary" },
};

interface FormState {
  title: string;
  price: string;
  priority: Priority;
  link: string;
  notes: string;
  expectedDate: string;
  category: string;
  tags: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  price: "",
  priority: "medium",
  link: "",
  notes: "",
  expectedDate: "",
  category: "",
  tags: "",
};

function formatPrice(price?: number): string | null {
  if (price == null || Number.isNaN(price)) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(price);
}

function formatDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type Timing = "early" | "onTime" | "late";

function getTiming(expected?: string, purchased?: string): Timing | null {
  if (!expected || !purchased) return null;
  const e = new Date(expected);
  const p = new Date(purchased);
  if (Number.isNaN(e.getTime()) || Number.isNaN(p.getTime())) return null;
  const diff = Math.round(
    (e.getTime() - p.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return "onTime";
  return diff > 0 ? "early" : "late";
}

function toDateInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<Priority>>(new Set());

  const refresh = useCallback(async () => {
    const all = await db.getAll();
    setItems(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const wantedItems = useMemo(
    () => items.filter((i) => i.status === "wanted"),
    [items]
  );
  const purchasedItems = useMemo(
    () => items.filter((i) => i.status === "purchased"),
    [items]
  );

  const allCategories = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      if (item.category) set.add(item.category);
    }
    return Array.from(set).sort();
  }, [items]);

  const grouped = useMemo(() => {
    const map: Record<Priority, WishlistItem[]> = {
      high: [],
      medium: [],
      low: [],
    };
    for (const item of wantedItems) {
      map[item.priority].push(item);
    }
    return map;
  }, [wantedItems]);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (item: WishlistItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      price: item.price != null ? String(item.price) : "",
      priority: item.priority,
      link: item.link ?? "",
      notes: item.notes ?? "",
      expectedDate: toDateInput(item.expectedDate),
      category: item.category ?? "",
      tags: item.tags?.join(", ") ?? "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    const priceNum = form.price.trim() ? Number(form.price) : undefined;
    const payload: NewWishlistItem = {
      title: form.title.trim(),
      price: priceNum != null && !Number.isNaN(priceNum) ? priceNum : undefined,
      priority: form.priority,
      link: form.link.trim() || undefined,
      notes: form.notes.trim() || undefined,
      expectedDate: form.expectedDate
        ? new Date(form.expectedDate).toISOString()
        : undefined,
      category: form.category.trim() || undefined,
      tags: form.tags
        ? form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,
    };
    try {
      if (editingId) {
        await db.update(editingId, payload);
      } else {
        await db.create(payload);
      }
      await refresh();
      setDialogOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPurchased = async (item: WishlistItem) => {
    await db.update(item.id, {
      status: "purchased",
      purchasedAt: new Date().toISOString(),
    });
    refresh();
  };

  const handleDelete = async (id: string) => {
    await db.remove(id);
    refresh();
  };

  const toggleCollapse = (p: Priority) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Wishlist
          </h2>
          <p className="font-body text-sm text-muted-foreground">
            Track things you want and what you've bought.
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus size={18} weight="bold" className="mr-1.5" />
          Add item
        </Button>
      </div>

      {loading ? (
        <p className="font-body text-sm text-muted-foreground">Loading...</p>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <p className="font-body text-sm text-muted-foreground">
              No wishlist items yet.
            </p>
            <Button variant="outline" size="sm" onClick={openAdd}>
              <Plus size={16} weight="bold" className="mr-1.5" />
              Add your first item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {wantedItems.length > 0 && (
            <div className="space-y-4">
              {PRIORITY_ORDER.map((priority) => {
                const list = grouped[priority];
                if (list.length === 0) return null;
                const isCollapsed = collapsed.has(priority);
                const meta = PRIORITY_META[priority];
                return (
                  <div key={priority} className="space-y-2">
                    <button
                      type="button"
                      onClick={() => toggleCollapse(priority)}
                      className="flex w-full items-center gap-2 text-left"
                    >
                      <Badge variant={meta.badge}>{meta.label}</Badge>
                      <span className="font-body text-xs text-muted-foreground">
                        {list.length} {list.length === 1 ? "item" : "items"}
                      </span>
                      {isCollapsed ? (
                        <CaretDown size={14} className="text-muted-foreground" />
                      ) : (
                        <CaretUp size={14} className="text-muted-foreground" />
                      )}
                    </button>
                    {!isCollapsed && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {list.map((item) => (
                          <WishlistCard
                            key={item.id}
                            item={item}
                            onEdit={() => openEdit(item)}
                            onMarkPurchased={() => handleMarkPurchased(item)}
                            onDelete={() => handleDelete(item.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {purchasedItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Purchased
                </h3>
                <span className="font-body text-xs text-muted-foreground">
                  {purchasedItems.length}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {purchasedItems.map((item) => (
                  <WishlistCard
                    key={item.id}
                    item={item}
                    onEdit={() => openEdit(item)}
                    onMarkPurchased={() => handleMarkPurchased(item)}
                    onDelete={() => handleDelete(item.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingId ? "Edit item" : "Add wishlist item"}
            </DialogTitle>
            <DialogDescription className="font-body">
              {editingId
                ? "Update the details of this wishlist item."
                : "Add something you'd like to get."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wl-title">Title</Label>
              <Input
                id="wl-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. Wireless headphones"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wl-price">Price (optional)</Label>
                <Input
                  id="wl-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wl-priority">Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, priority: v as Priority }))
                  }
                >
                  <SelectTrigger id="wl-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wl-link">Link (optional)</Label>
                <Input
                  id="wl-link"
                  type="url"
                  value={form.link}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, link: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wl-expected">Expected by (optional)</Label>
                <Input
                  id="wl-expected"
                  type="date"
                  value={form.expectedDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, expectedDate: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wl-category">Category (optional)</Label>
                <Input
                  id="wl-category"
                  list="wl-categories"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  placeholder="e.g. Electronics"
                />
                <datalist id="wl-categories">
                  {allCategories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wl-tags">Tags (optional)</Label>
                <Input
                  id="wl-tags"
                  value={form.tags}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tags: e.target.value }))
                  }
                  placeholder="comma, separated"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wl-notes">Notes (optional)</Label>
              <Textarea
                id="wl-notes"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Size, color, why you want it..."
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !form.title.trim()}>
                {editingId ? "Save changes" : "Add item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface WishlistCardProps {
  item: WishlistItem;
  onEdit: () => void;
  onMarkPurchased: () => void;
  onDelete: () => void;
}

function WishlistCard({
  item,
  onEdit,
  onMarkPurchased,
  onDelete,
}: WishlistCardProps) {
  const price = formatPrice(item.price);
  const purchasedDate = formatDate(item.purchasedAt);
  const expectedDate = formatDate(item.expectedDate);
  const timing = getTiming(item.expectedDate, item.purchasedAt);
  const meta = PRIORITY_META[item.priority];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base leading-tight">
              <span
                className={
                  item.status === "purchased" ? "line-through text-muted-foreground" : ""
                }
              >
                {item.title}
              </span>
            </CardTitle>
            {price && (
              <CardDescription className="font-body">{price}</CardDescription>
            )}
          </div>
          <Badge variant={meta.badge}>{meta.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {item.category && (
          <Badge variant="outline" className="font-body">
            {item.category}
          </Badge>
        )}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="font-body"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {item.notes && (
          <p className="font-body text-sm text-muted-foreground line-clamp-3">
            {item.notes}
          </p>
        )}
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-body text-sm text-primary hover:underline"
          >
            <LinkSimple size={14} />
            View product
          </a>
        )}
        {item.status === "wanted" && expectedDate && (
          <p className="font-body text-xs text-muted-foreground">
            Expected by {expectedDate}
          </p>
        )}
        {item.status === "purchased" && purchasedDate && (
          <div className="space-y-1">
            <p className="font-body text-xs text-muted-foreground">
              Purchased {purchasedDate}
              {expectedDate && ` (expected ${expectedDate})`}
            </p>
            {timing && (
              <Badge variant={timing === "late" ? "destructive" : "secondary"}>
                {timing === "early"
                  ? "Purchased early"
                  : timing === "late"
                    ? "Purchased late"
                    : "Purchased on time"}
              </Badge>
            )}
          </div>
        )}
        <div className="flex items-center gap-1.5 pt-1">
          {item.status === "wanted" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onMarkPurchased}
              title="Mark as purchased"
            >
              <CheckCircle size={16} weight="bold" className="mr-1.5" />
              Mark purchased
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            title="Edit"
          >
            <PencilSimple size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            title="Delete"
            className="text-destructive hover:text-destructive"
          >
            <Trash size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
