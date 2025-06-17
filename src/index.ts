//import { hacerPreregistro } from './firebase/preregistro';
import {server} from './server/server';
//import { leerAsistenciasLocales } from './xlsx/reporteExcel';
//import { hacerPreregistro } from './xlsx/preregistro';

server.start(); // Iniciar el servidor

//hacerPreregistro() // Hacer el prerregistro
    //.then(() => console.log('Preregistro completado'))

//leerAsistenciasLocales().then(asistencias => {
//    console.log('Asistencias locales:', asistencias);
//})