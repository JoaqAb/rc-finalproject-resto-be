import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import usersRoutes from './src/routes/users.routes.js'
import productsRoutes from './src/routes/products.routes.js';
import ordersRoutes from './src/routes/orders.routes.js';


// Cargar variables de entorno
dotenv.config();

// Inicializar app
const app = express();

// Configurar puerto y URL
const EXPRESS_PORT = process.env.EXPRESS_PORT || 3236;
const MONGODB_URI = process.env.MONGODB_URI || 'http://localhost:27017/';

// Habilitar cors y middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(cors({
    origin: '*'
}));
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/users', usersRoutes());
app.use('/api/products', productsRoutes());
app.use('/api/orders', ordersRoutes());
// app.use('/api/stats', statsRoutes());


app.get('/', (req, res) => {
    res.send('¡Bienvenido a mi aplicación RESTful!');
});

// Manejo de errores
app.all('*', (req, res) => {
    res.status(404).send({ status: 'ERR', data: 'No se encuentra el endpoint solicitado' })
})

// Iniciar Escucha al puerto del servidor y conectar a DB
app.listen(EXPRESS_PORT, async () => {
    try {
        await mongoose.connect(MONGODB_URI)
        console.log(`Backend inicializado`)
    } catch (err) {
        console.error(err.message)
    }
})