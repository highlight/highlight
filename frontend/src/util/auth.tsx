import * as firebase from 'firebase/app';
import 'firebase/auth';

const firebaseConfig = {
    apiKey: 'AIzaSyD7g86A3EzEKmoE7aZ04Re3HZ0B4bWlL68',
    authDomain: 'auth.highlight.run',
    databaseURL: 'https://highlight-f5c5b.firebaseio.com',
    projectId: 'highlight-f5c5b',
    storageBucket: 'highlight-f5c5b.appspot.com',
    messagingSenderId: '263184175068',
    appId: '1:263184175068:web:f8190c20320087d1c6c919',
};
firebase.initializeApp(firebaseConfig);
export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();
