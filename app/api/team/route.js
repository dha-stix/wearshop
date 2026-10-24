import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb, getRequestUser } from "@/lib/server/firebase-admin";
import { errorResponse } from "@/lib/server/respond";

const ROLES = ["manager", "staff", "customer"];

// POST /api/team { email, role: "manager" | "staff" | "customer" }
// Lets a manager give someone a store role or take it away. Roles can only change here,
// because the Firestore rules stop the browser from editing anyone's role.
export async function POST(request) {
  const caller = await getRequestUser(request);
  if (!caller) return Response.json({ error: "Sign in to continue." }, { status: 401 });

  try {
    const db = adminDb();
    const callerDoc = await db.collection("users").doc(caller.uid).get();
    if (callerDoc.data()?.role !== "manager") {
      return Response.json({ error: "Only managers can change roles." }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    const role = ROLES.includes(body.role) ? body.role : null;
    if (!email || !role) return Response.json({ error: "Enter an email address and a role." }, { status: 400 });

    let target;
    try {
      target = await adminAuth().getUserByEmail(email);
    } catch {
      return Response.json(
        { error: `${email} hasn't signed in to WearShop yet. Ask them to sign in with Google once, then try again.` },
        { status: 404 }
      );
    }
    if (target.uid === caller.uid && role !== "manager") {
      return Response.json({ error: "You can't change your own role. Ask another manager to do it." }, { status: 400 });
    }

    const ref = db.collection("users").doc(target.uid);
    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const current = snap.data()?.role || "customer";
      if (current === role) return "unchanged";
      if (current === "manager") {
        const managers = await tx.get(db.collection("users").where("role", "==", "manager"));
        if (managers.size <= 1) throw Object.assign(new Error("The store needs at least one manager."), { status: 400 });
      }
      tx.set(
        ref,
        {
          role,
          ...(snap.exists ? {} : { name: target.displayName || "", email: target.email, photoURL: target.photoURL || "", createdAt: FieldValue.serverTimestamp() }),
          roleUpdatedBy: caller.email || caller.uid,
          roleUpdatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      return "updated";
    });

    return Response.json({ ok: true, result, role, name: target.displayName || email });
  } catch (err) {
    if (err.status === 400) return Response.json({ error: err.message }, { status: 400 });
    return errorResponse(err, "Couldn't update the role. Try again.");
  }
}
