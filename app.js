import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Inicializar app
const app = express();

// Configurar puerto y URL
const EXPRESS_PORT = process.env.EXPRESS_PORT || 3000;
const MONGODB_URL = process.env.MONGODB_URL || 'http://localhost:27017/';

// Habilitar cors y middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(cors({
    origin: '*'
}));
app.use(express.urlencoded({ extended: true }));

// Importar rutas
app.use('/api/users', usersRoutes());
app.use('/api/products', productsRoutes());
app.use('/api/orders', ordersRoutes());
app.use('/api/admin', adminRoutes());
app.use('/api/stats', statsRoutes());

// Manejo de errores
app.all('*', (req, res) => {
    res.status(404).send({ status: 'ERR', data: 'No se encuentra el endpoint solicitado' })
})

// Iniciar Escucha al puerto del servidor y conectar a DB
app.listen(EXPRESS_PORT, async () => {
    try {
        await mongoose.connect(MONGODB_URL)
        console.log(`Backend inicializado puerto ${EXPRESS_PORT}`)
    } catch (err) {
        console.error(err.message)
    }
})