// Gives an existing account the manager role.
// The person must have signed in to the site once with Google first.
// Usage: npm run make-manager -- someone@gmail.com
import { auth, db } from "./admin.mjs";

const email = process.argv[2];
if (!email) {
  console.error("Usage: npm run make-manager -- <email>");
  process.exit(1);
}

try {
  const user = await auth.getUserByEmail(email);
  await db.collection("users").doc(user.uid).set({ role: "manager" }, { merge: true });
  console.log(`${email} is now a manager. Reload /dashboard to see the manager view.`);
} catch (err) {
  console.error(err.code === "auth/user-not-found" ? `${email} hasn't signed in to WearShop yet.` : err.message);
  process.exit(1);
}
