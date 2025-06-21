// firebaseConfig.js
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD38se392nxkMln8z5ecFfyD8GzX-7Ak9A",
  authDomain: "mealmatch-8749c.firebaseapp.com",
  projectId: "mealmatch-8749c",
  storageBucket: "mealmatch-8749c.firebasestorage.app",
  messagingSenderId: "321941546931",
  appId: "1:321941546931:web:2fc880050d6c3482934dc6",
  measurementId: "G-GQZ3JWK8F5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);