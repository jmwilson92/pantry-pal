import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);

export default app;