// Loads the starter catalogue (lib/catalog-data.json + photos in images/products) into Firebase:
// uploads each photo to Storage and creates the product in Firestore.
// Safe to re-run: products are keyed by their catalogue id, so nothing is duplicated.
// Usage: npm run seed
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { db } from "./admin.mjs";

const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
if (!bucketName) {
  console.error("Missing NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET in .env.local.");
  process.exit(1);
}
const bucket = getStorage().bucket(bucketName);
const root = path.resolve(import.meta.dirname, "..");
const catalog = JSON.parse(await readFile(path.join(root, "lib/catalog-data.json"), "utf8"));

async function uploadImage(productId, file) {
  const destination = `products/${productId}/${file}`;
  const token = randomUUID();
  await bucket.upload(path.join(root, "images/products", file), {
    destination,
    metadata: {
      contentType: file.endsWith(".webp") ? "image/webp" : "image/jpeg",
      cacheControl: "public, max-age=31536000",
      metadata: { firebaseStorageDownloadToken: token },
    },
  });
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destination)}?alt=media&token=${token}`;
  return { url, path: destination };
}

const startedAt = Date.now();
let created = 0;
for (const [i, item] of catalog.entries()) {
  const ref = db.collection("products").doc(item.id);
  if ((await ref.get()).exists) continue;
  const images = [];
  for (const file of item.images) images.push(await uploadImage(item.id, file));
  const { images: _files, credit: _credit, ...fields } = item;
  await ref.set({
    ...fields,
    images,
    sold: 0,
    status: "live",
    // Keep the catalogue order: first item is the newest.
    createdAt: Timestamp.fromMillis(startedAt - i * 3600000),
    updatedAt: FieldValue.serverTimestamp(),
  });
  created++;
  process.stdout.write(`\r${i + 1}/${catalog.length} ${item.name.padEnd(40)}`);
}
console.log(`\nDone. Added ${created} products (${catalog.length - created} already existed).`);
