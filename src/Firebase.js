// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCieqPmBRPRMQeyEYIyhksCcSfvt5_V2z0",
    authDomain: "ruang-keluarga-315704.firebaseapp.com",
    databaseURL: "https://ruang-keluarga-315704-default-rtdb.firebaseio.com",
    projectId: "ruang-keluarga-315704",
    storageBucket: "ruang-keluarga-315704.appspot.com",
    messagingSenderId: "78925276663",
    appId: "1:78925276663:web:01b9545c15db36ac9f7af2",
    measurementId: "G-PJ66DP9Y21"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);