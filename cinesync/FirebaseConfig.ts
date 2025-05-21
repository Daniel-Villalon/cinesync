// Import the functions you need from the SDKs you need
//import { initializeApp } from "firebase/app";
//import { getAuth } from "firebase/auth";
//import { getFirestore } from "firebase/firestore"
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAIC_xtxg29a3N0E4W0bCpIf0Qxb70tgN8",
  authDomain: "cinesync115a.firebaseapp.com",
  projectId: "cinesync115a",
  storageBucket: "cinesync115a.firebasestorage.app",
  messagingSenderId: "259419561288",
  appId: "1:259419561288:web:d8d466acef90ef2a5b277d",
  measurementId: "G-21KM7BCF0L"
};

// Initialize Firebase
//export const FIREBASE_APP = initializeApp(firebaseConfig);
//export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
//export const FIRESTORE_DB = getFirestore(FIREBASE_APP)
// const analytics = getAnalytics(FIREBASE_APP);

export const FIREBASE_APP = initializeApp(firebaseConfig);

// Platform-specific auth initialization
export const FIREBASE_AUTH = (() => {
  if (Platform.OS === 'web') {
    // Web-specific initialization
    const { getAuth } = require('firebase/auth');
    return getAuth(FIREBASE_APP);
  } else {
    // Mobile-specific initialization with persistence
    const { initializeAuth, getReactNativePersistence } = require('firebase/auth');
    return initializeAuth(FIREBASE_APP, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  }
})();

export const FIRESTORE_DB = getFirestore(FIREBASE_APP);