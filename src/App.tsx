import { useEffect, useMemo, useState } from "react";
import { Sidebar, type PaletteFilter } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { IconGrid } from "./components/IconGrid";
import { ExportPanel } from "./components/ExportPanel";
import {
  fetchCollections,
  fetchCollection,
  searchIcons,
  type CollectionMeta,
} from "./lib/api";
import "./styles.css";

const PAGE = 200;
const DEFAULT_SET = "lucide";

export default function App() {
  const [collections, setCollections] = useState<CollectionMeta[]>([]);
  const [activePrefix, setActivePrefix] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [names, setNames] = useState<string[]>([]); // full "prefix:name"
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(PAGE);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const [palette, setPalette] = useState<PaletteFilter>("all");
  const [gridSize, setGridSize] = useState(56);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Load collection index once.
  useEffect(() => {
    fetchCollections()
      .then((list) => {
        setCollections(list);
        const initial = list.find((c) => c.prefix === DEFAULT_SET) ?? list[0];
        if (initial) setActivePrefix(initial.prefix);
      })
      .catch(() => setLoading(false));
  }, []);

  const searching = query.trim().length > 0;

  // Resolve the visible icon list from either search or the active collection.
  useEffect(() => {
    let alive = true;
    setLoading(true);

    const run = async () => {
      if (searching) {
        const r = await searchIcons(query, limit);
        if (!alive) return;
        setNames(r.icons);
        setTotal(r.total);
      } else if (activePrefix) {
        const info = await fetchCollection(activePrefix);
        if (!alive) return;
        setNames(info.icons.map((n) => `${activePrefix}:${n}`));
        setTotal(info.total);
      } else {
        setNames([]);
        setTotal(0);
      }
      if (alive) setLoading(false);
    };

    const t = setTimeout(run, searching ? 220 : 0);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [query, activePrefix, searching, limit]);

  // Reset paging whenever the context changes.
  useEffect(() => setLimit(PAGE), [query, activePrefix]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const visible = useMemo(() => names.slice(0, limit), [names, limit]);

  const activeMeta = collections.find((c) => c.prefix === activePrefix);
  const breadcrumb = searching
    ? ["Icons", "Search", `"${query.trim()}"`]
    : activeMeta
      ? ["Icons", activeMeta.category || "Sets", activeMeta.name]
      : ["Icons"];

  return (
    <div className="app">
      <Sidebar
        collections={collections}
        activePrefix={activePrefix}
        onSelect={(p) => {
          setActivePrefix(p);
          setQuery("");
        }}
        palette={palette}
        onPalette={setPalette}
        gridSize={gridSize}
        onGridSize={setGridSize}
      />

      <main className="main">
        <Topbar
          query={query}
          onQuery={setQuery}
          breadcrumb={breadcrumb}
          theme={theme}
          onTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        />

        <div className="content">
          <IconGrid
            icons={visible}
            total={total}
            selected={selected}
            onSelect={setSelected}
            gridSize={gridSize}
            loading={loading}
            onLoadMore={() => setLimit((l) => l + PAGE)}
            emptyHint={searching ? `No icons match "${query}"` : "Select a set to browse"}
          />
        </div>
      </main>

      {selected && <ExportPanel name={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
