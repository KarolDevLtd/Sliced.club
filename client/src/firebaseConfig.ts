// // Import the functions you need from the SDKs you need
// import { initializeApp } from 'firebase/app';
// import { getAnalytics } from 'firebase/analytics';
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries
// import { getFirestore } from 'firebase/firestore';

// // Your web app's Firebase configuration
// const firebaseConfig = {
// 	apiKey: 'AIzaSyAtNRgZ7Kd8Li15z-dlTGOkeyi6wOCYS8k',
// 	authDomain: 'sliced-56cbd.firebaseapp.com',
// 	projectId: 'sliced-56cbd',
// 	storageBucket: 'sliced-56cbd.appspot.com',
// 	messagingSenderId: '898123841053',
// 	appId: '1:898123841053:web:2a93183908df58d018d0f4',
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// export const firestore = getFirestore(app);
// // const analytics = getAnalytics(app);
// // export firestore;

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: 'AIzaSyB2ibR4-0Zu1I1rODsLQSWqm-sBt9IUjzE',
	authDomain: 'test-71d14.firebaseapp.com',
	projectId: 'test-71d14',
	storageBucket: 'test-71d14.appspot.com',
	messagingSenderId: '430579012732',
	appId: '1:430579012732:web:1135dfe1ebeb66b98f25f9',
	measurementId: 'G-ZDSNWPWX5X',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const firestore = getFirestore(app);
