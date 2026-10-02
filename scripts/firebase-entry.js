// Firebase istemci SDK'sının uygulamaya gömülen alt kümesi (npm run vendor → public/vendor/firebase.js).
// public/fb.js yalnız buradan import eder; CDN'e (gstatic) bağımlılık yok → mobil uygulama çevrimdışı da açılır.
export { initializeApp } from "firebase/app";
export {
  getAuth, onAuthStateChanged, signInAnonymously, signOut,
  GoogleAuthProvider, OAuthProvider, EmailAuthProvider,
  signInWithPopup, signInWithRedirect, linkWithPopup, linkWithRedirect, getRedirectResult,
  signInWithCredential, linkWithCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  sendPasswordResetEmail, sendEmailVerification, updateProfile,
} from "firebase/auth";
export {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, collection, onSnapshot, writeBatch, serverTimestamp, deleteField,
} from "firebase/firestore";
