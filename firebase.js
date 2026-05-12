import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyADKICwgI8JAttaujYp-M8fveOqJ6qYLHk",
  authDomain: "pantry-pal-72282.firebaseapp.com",
  projectId: "pantry-pal-72282",
  storageBucket: "pantry-pal-72282.firebasestorage.app",
  messagingSenderId: "258911350497",
  appId: "1:258911350497:web:e4048447406d1b383191a0",
  measurementId: "G-QDQXLWSQ78"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;