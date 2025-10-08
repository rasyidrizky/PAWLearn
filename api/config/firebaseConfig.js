import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCQaTgDfU8aOklhLNZxu0jfAGQYkpjbz3Q",
    authDomain: "pawlearn.firebaseapp.com",
    projectId: "pawlearn",
    storageBucket: "pawlearn.firebasestorage.app",
    messagingSenderId: "775306104507",
    appId: "1:775306104507:web:dc23fe6e1c6e1cc683a39e",
    measurementId: "G-279Y771B0X"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export { app, auth, db };