import 'firebase/auth';

import * as firebase from 'firebase/app';

let firebaseConfig: any;
let firebaseConfigString: string;

if (process.env.REACT_APP_FIREBASE_CONFIG_OBJECT) {
    console.log(
        'Reading firebase config process.env.REACT_APP_FIREBASE_CONFIG_OBJECT'
    );
    console.log('Reading firebase config from env variable');
    firebaseConfigString = process.env.REACT_APP_FIREBASE_CONFIG_OBJECT ?? '';
} else {
    console.log(
        'Reading firebase config window._highlightFirebaseConfigString'
    );
    firebaseConfigString = window._highlightFirebaseConfigString;
}

// NOTE: we use eval() here (rather than JSON.parse) because its more in-tune
// with the string presented to a developer in the firebase console.
// This value is passed at build time, so security concerns are put aside.
try {
    firebaseConfig = eval('(' + firebaseConfigString + ')');
} catch (e) {
    throw new Error('Error parsing incoming firebase config' + e.toString());
}

window._highlightFirebaseConfig = firebaseConfig;

firebase.initializeApp(firebaseConfig);
export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();
