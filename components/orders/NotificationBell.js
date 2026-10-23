"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/components/providers/AuthProvider";
import { markNotificationsRead } from "@/lib/firebase-actions";
import { useNotifications } from "@/lib/hooks";
import { formatDate } from "@/lib/config";

// Bell with an unread count; clicking it opens the customer's order notifications.
// Picking one marks it read and opens that order's tracker on the dashboard.
export default function NotificationBell({ boxed = false }) {
  const { user } = useAuth();
  const router = useRouter();
  const { data: notes } = useNotifications(user?.uid || null);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const unread = notes.filter((n) => !n.read);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !rootRef.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  const openNote = (note) => {
    if (!note.read) markNotificationsRead([note.id]).catch(() => {});
    setOpen(false);
    router.push(`/dashboard/orders/${encodeURIComponent(note.orderId)}`);
  };

  return (
    <div className="bell" ref={rootRef}>
      <button
        type="button"
        className={`icon-btn ${boxed ? "icon-btn--boxed bell__btn--boxed" : ""}`}
        aria-label={`Notifications${unread.length ? `, ${unread.length} unread` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={unread.length ? "bell__icon bell__icon--ring" : "bell__icon"}>
          <Icon name="bell" size={boxed ? 22 : 20} />
        </span>
        {unread.length > 0 && <span className="count-dot">{unread.length}</span>}
      </button>

      {open && (
        <div className="bell__panel" role="dialog" aria-label="Notifications">
          <div className="bell__head">
            <span className="title-sm">Notifications</span>
            {unread.length > 0 && (
              <button type="button" className="link-btn" onClick={() => markNotificationsRead(unread.map((n) => n.id))}>
                Mark all read
              </button>
            )}
          </div>
          {notes.length === 0 ? (
            <p className="bell__empty">Updates about your orders will appear here.</p>
          ) : (
            <ul className="notes bell__list">
              {notes.map((n, i) => (
                <li key={n.id} className={`note ${n.read ? "" : "note--unread"}`} style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` }}>
                  <span className="note__icon">
                    <Icon name="truck" size={16} strokeWidth={2} />
                  </span>
                  <div className="note__body">
                    <button type="button" className="note__title" onClick={() => openNote(n)}>
                      {n.title}
                    </button>
                    {n.body && <p>{n.body}</p>}
                    <span className="note__time">{formatDate(n.createdAt, true)}</span>
                  </div>
                  {!n.read && <span className="note__dot" aria-label="Unread" />}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
