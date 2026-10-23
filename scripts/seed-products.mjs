// Adds a few sample watches so the storefront has something to show while you test.
// They have no photos (the site draws a watch instead) and are tagged sample: true.
// Delete them from the manager dashboard before launch.
// Usage: npm run seed
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./admin.mjs";

const SAMPLES = [
  { name: "Obsidian Gold", category: "dress", price: 1680, stock: 6, movement: "Automatic", strap: "Steel bracelet", caseSize: 41, waterResistance: "50m", featured: true },
  { name: "Sentinel Chrono", category: "chronograph", price: 1250, stock: 2, movement: "Automatic", strap: "Leather", caseSize: 42, waterResistance: "100m" },
  { name: "Meridian GMT", category: "travel", price: 1890, stock: 5, movement: "Automatic", strap: "Steel bracelet", caseSize: 40, waterResistance: "100m" },
  { name: "Vanguard Diver", category: "diver", price: 980, stock: 1, movement: "Automatic", strap: "Rubber", caseSize: 43, waterResistance: "300m" },
  { name: "Regent Dress", category: "dress", price: 1420, stock: 8, movement: "Manual wind", strap: "Leather", caseSize: 39, waterResistance: "30m" },
  { name: "Ironclad Field", category: "field", price: 640, stock: 12, movement: "Quartz", strap: "Canvas", caseSize: 40, waterResistance: "100m" },
];

const batch = db.batch();
for (const s of SAMPLES) {
  batch.set(db.collection("products").doc(), {
    ...s,
    crystal: "Sapphire",
    description: `${s.name} — a ${s.caseSize}mm ${s.movement.toLowerCase()} ${s.category} watch. Sample listing: replace with your own photos and copy.`,
    images: [],
    sold: 0,
    status: "live",
    featured: Boolean(s.featured),
    sample: true,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}
await batch.commit();
console.log(`Added ${SAMPLES.length} sample products.`);
