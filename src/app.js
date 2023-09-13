import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'

dotenv.config()

const EXPRESS_PORT = process.env.EXPRESS_PORT || 3000

const app = express();


console.log("Starting")

app.listen(EXPRESS_PORT, () => {
    console.log(`Backend iniciado en puerto ${EXPRESS_PORT}`)
});