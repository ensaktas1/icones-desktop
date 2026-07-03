import type { Variant } from "../lib/variants";

interface Props {
  variants: Variant[];
  active: string | null;
  onSelect: (token: string | null) => void;
}

export function VariantBar({ variants, active, onSelect }: Props) {
  if (variants.length === 0) return null;

  return (
    <div className="variant-bar">
      <span className="variant-label">Variants</span>
      <div className="variant-pills">
        <button
          className={`pill ${active === null ? "active" : ""}`}
          onClick={() => onSelect(null)}
        >
          All
        </button>
        {variants.map((v) => (
          <button
            key={v.token}
            className={`pill ${active === v.token ? "active" : ""}`}
            onClick={() => onSelect(v.token)}
            title={`${v.count.toLocaleString()} icons`}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}
