import mongoose from "mongoose";
import { Router } from "express";
import { validationResult } from "express-validator";
import userModel from "../models/users.model.js";
import bcrypt from 'bcrypt';
import { checkRequired, generateToken, hashPassword } from "../utils/utils.js";
import {
  checkReadyLogin,
  checkRegistered,
  validateCreateFields,
  validateLoginFields,
} from "../utils/middlewares.js";

const usersRoutes = (req, res) => {
  const router = Router();

  // Ruta de registro
  router.post(
    "/register",
    validateCreateFields,
    checkRegistered,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: "ERR", data: errors.array() });
      }

      try {
        // Hashear la contraseña antes de guardarla
        const hashedPassword = await hashPassword(req.body.password);

        // Crear nuevo user en DB
        const newUser = await userModel.create({
          name: req.body.name,
          email: req.body.email,
          password: hashedPassword,
        });

        // Asignar el rol "client" al nuevo usuario
        newUser.rol = "client";
        await newUser.save();

        // Generar un token de autenticación
        const token = generateToken({ userId: newUser._id });

        // Enviar el token en la respuesta
        res.status(201).json({ status: "OK", data: { token } });
      } catch (error) {
        res
          .status(500)
          .json({ status: "ERR", data: "Error al registrar el usuario" });
      }
    }
  );

  // Ruta de login
  router.post(
    "/login",
    checkRequired(['email', 'password']),
    validateLoginFields,
    checkReadyLogin,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: "ERR", data: errors.array() });
      }

      try {
        const { password } = req.body;
        const user = res.locals.foundUser;

        const passwordIsValid = await bcrypt.compare(password, user.password);

        if (!passwordIsValid) {
          return res.status(401).json({ status: "ERR", data: "Credenciales inválidas" });
        }

        const token = generateToken({ userId: user._id });

        res.status(200).json({ status: "OK", data: { token } });
      } catch (error) {
         res.status(500).json({ status: "ERR", data: "Error al iniciar sesión" });
      }
    }
  );

  return router;
};

export default usersRoutes;
