// Firebase istemci SDK'sının uygulamaya gömülen alt kümesi (npm run vendor → public/vendor/firebase.js).
// public/fb.js yalnız buradan import eder; CDN'e (gstatic) bağımlılık yok → mobil uygulama çevrimdışı da açılır.
// Giriş yalnız Apple / Google (+ misafir): web'de açılır pencere / yönlendirme, mobilde yerel giriş eklentisinin
// verdiği kimlik bilgisiyle signInWithCredential (initializeAuth + indexedDBLocalPersistence).
export { initializeApp } from "firebase/app";
export {
  getAuth, initializeAuth, indexedDBLocalPersistence, onAuthStateChanged, signInAnonymously, signOut,
  GoogleAuthProvider, OAuthProvider,
  signInWithPopup, signInWithRedirect, linkWithPopup, linkWithRedirect, getRedirectResult,
  signInWithCredential, linkWithCredential,
} from "firebase/auth";
export {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, collection, onSnapshot, writeBatch, serverTimestamp, deleteField,
} from "firebase/firestore";
