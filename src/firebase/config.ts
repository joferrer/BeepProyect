
import { config } from 'dotenv';

import admin from "firebase-admin"; // Importar admin de firebase-

 
config(); // Cargar variables de entorno desde el archivo .env

//https://accesoapp-ed27c-default-rtdb.firebaseio.com

const firebaseConfig = {
  credential: admin.credential.cert(
    {
    projectId: process.env.PROJECT_ID,
    privateKey: process.env.PRIVATE_KEY,
    clientEmail: process.env.CLIENT_EMAIL,
  }
  ),
  apiKey: process.env.apiKey, 
    authDomain: process.env.authDomain,
    databaseURL: process.env.databaseURL,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    
};
// Initialize Firebase
admin.initializeApp(firebaseConfig);


// Initialize Realtime Database and get a reference to the service
export const database = admin.firestore();