import 'firebase/auth';

import Firebase from 'firebase/app';

let firebaseConfig: any;
let firebaseConfigString: string;

if (process.env.REACT_APP_FIREBASE_CONFIG_OBJECT) {
    firebaseConfigString = process.env.REACT_APP_FIREBASE_CONFIG_OBJECT ?? '';
} else {
    firebaseConfigString = window._highlightFirebaseConfigString;
}

// NOTE: we use eval() here (rather than JSON.parse) because its more in-tune
// with the string presented to a developer in the firebase console.
// This value is passed at build time, so security concerns are put aside.
try {
    firebaseConfig = eval('(' + firebaseConfigString + ')');
} catch (_e) {
    const e = _e as Error;
    throw new Error('Error parsing incoming firebase config' + e.toString());
}

window._highlightFirebaseConfig = firebaseConfig;

Firebase.initializeApp(firebaseConfig);
export const googleProvider = new Firebase.auth.GoogleAuthProvider();
export const auth = Firebase.auth();
