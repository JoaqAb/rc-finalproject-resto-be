import express from 'express';

const EXPRESS_PORT = 5000

const app = express();

console.log("Starting")

app.listen(EXPRESS_PORT, () => {
    console.log(`Backend iniciado en puerto ${EXPRESS_PORT}`)
});