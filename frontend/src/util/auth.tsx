import * as firebase from 'firebase/app';
import 'firebase/auth';

let firebaseConfig: any;

// NOTE: we use eval() here (rather than JSON.parse) because its more intune
// with the string presented to an developer in the firebase console.
// This value is passed at build time, so security concerns are put aside.
try {
    firebaseConfig = eval('(' + process.env.REACT_APP_FIREBASE_CONFIG + ')');
} catch (e) {
    throw new TypeError(
        'Error parsing incoming firebase config' + e.toString()
    );
}

firebase.initializeApp(firebaseConfig);
export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();
