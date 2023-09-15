import mongoose from "mongoose";
import { Router } from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";

import userModel from "../models/user.model";

export const usersRoutes = (req, res) => {
  const router = Router();

  const checkRegistered = async (req, res, next) => {
    const existingUser = await userModel.findOne({ email: req.body.email });

    if (!existingUser) {
      next();
    } else {
      res
        .status(400)
        .json({
          status: "ERR",
          data: "El correo electrónico ya está registrado",
        });
    }
  };

  // Ruta registro
  router.post(
    "/register",
    [
      body("name", "El nombre es requerido").not().isEmpty(),
      body("email", "El correo electrónico es requerido").isEmail(),
      body("password", "La contraseña debe tener al menos 6 caracteres").isLength({ min: 6 }),
    ],
    checkRegistered,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: "ERR", data: errors.array() });
      }

      try {
        // Crear nuevo user en DB
        const newUser = await userModel.create(req.body);

        // Generar un token de autenticación
        const token = jwt.sign(
          { userId: newUser._id },
          process.env.JWT_SECRET,
          {
            expiresIn: process.env.JWT_EXPIRATION,
          }
        );

        // Enviar el token en la respuesta
      res.status(201).json({ status: "OK", data: { token } });
      } catch (error) {
        res
          .status(500)
          .json({ status: "ERR", data: "Error al registrar el usuario" });
      }
    }
  );

  const loginUser = async (req, res) => {};
  const getUser = async (req, res) => {};
};
