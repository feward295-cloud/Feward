// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAdGOiPAndjtUrlBjfMKjYvLqaZ9rt5CDg",
  authDomain: "feward-76c09.firebaseapp.com",
  projectId: "feward-76c09",
  storageBucket: "feward-76c09.firebasestorage.app",
  messagingSenderId: "894551529051",
  appId: "1:894551529051:web:8416a68aba96b7e76e117e",
  measurementId: "G-XNGEYR4SZV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);