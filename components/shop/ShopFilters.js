"use client";

import Icon from "@/components/ui/Icon";

function toggle(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function CheckGroup({ legend, options, selected, onToggle }) {
  return (
    <fieldset className="filter-group">
      <legend className="label">{legend}</legend>
      {options.map((opt) => (
        <label key={opt} className="checkbox">
          <input type="checkbox" checked={selected.includes(opt)} onChange={() => onToggle(opt)} />
          {opt}
        </label>
      ))}
    </fieldset>
  );
}

// Sidebar on desktop, slide-over sheet on phones.
export default function ShopFilters({ filters, setFilters, reset, priceCeiling, movements, straps, open, setOpen, formatMoney }) {
  const update = (patch) => setFilters((f) => ({ ...f, ...patch }));
  const max = filters.maxPrice ?? priceCeiling;

  return (
    <aside className={`shop-filters ${open ? "shop-filters--open" : ""}`} aria-label="Filters">
      <div className="shop-filters__head">
        <h2 className="title-sm">Filter</h2>
        <div className="row row--center" style={{ gap: 4 }}>
          <button type="button" className="link-btn" onClick={reset}>
            Clear
          </button>
          <button type="button" className="icon-btn shop-filters__close" aria-label="Close filters" onClick={() => setOpen(false)}>
            <Icon name="close" />
          </button>
        </div>
      </div>

      <label className="field">
        <span className="field__label">Search</span>
        <input
          className="input"
          type="search"
          placeholder="Diver, gold, chronograph"
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
        />
      </label>

      {priceCeiling > 0 && (
        <fieldset className="filter-group">
          <legend className="label">Price</legend>
          <input
            className="range"
            type="range"
            min="0"
            max={priceCeiling}
            step="10"
            value={max}
            aria-label="Maximum price"
            onChange={(e) => update({ maxPrice: Number(e.target.value) })}
          />
          <div className="row row--between mono" style={{ fontSize: 13 }}>
            <span>{formatMoney(0)}</span>
            <span className="price">Up to {formatMoney(max)}</span>
          </div>
        </fieldset>
      )}

      <CheckGroup legend="Movement" options={movements} selected={filters.movements} onToggle={(v) => update({ movements: toggle(filters.movements, v) })} />
      <CheckGroup legend="Strap" options={straps} selected={filters.straps} onToggle={(v) => update({ straps: toggle(filters.straps, v) })} />

      <fieldset className="filter-group">
        <legend className="label">Availability</legend>
        <label className="checkbox">
          <input type="checkbox" checked={filters.inStock} onChange={(e) => update({ inStock: e.target.checked })} />
          In stock only
        </label>
      </fieldset>

      <button type="button" className="btn btn--dark btn--block shop-filters__apply" onClick={() => setOpen(false)}>
        Show watches
      </button>
    </aside>
  );
}
