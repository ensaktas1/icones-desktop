import { Icon } from "@iconify/react";

interface Props {
  query: string;
  onQuery: (q: string) => void;
  breadcrumb: string[];
  theme: "dark" | "light";
  onTheme: () => void;
}

export function Topbar({ query, onQuery, breadcrumb, theme, onTheme }: Props) {
  return (
    <header className="topbar" data-tauri-drag-region>
      <div className="search">
        <Icon icon="lucide:search" className="search-icon" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search 200,000+ icons"
          spellCheck={false}
          autoFocus
        />
        {query ? (
          <button className="search-clear" onClick={() => onQuery("")}>
            <Icon icon="lucide:x" />
          </button>
        ) : (
          <span className="kbd">
            <Icon icon="lucide:command" />F
          </span>
        )}
      </div>

      <div className="topbar-right">
        <nav className="breadcrumb">
          {breadcrumb.map((b, i) => (
            <span key={i}>
              {i > 0 && <span className="sep">/</span>}
              <span className={i === breadcrumb.length - 1 ? "current" : ""}>{b}</span>
            </span>
          ))}
        </nav>
        <button className="ghost-btn" onClick={onTheme} title="Toggle theme">
          <Icon icon={theme === "dark" ? "lucide:moon" : "lucide:sun"} />
        </button>
      </div>
    </header>
  );
}
