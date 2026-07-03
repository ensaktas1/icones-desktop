import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import type { CollectionMeta } from "../lib/api";

export type PaletteFilter = "all" | "mono" | "color";

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
  // Group collections by their category (mirrors the "Sets" tree).
  const groups = useMemo(() => {
    const map = new Map<string, CollectionMeta[]>();
    for (const c of collections) {
      if (palette === "mono" && c.palette) continue;
      if (palette === "color" && !c.palette) continue;
      const cat = c.category || "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(c);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [collections, palette]);

  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (cat: string) =>
    setOpen((s) => {
      const n = new Set(s);
      n.has(cat) ? n.delete(cat) : n.add(cat);
      return n;
    });

  return (
    <aside className="sidebar">
      <div className="sidebar-head" data-tauri-drag-region>
        <div className="logo">
          <Icon icon="ph:shapes-duotone" />
        </div>
      </div>

      <div className="sidebar-scroll">
        <section>
          <div className="sidebar-label">Sets</div>
          <div className="tree">
            {groups.map(([cat, items]) => {
              const isOpen = open.has(cat);
              return (
                <div key={cat} className="tree-group">
                  <button className="tree-parent" onClick={() => toggle(cat)}>
                    <Icon
                      icon="lucide:chevron-right"
                      className={`chevron ${isOpen ? "open" : ""}`}
                    />
                    <span>{cat}</span>
                    <span className="count">{items.length}</span>
                  </button>
                  {isOpen && (
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
              );
            })}
          </div>
        </section>

        <section>
          <div className="sidebar-label">Style</div>
          <div className="segmented">
            {(["all", "mono", "color"] as PaletteFilter[]).map((p) => (
              <button
                key={p}
                className={palette === p ? "active" : ""}
                onClick={() => onPalette(p)}
              >
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
    </aside>
  );
}
