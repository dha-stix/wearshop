"use client";

import { useEffect, useState } from "react";

// Shows a list `pageSize` items at a time. Changing `resetKey` (e.g. the active filters) starts over.
export function usePaged(list, pageSize = 20, resetKey = "") {
  const [shown, setShown] = useState(pageSize);
  useEffect(() => setShown(pageSize), [resetKey, pageSize]);
  return {
    page: list.slice(0, shown),
    shown: Math.min(shown, list.length),
    total: list.length,
    step: Math.min(pageSize, list.length - shown),
    more: () => setShown((n) => n + pageSize),
  };
}

// "Showing 20 of 90" + progress line + "Load 20 more" button.
export default function LoadMore({ paged, noun = "items" }) {
  if (!paged.total) return null;
  return (
    <div className="load-more">
      <span className="label">
        Showing {paged.shown} of {paged.total} {noun}
      </span>
      <div className="load-more__bar" aria-hidden="true">
        <span style={{ width: `${(paged.shown / paged.total) * 100}%` }} />
      </div>
      {paged.step > 0 && (
        <button type="button" className="btn btn--outline" onClick={paged.more}>
          Load {paged.step} more
        </button>
      )}
    </div>
  );
}
