// Every read and write the browser makes against Firebase goes through this file.
// Firestore and Storage security rules (firestore.rules, storage.rules) enforce who may do what;
// anything that involves money (creating an order, confirming payment) runs on the server in /app/api.
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { auth, db, googleProvider, isFirebaseConfigured, storage } from "./firebase";
import { getStatus, MAX_IMAGE_MB, MAX_IMAGES_PER_PRODUCT } from "./config";

function requireFirebase() {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase isn't connected yet. Add your keys to .env.local.");
  }
}

const withId = (snap) => ({ id: snap.id, ...snap.data() });

// Wraps onSnapshot so callers get plain objects and a single error callback.
function listen(target, onData, onError, single = false) {
  if (!isFirebaseConfigured) {
    onData(single ? null : []);
    return () => {};
  }
  return onSnapshot(
    target,
    (snap) => onData(single ? (snap.exists() ? withId(snap) : null) : snap.docs.map(withId)),
    (err) => {
      console.error(err);
      onError?.(err);
    }
  );
}

/* ================================ Auth ================================ */

export function onAuthChange(callback) {
  if (!isFirebaseConfigured) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// Google is the only sign-in method; first sign-in creates the profile with the customer role.
export async function signInWithGoogle() {
  requireFirebase();
  const { user } = await signInWithPopup(auth, googleProvider);
  await ensureUserProfile(user);
  return user;
}

export async function signOutUser() {
  if (auth) await signOut(auth);
}

async function ensureUserProfile(user) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  const profile = {
    name: user.displayName || "",
    email: user.email || "",
    photoURL: user.photoURL || "",
    lastLoginAt: serverTimestamp(),
  };
  if (snap.exists()) {
    await updateDoc(userRef, profile);
  } else {
    // role is fixed to "customer" by the rules; promote managers in the Firebase console.
    await setDoc(userRef, { ...profile, role: "customer", createdAt: serverTimestamp() });
  }
}

export function subscribeToUserProfile(uid, onData, onError) {
  return listen(doc(db, "users", uid), onData, onError, true);
}

export async function saveShippingDetails(uid, shipping) {
  requireFirebase();
  await updateDoc(doc(db, "users", uid), { shipping, updatedAt: serverTimestamp() });
}

// ID token sent to our API routes so the server knows who is calling.
async function authHeaders() {
  const user = auth?.currentUser;
  if (!user) throw new Error("Sign in to continue.");
  return { Authorization: `Bearer ${await user.getIdToken()}`, "Content-Type": "application/json" };
}

/* ============================== Products ============================== */

export function subscribeToProducts(onData, onError, { includeDrafts = false } = {}) {
  if (!isFirebaseConfigured) return listen(null, onData);
  const base = collection(db, "products");
  const q = includeDrafts
    ? query(base, orderBy("createdAt", "desc"))
    : query(base, where("status", "==", "live"), orderBy("createdAt", "desc"));
  return listen(q, onData, onError);
}

export function subscribeToProduct(id, onData, onError) {
  if (!isFirebaseConfigured) return listen(null, onData, onError, true);
  return listen(doc(db, "products", id), onData, onError, true);
}

export async function getProductsByIds(ids) {
  requireFirebase();
  const snaps = await Promise.all(ids.map((id) => getDoc(doc(db, "products", id))));
  return snaps.filter((s) => s.exists()).map(withId);
}

function validateImages(files) {
  if (files.length > MAX_IMAGES_PER_PRODUCT) {
    throw new Error(`Upload up to ${MAX_IMAGES_PER_PRODUCT} images per product.`);
  }
  for (const file of files) {
    if (!file.type.startsWith("image/")) throw new Error(`${file.name} isn't an image.`);
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) throw new Error(`${file.name} is larger than ${MAX_IMAGE_MB}MB.`);
  }
}

// Uploads several images in parallel. onProgress(index, percent) fires per file.
export async function uploadProductImages(productId, files, onProgress) {
  requireFirebase();
  validateImages(files);
  return Promise.all(
    files.map(
      (file, index) =>
        new Promise((resolve, reject) => {
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          const path = `products/${productId}/${Date.now()}-${index}-${safeName}`;
          const task = uploadBytesResumable(ref(storage, path), file, { contentType: file.type });
          task.on(
            "state_changed",
            (s) => onProgress?.(index, Math.round((s.bytesTransferred / s.totalBytes) * 100)),
            reject,
            async () => resolve({ url: await getDownloadURL(task.snapshot.ref), path })
          );
        })
    )
  );
}

function cleanProduct(data) {
  return {
    name: data.name.trim(),
    price: Number(data.price),
    stock: Math.max(0, Math.floor(Number(data.stock) || 0)),
    category: data.category,
    description: data.description.trim(),
    movement: data.movement || "",
    strap: data.strap || "",
    caseSize: data.caseSize ? Number(data.caseSize) : null,
    waterResistance: data.waterResistance || "",
    crystal: data.crystal || "",
    featured: Boolean(data.featured),
    status: data.status === "draft" ? "draft" : "live",
  };
}

// Creates the product first so the images can be stored under its id.
export async function createProduct(data, files = [], onProgress) {
  requireFirebase();
  validateImages(files);
  const productRef = await addDoc(collection(db, "products"), {
    ...cleanProduct(data),
    images: [],
    sold: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  if (files.length) {
    const images = await uploadProductImages(productRef.id, files, onProgress);
    await updateDoc(productRef, { images });
  }
  return productRef.id;
}

export async function updateProduct(id, data, newFiles = [], keptImages, onProgress) {
  requireFirebase();
  const update = { ...cleanProduct(data), updatedAt: serverTimestamp() };
  if (keptImages) update.images = keptImages;
  if (newFiles.length) {
    const uploaded = await uploadProductImages(id, newFiles, onProgress);
    update.images = [...(keptImages || []), ...uploaded];
  }
  await updateDoc(doc(db, "products", id), update);
}

export async function restockProduct(id, amount) {
  requireFirebase();
  await updateDoc(doc(db, "products", id), { stock: increment(Math.floor(amount)), updatedAt: serverTimestamp() });
}

export async function deleteProduct(product) {
  requireFirebase();
  await Promise.all((product.images || []).map((img) => deleteObject(ref(storage, img.path)).catch(() => {})));
  await deleteDoc(doc(db, "products", product.id));
}

export async function deleteProductImage(image) {
  requireFirebase();
  await deleteObject(ref(storage, image.path)).catch(() => {});
}

/* ================================ Cart ================================ */
// The cart lives in localStorage for guests and is mirrored to carts/{uid} once signed in.

export async function loadSavedCart(uid) {
  if (!isFirebaseConfigured) return [];
  const snap = await getDoc(doc(db, "carts", uid));
  return snap.exists() ? snap.data().items || [] : [];
}

export async function saveCart(uid, items) {
  if (!isFirebaseConfigured) return;
  const slim = items.map(({ productId, quantity }) => ({ productId, quantity }));
  await setDoc(doc(db, "carts", uid), { items: slim, updatedAt: serverTimestamp() });
}

/* =============================== Checkout =============================== */

// Server prices the cart, creates the order and a Bachs checkout session, and returns its URL.
export async function startCheckout(items, shipping) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({
      items: items.map(({ productId, quantity }) => ({ productId, quantity })),
      shipping,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Checkout couldn't start. Try again.");
  return body; // { orderId, checkoutUrl }
}

// Called on the success page: asks the server to confirm the payment with Bachs.
export async function confirmCheckout(orderId) {
  const res = await fetch(`/api/checkout/verify?orderId=${encodeURIComponent(orderId)}`, {
    headers: await authHeaders(),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "We couldn't confirm the payment yet.");
  return body; // { status }
}

/* ================================ Orders ================================ */

export function subscribeToMyOrders(uid, onData, onError) {
  if (!isFirebaseConfigured) return listen(null, onData);
  return listen(
    query(collection(db, "orders"), where("userId", "==", uid), orderBy("createdAt", "desc")),
    onData,
    onError
  );
}

export function subscribeToOrder(id, onData, onError) {
  if (!isFirebaseConfigured) return listen(null, onData, onError, true);
  return listen(doc(db, "orders", id), onData, onError, true);
}

// Manager only (enforced by rules).
export function subscribeToAllOrders(onData, onError) {
  if (!isFirebaseConfigured) return listen(null, onData);
  return listen(query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(500)), onData, onError);
}

// Manager posts an update: the order changes and the customer gets a notification in one batch.
export async function updateOrderStatus(order, statusId, message) {
  requireFirebase();
  const status = getStatus(statusId);
  const note = (message || status.note).trim();
  const batch = writeBatch(db);
  batch.update(doc(db, "orders", order.id), {
    status: statusId,
    timeline: arrayUnion({ status: statusId, note, at: Timestamp.now() }),
    updatedAt: serverTimestamp(),
  });
  batch.set(doc(collection(db, "notifications")), {
    userId: order.userId,
    orderId: order.id,
    orderNumber: order.number || order.id,
    title: `Order ${order.number || order.id} updated: ${status.label}`,
    body: note,
    read: false,
    createdAt: serverTimestamp(),
  });
  await batch.commit();
}

/* ============================ Notifications ============================ */

export function subscribeToNotifications(uid, onData, onError) {
  if (!isFirebaseConfigured) return listen(null, onData);
  return listen(
    query(collection(db, "notifications"), where("userId", "==", uid), orderBy("createdAt", "desc"), limit(40)),
    onData,
    onError
  );
}

export async function markNotificationsRead(ids) {
  requireFirebase();
  if (!ids.length) return;
  const batch = writeBatch(db);
  ids.forEach((id) => batch.update(doc(db, "notifications", id), { read: true }));
  await batch.commit();
}
