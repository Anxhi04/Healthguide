import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

import serviceAccount from "../../credentials/firebase-admin.json";

console.log("PROJECT:", serviceAccount.project_id);
console.log("CLIENT:", serviceAccount.client_email);
console.log("KEY ID:", serviceAccount.private_key_id);

const firebaseApp =
  getApps().length === 0
    ? initializeApp({
        credential: cert(serviceAccount as any),
      })
    : getApps()[0];

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

export { db, auth };
export const profileBucket = getStorage(firebaseApp).bucket(
  process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.firebasestorage.app`
);
