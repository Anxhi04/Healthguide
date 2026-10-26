import { CollectionReference } from "firebase-admin/firestore";
import { db } from "./config/firebase";

async function testFirestore() {
  try {
    const collections = await db.listCollections();

    console.log("✅ Connected to Firestore!");

    console.log(
      collections.map((collection: CollectionReference) => collection.id)
    );
  } catch (error) {
    console.error(error);
  }
}

testFirestore();