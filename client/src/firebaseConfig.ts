// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: 'AIzaSyAtNRgZ7Kd8Li15z-dlTGOkeyi6wOCYS8k',
	authDomain: 'sliced-56cbd.firebaseapp.com',
	projectId: 'sliced-56cbd',
	storageBucket: 'sliced-56cbd.appspot.com',
	messagingSenderId: '898123841053',
	appId: '1:898123841053:web:2a93183908df58d018d0f4',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
