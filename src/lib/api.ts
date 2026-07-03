// Thin client over the public Iconify API (https://iconify.design/docs/api/).
// Same data source that powers icones.js.org — 200k+ icons, 150+ open sets.

const API = "https://api.iconify.design";

export interface CollectionMeta {
  prefix: string;
  name: string;
  total: number;
  author?: string;
  license?: string;
  category?: string;
  palette?: boolean; // true = has hardcoded colors, false = monochrome (currentColor)
  height?: number;
  samples?: string[];
}

export interface CollectionInfo {
  prefix: string;
  title: string;
  total: number;
  icons: string[]; // flat list of icon names (no prefix)
}

// ---- simple in-memory caches (session lifetime) ----
let collectionsCache: CollectionMeta[] | null = null;
const collectionCache = new Map<string, CollectionInfo>();

export async function fetchCollections(): Promise<CollectionMeta[]> {
  if (collectionsCache) return collectionsCache;
  const res = await fetch(`${API}/collections`);
  const raw = (await res.json()) as Record<string, any>;
  const list: CollectionMeta[] = Object.entries(raw).map(([prefix, v]) => ({
    prefix,
    name: v.name ?? prefix,
    total: v.total ?? 0,
    author: v.author?.name,
    license: v.license?.title,
    category: v.category ?? "Other",
    palette: v.palette ?? false,
    height: Array.isArray(v.height) ? v.height[0] : v.height,
    samples: v.samples,
  }));
  list.sort((a, b) => a.name.localeCompare(b.name));
  collectionsCache = list;
  return list;
}

export async function fetchCollection(prefix: string): Promise<CollectionInfo> {
  const cached = collectionCache.get(prefix);
  if (cached) return cached;
  const res = await fetch(`${API}/collection?prefix=${encodeURIComponent(prefix)}`);
  const data = (await res.json()) as any;

  // Icons can live under `uncategorized` and/or `categories: { cat: [...] }`.
  const names = new Set<string>();
  if (Array.isArray(data.uncategorized)) data.uncategorized.forEach((n: string) => names.add(n));
  if (data.categories) {
    for (const arr of Object.values<string[]>(data.categories)) arr.forEach((n) => names.add(n));
  }
  // Aliases are real, usable icon names too.
  if (data.aliases) Object.keys(data.aliases).forEach((n) => names.add(n));

  const info: CollectionInfo = {
    prefix,
    title: data.title ?? prefix,
    total: data.total ?? names.size,
    icons: [...names].sort(),
  };
  collectionCache.set(prefix, info);
  return info;
}

export interface SearchResult {
  icons: string[]; // full "prefix:name"
  total: number;
}

export async function searchIcons(query: string, limit = 120): Promise<SearchResult> {
  const q = query.trim();
  if (!q) return { icons: [], total: 0 };
  const res = await fetch(`${API}/search?query=${encodeURIComponent(q)}&limit=${limit}`);
  const data = (await res.json()) as any;
  return { icons: data.icons ?? [], total: data.total ?? (data.icons?.length ?? 0) };
}
