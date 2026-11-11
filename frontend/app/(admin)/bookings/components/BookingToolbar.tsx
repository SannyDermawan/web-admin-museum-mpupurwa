import type { FilterStatus } from "./types";

const FILTERS: [FilterStatus, string][] = [
  ["semua", "Semua"],
  ["pending", "Menunggu"],
  ["confirmed", "Dikonfirmasi"],
  ["rejected", "Ditolak"],
];

type BookingToolbarProps = {
  filter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
  counts: Record<FilterStatus, number>;
  search: string;
  onSearchChange: (value: string) => void;
};

/** Section: status tabs on the left, search box on the right. */
export function BookingToolbar({ filter, onFilterChange, counts, search, onSearchChange }: BookingToolbarProps) {
  return (
    <div className="toolbar">
      <div className="tabs" role="tablist" aria-label="Filter status booking">
        {FILTERS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={filter === value}
            className={`tab ${filter === value ? "active" : ""}`}
            onClick={() => onFilterChange(value)}
          >
            {label}
            <span className="tab-count">{counts[value]}</span>
          </button>
        ))}
      </div>

      <label className="search-box">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
        <input
          type="search"
          placeholder="Cari instansi atau penanggung jawab..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>
    </div>
  );
}
