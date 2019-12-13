import firebase from "firebase";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCM1t-csaUoUFAGab47vBYOJ68r-lFxdf4",
    authDomain: "epatientindex-564ef.firebaseapp.com",
    databaseURL: "https://epatientindex-564ef.firebaseio.com",
    projectId: "epatientindex-564ef",
    storageBucket: "epatientindex-564ef.appspot.com",
    messagingSenderId: "337599667103",
    appId: "1:337599667103:web:35039e4e12983d0004fbaa",
    measurementId: "G-BZRGLDV0VW"
};
const firebaseApp = firebase.initializeApp(firebaseConfig);

export default firebaseApp;
