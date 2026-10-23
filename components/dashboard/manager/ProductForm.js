"use client";

/* eslint-disable @next/next/no-img-element -- local blob previews can't go through next/image */
import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { useToast } from "@/components/providers/ToastProvider";
import { createProduct, deleteProductImage, updateProduct } from "@/lib/firebase-actions";
import { CATEGORIES, MAX_IMAGE_MB, MAX_IMAGES_PER_PRODUCT, MOVEMENTS, STRAPS } from "@/lib/config";

const BLANK = {
  name: "",
  price: "",
  stock: "",
  category: CATEGORIES[0].id,
  movement: MOVEMENTS[0],
  strap: STRAPS[0],
  caseSize: "",
  waterResistance: "",
  crystal: "Sapphire",
  description: "",
  featured: false,
  status: "live",
};

function fromProduct(p) {
  return Object.fromEntries(Object.keys(BLANK).map((k) => [k, p[k] ?? BLANK[k] ?? ""]));
}

function validate(form, imageCount) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Enter a product name";
  if (!(Number(form.price) > 0)) errors.price = "Enter a price above 0";
  if (form.stock === "" || Number(form.stock) < 0) errors.stock = "Enter how many are in stock";
  if (!form.description.trim()) errors.description = "Write a short description";
  if (imageCount > MAX_IMAGES_PER_PRODUCT) errors.images = `Use up to ${MAX_IMAGES_PER_PRODUCT} images`;
  return errors;
}

function Field({ label, error, children, wide }) {
  return (
    <label className="field" style={wide ? { gridColumn: "1 / -1" } : undefined}>
      <span className="field__label">{label}</span>
      {children}
      {error && <span className="field__error">{error}</span>}
    </label>
  );
}

// Add or edit a product. Several images can be dropped at once; the first one is the cover.
export default function ProductForm({ editing, onDone }) {
  const toast = useToast();
  const inputRef = useRef(null);
  const [form, setForm] = useState(BLANK);
  const [kept, setKept] = useState([]); // images already in Storage
  const [removed, setRemoved] = useState([]);
  const [files, setFiles] = useState([]); // [{ file, preview }]
  const [progress, setProgress] = useState({});
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Free blob previews when the form unmounts.
  const filesRef = useRef(files);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);
  useEffect(() => () => filesRef.current.forEach((f) => URL.revokeObjectURL(f.preview)), []);

  const load = (product) => {
    filesRef.current.forEach((f) => URL.revokeObjectURL(f.preview));
    setForm(product ? fromProduct(product) : BLANK);
    setKept(product?.images || []);
    setRemoved([]);
    setFiles([]);
    setErrors({});
    setProgress({});
  };

  useEffect(() => {
    load(editing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const set = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((errs) => ({ ...errs, [key]: undefined }));
  };

  const addFiles = (list) => {
    const incoming = [...list].filter((f) => f.type.startsWith("image/"));
    const tooBig = incoming.filter((f) => f.size > MAX_IMAGE_MB * 1024 * 1024);
    if (tooBig.length) toast(`${tooBig.map((f) => f.name).join(", ")} is over ${MAX_IMAGE_MB}MB`, "error");
    const ok = incoming.filter((f) => f.size <= MAX_IMAGE_MB * 1024 * 1024);
    setFiles((cur) => [...cur, ...ok.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
    setErrors((errs) => ({ ...errs, images: undefined }));
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  // Combined, ordered list of existing and new images so the manager can pick the cover.
  const gallery = [...kept.map((img) => ({ kind: "kept", img, src: img.url })), ...files.map((f) => ({ kind: "new", f, src: f.preview }))];

  const removeAt = (i) => {
    const item = gallery[i];
    if (item.kind === "kept") {
      setKept((k) => k.filter((img) => img !== item.img));
      setRemoved((r) => [...r, item.img]);
    } else {
      URL.revokeObjectURL(item.f.preview);
      setFiles((fs) => fs.filter((f) => f !== item.f));
    }
  };

  const makeCover = (i) => {
    const item = gallery[i];
    if (item.kind === "kept") setKept((k) => [item.img, ...k.filter((img) => img !== item.img)]);
    else if (!kept.length) setFiles((fs) => [item.f, ...fs.filter((f) => f !== item.f)]);
    else toast("Save first, then set an uploaded image as the cover", "error");
  };

  const reset = () => {
    load(null);
    onDone();
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(form, gallery.length);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    const onProgress = (i, pct) => setProgress((p) => ({ ...p, [i]: pct }));
    try {
      const newFiles = files.map((f) => f.file);
      if (editing) {
        await updateProduct(editing.id, form, newFiles, kept, onProgress);
        await Promise.all(removed.map(deleteProductImage));
        toast(`${form.name} updated`);
      } else {
        await createProduct(form, newFiles, onProgress);
        toast(`${form.name} is now ${form.status === "draft" ? "saved as a draft" : "live in the shop"}`);
      }
      reset();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="products" className="panel" aria-label={editing ? "Edit product" : "Add a product"}>
      <div className="panel__head">
        <div>
          <h2 className="title-sm">{editing ? `Edit ${editing.name}` : "Add a product"}</h2>
          <p className="muted" style={{ fontSize: 15, marginTop: 4 }}>
            Upload every angle at once. The first image becomes the cover.
          </p>
        </div>
        {editing && (
          <button type="button" className="btn btn--outline btn--sm" onClick={reset}>
            Cancel edit
          </button>
        )}
      </div>
      <form className="panel__body product-form" onSubmit={submit} noValidate>
        <div className="product-form__images">
          <button
            type="button"
            className={`dropzone ${dragging ? "dropzone--active" : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <Icon name="upload" size={40} strokeWidth={1.4} className="gold-icon" />
            <span className="dropzone__title">Drop images here</span>
            <span className="muted" style={{ fontSize: 14 }}>
              or click to choose several · JPG, PNG, WEBP · up to {MAX_IMAGES_PER_PRODUCT} images, {MAX_IMAGE_MB}MB each
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          {errors.images && <span className="field__error">{errors.images}</span>}
          {gallery.length > 0 && (
            <ul className="thumbs">
              {gallery.map((g, i) => {
                const pct = g.kind === "new" ? progress[files.indexOf(g.f)] : undefined;
                return (
                  <li key={g.src} className="thumb" style={{ animationDelay: `${i * 0.05}s` }}>
                    <img src={g.src} alt={`Product image ${i + 1}`} />
                    {i === 0 ? (
                      <span className="thumb__cover">Cover</span>
                    ) : (
                      <button type="button" className="thumb__make-cover" onClick={() => makeCover(i)}>
                        Make cover
                      </button>
                    )}
                    <button type="button" className="thumb__remove" aria-label={`Remove image ${i + 1}`} onClick={() => removeAt(i)} disabled={busy}>
                      <Icon name="close" size={14} strokeWidth={2.4} />
                    </button>
                    {busy && pct !== undefined && (
                      <span className="thumb__progress">
                        <span style={{ width: `${pct}%` }} />
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <p className="label">
            {gallery.length} {gallery.length === 1 ? "image" : "images"}
            {files.length ? ` · ${files.length} to upload` : ""}
          </p>
        </div>

        <div className="product-form__fields">
          <div className="form-grid">
            <Field label="Product name" error={errors.name} wide>
              <input className="input" value={form.name} onChange={set("name")} aria-invalid={Boolean(errors.name)} />
            </Field>
            <Field label="Price" error={errors.price}>
              <input className="input mono" type="number" min="0" step="0.01" inputMode="decimal" value={form.price} onChange={set("price")} aria-invalid={Boolean(errors.price)} />
            </Field>
            <Field label="Stock" error={errors.stock}>
              <input className="input mono" type="number" min="0" inputMode="numeric" value={form.stock} onChange={set("stock")} aria-invalid={Boolean(errors.stock)} />
            </Field>
            <Field label="Collection">
              <select className="select" value={form.category} onChange={set("category")}>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Movement">
              <select className="select" value={form.movement} onChange={set("movement")}>
                {MOVEMENTS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
            <Field label="Strap">
              <select className="select" value={form.strap} onChange={set("strap")}>
                {STRAPS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Case size (mm)">
              <input className="input mono" type="number" min="20" max="60" value={form.caseSize} onChange={set("caseSize")} />
            </Field>
            <Field label="Water resistance">
              <input className="input" placeholder="100m" value={form.waterResistance} onChange={set("waterResistance")} />
            </Field>
            <Field label="Crystal">
              <input className="input" value={form.crystal} onChange={set("crystal")} />
            </Field>
            <Field label="Description" error={errors.description} wide>
              <textarea className="textarea" rows={5} value={form.description} onChange={set("description")} aria-invalid={Boolean(errors.description)} />
            </Field>
          </div>
          <div className="row row--center" style={{ marginTop: 16, gap: 24 }}>
            <label className="checkbox">
              <input type="checkbox" checked={form.featured} onChange={set("featured")} />
              Feature on the homepage
            </label>
            <label className="checkbox">
              <input type="checkbox" checked={form.status === "draft"} onChange={(e) => setForm((f) => ({ ...f, status: e.target.checked ? "draft" : "live" }))} />
              Save as draft (hidden from the shop)
            </label>
          </div>
          <button type="submit" className="btn btn--dark btn--block" style={{ marginTop: 24 }} disabled={busy}>
            {busy ? (files.length ? "Uploading images…" : "Saving…") : editing ? "Save changes" : form.status === "draft" ? "Save draft" : "Publish product"}
          </button>
        </div>
      </form>
    </section>
  );
}
