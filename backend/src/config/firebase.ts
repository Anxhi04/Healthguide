import { initializeApp, cert, getApps } from "firebase-admin/app";
import { config } from "dotenv";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { verifyFirebaseClock } from "../utils/firebaseClock";

// Resolve from this module so dev, dist and scripts use the same backend/.env.
config({ path: resolve(__dirname, "../../.env"), quiet: true });

const environmentCredentials = [
  process.env.FIREBASE_PROJECT_ID,
  process.env.FIREBASE_CLIENT_EMAIL,
  process.env.FIREBASE_PRIVATE_KEY,
];
const usesEnvironment = environmentCredentials.some(value => Boolean(value?.trim()));
if (usesEnvironment && !environmentCredentials.every(value => Boolean(value?.trim()))) {
  throw new Error("Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY together, or omit all three to use credentials/firebase-admin.json.");
}
// Keep the existing local JSON fallback; never silently switch to ADC.
const serviceAccount = usesEnvironment
  ? {
      projectId: process.env.FIREBASE_PROJECT_ID!.trim(),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!.trim(),
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }
  : (() => {
      const account = JSON.parse(readFileSync(resolve(__dirname, "../../credentials/firebase-admin.json"), "utf8")) as {
        project_id: string; client_email: string; private_key: string;
      };
      return { projectId: account.project_id, clientEmail: account.client_email, privateKey: account.private_key };
    })();
const credential = cert(serviceAccount);
const projectId = serviceAccount.projectId;
const firebaseApp = getApps().length === 0
  ? initializeApp({ credential, projectId })
  : getApps()[0];

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

export { db, auth };
export const logFirebaseError = (operation: string, error: unknown) => {
  const details = error as { code?: unknown; message?: unknown } | null;
  // Do not log request headers, tokens, private keys or entire HTTP error objects.
  console.error(`[Firebase] ${operation}`, {
    projectId: firebaseApp.options.projectId,
    credentialSource: usesEnvironment ? "environment" : "service-account JSON",
    code: details?.code,
    message: typeof details?.message === "string" ? details.message : "Unknown Firebase error",
  });
};

export const verifyFirebaseConnection = async () => {
  try {
    try {
      await verifyFirebaseClock();
    } catch (error) {
      if ((error as { code?: string }).code === "FIREBASE_CLOCK_SKEW") throw error;
      // A diagnostic probe must not block a working OAuth/Firestore connection.
      console.warn("[Firebase] Clock probe unavailable; checking OAuth and Firestore directly.");
    }
    await firebaseApp.options.credential!.getAccessToken();
    // A read also checks Firestore credentials/access; initialization alone does not.
    await db.collection("users").limit(1).get();
    console.log("[Firebase] OAuth and Firestore connection verified", {
      projectId: firebaseApp.options.projectId,
      credentialSource: usesEnvironment ? "environment" : "service-account JSON",
      pid: process.pid,
    });
  } catch (error) {
    logFirebaseError("Startup connection check failed", error);
    throw error;
  }
};

