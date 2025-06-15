import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from 'dotenv';
import { asistentesRouter } from './routes/asistentes';

//import { router as pinRouter  } from '../servicios/pin/pinroutes'; // Asegúrate de que la ruta sea correcta

config(); // Cargar variables de entorno desde el archivo .env

class Server {
    private port: number;
    private app: express.Application;
    //private server: http.Server; //Este funciona para ws desde arduino.

    constructor() {
        
        this.port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
        this.app = express();

        //this.server = http.createServer(this.app);

    }

    middlewares() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, '../../public')));
    }
    
    routes() {
        this.app.use('/api', asistentesRouter);
    }
    start() {
        this.middlewares();
        this.routes();

        this.app.listen(this.port, () => {
            console.log(`Server is running at port ${this.port}`);
        }  );


    }
}

export const server = new Server(); 