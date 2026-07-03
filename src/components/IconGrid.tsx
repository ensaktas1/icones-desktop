import { Icon } from "@iconify/react";

interface Props {
  icons: string[]; // full "prefix:name"
  total: number;
  selected: string | null;
  onSelect: (name: string) => void;
  gridSize: number;
  loading: boolean;
  onLoadMore?: () => void;
  emptyHint?: string;
}

export function IconGrid({
  icons,
  total,
  selected,
  onSelect,
  gridSize,
  loading,
  onLoadMore,
  emptyHint,
}: Props) {
  if (loading && icons.length === 0) {
    return (
      <div className="grid-state">
        <Icon icon="svg-spinners:90-ring-with-bg" className="spinner" />
      </div>
    );
  }

  if (icons.length === 0) {
    return (
      <div className="grid-state">
        <Icon icon="ph:magnifying-glass-duotone" />
        <p>{emptyHint ?? "No icons found"}</p>
      </div>
    );
  }

  const iconPx = Math.round(gridSize * 0.4);

  return (
    <div className="grid-wrap">
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${gridSize}px, 1fr))` }}
      >
        {icons.map((name) => (
          <button
            key={name}
            className={`cell ${selected === name ? "selected" : ""}`}
            onClick={() => onSelect(name)}
            title={name}
          >
            <Icon icon={name} width={iconPx} height={iconPx} />
          </button>
        ))}
      </div>

      {icons.length < total && (
        <div className="grid-footer">
          <span>
            Showing {icons.length.toLocaleString()} of {total.toLocaleString()}
          </span>
          {onLoadMore && (
            <button className="ghost-btn wide" onClick={onLoadMore}>
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
}
