"use client";

import Image from "next/image";
import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { PageLoading } from "@/components/ui/States";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { setUserRole } from "@/lib/firebase-actions";
import { useTeam } from "@/lib/hooks";
import { formatDate } from "@/lib/config";
import { DashHeader } from "../DashboardShell";

const ROLES = {
  manager: {
    label: "Manager",
    summary: "Everything: products, stock, prices, revenue, orders and the team.",
  },
  staff: {
    label: "Staff",
    summary: "Views products and updates orders. Can't edit products, see revenue or manage the team.",
  },
};

// Managers give people a store role (manager or staff), change it, or remove it.
export default function TeamPage() {
  const { user } = useAuth();
  const toast = useToast();
  const { data: team, loading } = useTeam(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("staff");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null); // email currently being changed

  const managerCount = team.filter((m) => m.role === "manager").length;

  const change = async (person, nextRole) => {
    setBusy(person.email);
    try {
      const { result, name } = await setUserRole(person.email, nextRole);
      if (result === "unchanged") toast(`${name} is already ${nextRole === "customer" ? "a customer" : ROLES[nextRole].label.toLowerCase()}`);
      else if (nextRole === "customer") toast(`${name} no longer has store access`);
      else toast(`${name} is now ${nextRole === "manager" ? "a manager" : "staff"}`);
      return true;
    } catch (err) {
      toast(err.message, "error");
      return false;
    } finally {
      setBusy(null);
    }
  };

  const add = async (e) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(value)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setBusy(value);
    try {
      const { result, name } = await setUserRole(value, role);
      toast(result === "unchanged" ? `${name} already has that role` : `${name} is now ${role === "manager" ? "a manager" : "staff"}`);
      setEmail("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const remove = (person) => {
    if (!window.confirm(`Remove store access for ${person.name || person.email}? They'll keep their customer account.`)) return;
    change(person, "customer");
  };

  const sorted = [...team].sort((a, b) =>
    a.role === b.role ? (a.name || a.email).localeCompare(b.name || b.email) : a.role === "manager" ? -1 : 1
  );

  return (
    <>
      <DashHeader eyebrow="Store management" title="Team" />

      <div className="dash-cols">
        <section className="panel dash-cols__main" aria-label="Team members">
          <div className="panel__head">
            <h2 className="title-sm">People with store access</h2>
            <span className="label">
              {managerCount} manager{managerCount === 1 ? "" : "s"} · {team.length - managerCount} staff
            </span>
          </div>
          {loading ? (
            <PageLoading />
          ) : (
            <ul className="team">
              {sorted.map((m) => {
                const isMe = m.email === user.email;
                const lastManager = m.role === "manager" && managerCount <= 1;
                return (
                  <li key={m.id} className="team__row">
                    <span className="team__avatar">
                      {m.photoURL ? <Image src={m.photoURL} alt="" width={44} height={44} /> : <Icon name="user" size={18} />}
                    </span>
                    <span className="team__who">
                      <strong>
                        {m.name || m.email} {isMe && <span className="badge badge--muted">You</span>}
                      </strong>
                      <span className="muted">{m.email}</span>
                      {m.roleUpdatedBy && (
                        <span className="team__meta">
                          Set by {m.roleUpdatedBy}
                          {m.roleUpdatedAt ? ` · ${formatDate(m.roleUpdatedAt)}` : ""}
                        </span>
                      )}
                    </span>
                    {isMe ? (
                      <span className={`badge ${m.role === "manager" ? "badge--dark" : "badge--outline"}`}>{ROLES[m.role]?.label}</span>
                    ) : (
                      <span className="team__actions">
                        <label className="sr-only" htmlFor={`role-${m.id}`}>
                          Role for {m.name || m.email}
                        </label>
                        <select
                          id={`role-${m.id}`}
                          className="select team__role"
                          value={m.role}
                          disabled={busy === m.email || lastManager}
                          onChange={(e) => change(m, e.target.value)}
                        >
                          <option value="manager">Manager</option>
                          <option value="staff">Staff</option>
                        </select>
                        <button
                          type="button"
                          className="icon-btn icon-btn--boxed"
                          aria-label={`Remove store access for ${m.name || m.email}`}
                          onClick={() => remove(m)}
                          disabled={busy === m.email || lastManager}
                        >
                          <Icon name="trash" size={18} />
                        </button>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="dash-cols__side">
          <form className="panel panel__body team__form" onSubmit={add} noValidate>
            <h2 className="title-sm">Add someone</h2>
            <label className="field">
              <span className="field__label">Their Google email</span>
              <input
                className="input"
                type="email"
                autoComplete="off"
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "team-error" : "team-hint"}
              />
              {error ? (
                <span id="team-error" className="field__error" role="alert">
                  {error}
                </span>
              ) : (
                <span id="team-hint" className="field__hint">
                  They need to have signed in to WearShop with Google at least once.
                </span>
              )}
            </label>
            <fieldset className="team__roles">
              <legend className="field__label">Role</legend>
              {Object.entries(ROLES).map(([id, r]) => (
                <label key={id} className={`team__choice ${role === id ? "team__choice--on" : ""}`}>
                  <input type="radio" name="role" value={id} checked={role === id} onChange={() => setRole(id)} />
                  <span>
                    <strong>{r.label}</strong>
                    <span className="muted">{r.summary}</span>
                  </span>
                </label>
              ))}
            </fieldset>
            <button type="submit" className="btn btn--dark btn--block" disabled={Boolean(busy)}>
              <Icon name="plus" size={16} strokeWidth={2} />
              {busy && busy === email.trim() ? "Adding…" : `Add as ${ROLES[role].label.toLowerCase()}`}
            </button>
          </form>
        </aside>
      </div>
    </>
  );
}
