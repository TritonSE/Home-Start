import { FirebaseOptions, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

import env from "@/util/validateEnv";

if (!env.NEXT_PUBLIC_FIREBASE) {
  throw new Error("Cannot get Firebase settings");
}

const firebaseConfig: FirebaseOptions = env.NEXT_PUBLIC_FIREBASE as FirebaseOptions;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, auth, storage };
