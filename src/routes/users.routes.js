import { Router } from "express";
import { validationResult } from "express-validator";
import userModel from "../models/users.model.js";
import jwt from "jsonwebtoken";
import {
  filterAllowed,
  filterData,
  generateToken,
  hashPassword,
  isValidPassword,
} from "../utils/utils.js";
import {
  checkAdmin,
  checkReadyLogin,
  checkRegistered,
  checkRequired,
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
        const hashedPassword = await hashPassword(req.body.password);

        const adminCount = await userModel.countDocuments({ rol: "admin" });

        if (adminCount === 0) {
          const newUser = await userModel.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            rol: "admin",
          });

          const token = generateToken({ userId: newUser._id });

          res.status(201).json({ status: "OK", data: { token } });
        } else {
          const newUser = await userModel.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            rol: "client",
          });

          const token = generateToken({ userId: newUser._id });

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
      if (validationResult(req).isEmpty()) {
        try {
          const foundUser = res.locals.foundUser;

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
      if (!req.loggedInUser._id) {
        return res
          .status(401)
          .json({ status: "ERR", data: "Token de usuario no válido" });
      }

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

  // Ruta para que el administrador vea una lista de clientes
  router.get("/clients", verifyToken, checkAdmin, async (req, res) => {
    try {
      const clients = await userModel.find({ rol: "client" }, "-password");

      res.status(200).json({ status: "OK", data: clients });
    } catch (error) {
      console.error("Error al obtener la lista de clientes:", error);

      res
        .status(500)
        .json({ status: "ERR", data: "Error al obtener la lista de clientes" });
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

  // Ruta para eliminar un cliente por su ID
  router.delete("/delete/:id", verifyToken, checkAdmin, async (req, res) => {
    try {
      const userIdToDelete = req.params.id;

      const userToDelete = await userModel.findById(userIdToDelete);

      if (!userToDelete) {
        return res
          .status(404)
          .json({ status: "ERR", data: "Usuario no encontrado" });
      }

      await userModel.findByIdAndDelete(userIdToDelete);

      res
        .status(200)
        .json({ status: "OK", data: "Usuario eliminado con éxito" });
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      res
        .status(500)
        .json({ status: "ERR", data: "Error al eliminar el usuario" });
    }
  });

  return router;
};

export default usersRoutes;
