import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { openUrl } from "@tauri-apps/plugin-opener";
import type { CollectionMeta } from "../lib/api";

export type PaletteFilter = "all" | "mono" | "color";

const DESERVE_URL = "https://deserve.studio";

interface Props {
  collections: CollectionMeta[];
  activePrefix: string | null;
  onSelect: (prefix: string) => void;
  palette: PaletteFilter;
  onPalette: (p: PaletteFilter) => void;
  gridSize: number;
  onGridSize: (n: number) => void;
}

const GRID_SIZES = [
  { label: "Compact", value: 40 },
  { label: "Cozy", value: 56 },
  { label: "Large", value: 72 },
];

export function Sidebar({
  collections,
  activePrefix,
  onSelect,
  palette,
  onPalette,
  gridSize,
  onGridSize,
}: Props) {
  const [setQuery, setSetQuery] = useState("");

  // Group collections by category, filtered by the palette and the set search.
  const groups = useMemo(() => {
    const q = setQuery.trim().toLowerCase();
    const map = new Map<string, CollectionMeta[]>();
    for (const c of collections) {
      if (palette === "mono" && c.palette) continue;
      if (palette === "color" && !c.palette) continue;
      if (q && !`${c.name} ${c.prefix} ${c.category ?? ""}`.toLowerCase().includes(q)) continue;
      const cat = c.category || "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(c);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [collections, palette, setQuery]);

  const [open, setOpen] = useState<Set<string>>(new Set());
  const searching = setQuery.trim().length > 0;
  const isOpen = (cat: string) => searching || open.has(cat);
  const toggle = (cat: string) =>
    setOpen((s) => {
      const n = new Set(s);
      n.has(cat) ? n.delete(cat) : n.add(cat);
      return n;
    });

  const openSite = () => {
    openUrl(DESERVE_URL).catch(() => window.open(DESERVE_URL, "_blank"));
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header" data-tauri-drag-region>
        <div className="sidebar-search">
          <Icon icon="lucide:search" className="search-icon" />
          <input
            value={setQuery}
            onChange={(e) => setSetQuery(e.target.value)}
            placeholder="Search sets"
            spellCheck={false}
          />
          {setQuery && (
            <button className="search-clear" onClick={() => setSetQuery("")}>
              <Icon icon="lucide:x" />
            </button>
          )}
        </div>
      </div>

      <div className="sidebar-scroll">
        <section>
          <div className="sidebar-label">Sets</div>
          <div className="tree">
            {groups.length === 0 && <div className="tree-empty">No sets match “{setQuery}”</div>}
            {groups.map(([cat, items]) => (
              <div key={cat} className="tree-group">
                <button className="tree-parent" onClick={() => toggle(cat)}>
                  <Icon
                    icon="lucide:chevron-right"
                    className={`chevron ${isOpen(cat) ? "open" : ""}`}
                  />
                  <span>{cat}</span>
                  <span className="count">{items.length}</span>
                </button>
                {isOpen(cat) && (
                  <div className="tree-children">
                    {items.map((c) => (
                      <button
                        key={c.prefix}
                        className={`tree-child ${activePrefix === c.prefix ? "active" : ""}`}
                        onClick={() => onSelect(c.prefix)}
                        title={`${c.name} · ${c.total} icons`}
                      >
                        <span className="truncate">{c.name}</span>
                        <span className="count">{c.total}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="sidebar-label">Style</div>
          <div className="segmented">
            {(["all", "mono", "color"] as PaletteFilter[]).map((p) => (
              <button key={p} className={palette === p ? "active" : ""} onClick={() => onPalette(p)}>
                {p === "all" ? "All" : p === "mono" ? "Monochrome" : "Colored"}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="sidebar-label">Size</div>
          <div className="stack">
            {GRID_SIZES.map((s) => (
              <button
                key={s.value}
                className={`stack-item ${gridSize === s.value ? "active" : ""}`}
                onClick={() => onGridSize(s.value)}
              >
                {gridSize === s.value && <Icon icon="lucide:check" />}
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="sidebar-foot">
        <button className="built-by" onClick={openSite}>
          Built by <span>Deserve Studio</span>
          <Icon icon="lucide:arrow-up-right" />
        </button>
      </div>
    </aside>
  );
}
