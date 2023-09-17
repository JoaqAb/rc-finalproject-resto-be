import mongoose from "mongoose";
import { Router } from "express";
import { validationResult } from "express-validator";
import userModel from "../models/users.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  checkRequired,
  filterData,
  generateToken,
  hashPassword,
  isValidPassword,
} from "../utils/utils.js";
import {
  checkReadyLogin,
  checkRegistered,
  validateCreateFields,
  validateLoginFields,
  verifyToken,
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
    checkRequired(["email", "password"]),
    validateLoginFields,
    checkReadyLogin,
    async (req, res) => {
      // Ante todo chequeamos el validationResult del express-validator
      if (validationResult(req).isEmpty()) {
        try {
          const foundUser = res.locals.foundUser;

          // Si la clave es válida, la autenticación es correcta
          if (
            foundUser.email === req.body.email &&
            isValidPassword(foundUser, req.body.password)
          ) {
            // Generamos un nuevo token tipo JWT y lo agregamos a foundUser para que sea enviado en la respuesta
            foundUser._doc.token = jwt.sign(
              {
                _id: foundUser._id,
                name: foundUser.name,
                email: foundUser.email,
                role: foundUser.role,
              },
              process.env.JWT_SECRET,
              { expiresIn: process.env.JWT_EXPIRATION }
            );
            console.log("Token generado con éxito"); // Agrega un log para verificar que el token se generó correctamente
            res.status(200).send({
              status: "OK",
              data: filterData(foundUser._doc, ["password"]),
            });
          } else {
            console.log("Credenciales no válidas"); // Agrega un log para verificar que las credenciales no son válidas
            res
              .status(401)
              .send({ status: "ERR", data: "Credenciales no válidas" });
          }
        } catch (err) {
          console.error("Error al iniciar sesión:", err); // Agrega un log para verificar errores
          res.status(500).send({ status: "ERR", data: err.message });
        }
      } else {
        console.log("Errores de validación:", validationResult(req).array()); // Agrega un log para verificar errores de validación
        res
          .status(400)
          .send({ status: "ERR", data: validationResult(req).array() });
      }
    }
  );

  // Ruta profile para ver datos del cliente
  router.get("/profile", verifyToken, async (req, res) => {
    try {
      console.log("Datos del usuario autenticado:", req.loggedInUser);

      // Verificar si req.loggedInUser contiene el ID del usuario
      if (!req.loggedInUser._id) {
        return res
          .status(401)
          .json({ status: "ERR", data: "Token de usuario no válido" });
      }

      // Utilizar el ID del usuario para buscar en la base de datos
      const user = await userModel.findById(req.loggedInUser._id);

      if (!user) {
        return res
          .status(404)
          .json({ status: "ERR", data: "Usuario no encontrado" });
      }

      const userData = {
        name: user.name,
        email: user.email,
      };

      console.log("Datos del usuario obtenidos:", userData);

      res.status(200).json({ status: "OK", data: userData });
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
      res
        .status(500)
        .json({ status: "ERR", data: "Error al obtener datos del usuario" });
    }
  });

  return router;
};

export default usersRoutes;
