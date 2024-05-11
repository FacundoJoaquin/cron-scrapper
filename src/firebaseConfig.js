const firebase = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDHo5Le9OtF7fvT7rVBudpal5_rKSuKRCA",
  authDomain: "just-look-25f68.firebaseapp.com",
  projectId: "just-look-25f68",
  storageBucket: "just-look-25f68.appspot.com",
  messagingSenderId: "188876559020",
  appId: "1:188876559020:web:59fdcc6d231cbbfd7a0509"
};

firebase.initializeApp(firebaseConfig);
const db = getFirestore();

module.exports = {
  db
};