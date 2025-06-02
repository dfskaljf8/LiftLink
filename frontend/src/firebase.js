// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDNAsJ82uN4dOWBHrLnH5EcFS7axZ-eL_M",
  authDomain: "liftlink-9436d.firebaseapp.com",
  projectId: "liftlink-9436d",
  storageBucket: "liftlink-9436d.firebasestorage.app",
  messagingSenderId: "819789632091",
  appId: "1:819789632091:web:3c210c558bc7672c99a57e",
  measurementId: "G-26GNVX7DW2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, analytics };
export default app;