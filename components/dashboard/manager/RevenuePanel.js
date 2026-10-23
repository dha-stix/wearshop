"use client";

import { formatMoney } from "@/lib/config";
import { niceMax, RANGES } from "./revenue";

// Single-series bar chart of revenue per day or month. Latest bucket is highlighted in gold.
export default function RevenuePanel({ series, range, setRange }) {
  const top = niceMax(Math.max(...series.map((b) => b.value)));
  const total = series.reduce((sum, b) => sum + b.value, 0);

  return (
    <section id="revenue" className="panel" aria-label="Revenue sold">
      <div className="panel__head">
        <div>
          <h2 className="title-sm">Revenue sold</h2>
          <p className="muted" style={{ fontSize: 15, marginTop: 4 }}>
            Confirmed Bachs payments by {RANGES[range].unit} · {formatMoney(total)} in total
          </p>
        </div>
        <div className="segmented" role="group" aria-label="Time range">
          {Object.keys(RANGES).map((id) => (
            <button key={id} type="button" aria-pressed={range === id} onClick={() => setRange(id)}>
              {id}
            </button>
          ))}
        </div>
      </div>
      <div className="panel__body">
        <div className="bars" role="list" aria-label={`Revenue, ${RANGES[range].label.toLowerCase()}`}>
          <span className="bars__grid bars__grid--top" aria-hidden="true">
            {formatMoney(top)}
          </span>
          <span className="bars__grid bars__grid--mid" aria-hidden="true">
            {formatMoney(top / 2)}
          </span>
          {series.map((b, i) => {
            const pct = b.value ? Math.max((b.value / top) * 100, 1.5) : 0;
            const last = i === series.length - 1;
            return (
              <div key={`${range}-${b.fullLabel}`} className="bars__col" role="listitem" tabIndex={0} aria-label={`${b.fullLabel}: ${formatMoney(b.value)}, ${b.units} sold`}>
                <span className="bars__tip" style={{ bottom: `calc(${pct}% + 10px)` }}>
                  {b.fullLabel}
                  <br />
                  <strong>{formatMoney(b.value)}</strong> · {b.units} sold
                </span>
                {last && b.value > 0 && (
                  <span className="bars__value" style={{ bottom: `calc(${pct}% + 6px)` }}>
                    {formatMoney(b.value)}
                  </span>
                )}
                <span className={`bars__bar ${last ? "bars__bar--current" : ""}`} style={{ height: `${pct}%`, animationDelay: `${i * 0.04}s` }} />
              </div>
            );
          })}
        </div>
        <div className="bars__labels" aria-hidden="true">
          {series.map((b) => (
            <span key={b.fullLabel}>{b.label}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
