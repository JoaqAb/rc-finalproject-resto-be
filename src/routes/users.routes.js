import { Router } from "express";
import { validationResult } from "express-validator";
import userModel from "../models/users.model.js";
import jwt from "jsonwebtoken";
import {
  checkRequired,
  filterAllowed,
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

        // Verifica si ya existe un administrador en la base de datos
        const adminCount = await userModel.countDocuments({ rol: "admin" });

        // Si no existe ningún administrador, permite el registro como administrador
        if (adminCount === 0) {
          // Crear nuevo usuario en DB con el rol de administrador
          const newUser = await userModel.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            rol: "admin",
          });

          // Generar un token de autenticación
          const token = generateToken({ userId: newUser._id });

          // Enviar el token en la respuesta
          res.status(201).json({ status: "OK", data: { token } });
        } else {
          // Si ya existe un administrador, permite el registro como usuario regular
          const newUser = await userModel.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            rol: "client",
          });

          // Generar un token de autenticación
          const token = generateToken({ userId: newUser._id });

          // Enviar el token en la respuesta
          res.status(201).json({ status: "OK", data: { token } });
        }
      } catch (error) {
        console.error("Error al registrar el usuario:", error);
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
      // Checkear validationResult del express-validator
      if (validationResult(req).isEmpty()) {
        try {
          const foundUser = res.locals.foundUser;

          // Si la clave es válida, la autenticación es correcta
          if (
            foundUser.email === req.body.email &&
            isValidPassword(foundUser, req.body.password)
          ) {
            foundUser._doc.token = jwt.sign(
              {
                _id: foundUser._id,
                name: foundUser.name,
                email: foundUser.email,
                rol: foundUser.rol,
              },
              process.env.JWT_SECRET,
              { expiresIn: process.env.JWT_EXPIRATION }
            );
            res.status(200).send({
              status: "OK",
              data: filterData(foundUser._doc, ["password"]),
            });
          } else {
            res
              .status(401)
              .send({ status: "ERR", data: "Credenciales no válidas" });
          }
        } catch (err) {
          res.status(500).send({ status: "ERR", data: err.message });
        }
      } else {
        res
          .status(400)
          .send({ status: "ERR", data: validationResult(req).array() });
      }
    }
  );

  // Ruta profile para ver datos del cliente
  router.get("/profile", verifyToken, async (req, res) => {
    try {
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

      res.status(200).json({ status: "OK", data: userData });
    } catch (error) {
      res
        .status(500)
        .json({ status: "ERR", data: "Error al obtener datos del usuario" });
    }
  });

  // Ruta para actualizar datos de cliente
  router.put(
    "/update",
    verifyToken,
    validateCreateFields,
    filterAllowed(["name", "email", "password"]),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: "ERR", data: errors.array() });
      }
      try {
        const user = await userModel.findById(req.loggedInUser._id);

        if (!user) {
          return res
            .status(404)
            .json({ status: "ERR", data: "Usuario no encontrado" });
        }

        if (req.body.name) {
          user.name = req.body.name;
        }

        if (req.body.email) {
          user.email = req.body.email;
        }

        if (req.body.newPassword) {
          const hashedPassword = await hashPassword(req.body.newPassword);
          user.password = hashedPassword;
        }

        await user.save();

        const updatedUserData = {
          name: user.name,
          email: user.email,
        };

        res.status(200).json({ status: "OK", data: updatedUserData });
      } catch (error) {
        console.error("Error al actualizar datos del usuario:", error);

        res.status(500).json({
          status: "ERR",
          data: "Error al actualizar datos del usuario",
          error: error.message,
        });
      }
    }
  );

  return router;
};

export default usersRoutes;
