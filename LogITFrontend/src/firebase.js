import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDkQ6Ernb3Fz4P7PI6KRyUnCzX6MLB-Ovc",
  authDomain: "logit-9ff2c.firebaseapp.com",
  projectId: "logit-9ff2c",
  storageBucket: "logit-9ff2c.firebasestorage.app",
  messagingSenderId: "973491178961",
  appId: "1:973491178961:web:929fc299d7be2abed9a4f0",
  measurementId: "G-S75X7195ST",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = app;

