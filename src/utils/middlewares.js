import { body } from "express-validator";
import jwt from "jsonwebtoken";
import userModel from "../models/users.model.js";
import productModel from "../models/product.model.js";
import orderModel from "../models/order.model.js";

// Verificar el token
export const verifyToken = (req, res, next) => {
  try {
    const headerToken = req.headers.authorization;

    if (!headerToken) {
      console.log("Token no encontrado en el encabezado.");
      return res
        .status(401)
        .send({ status: "ERR", data: "Se requiere header con token válido" });
    }

    const token = headerToken.replace("Bearer ", "");

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          console.log("Token ha expirado.");
          return res
            .status(401)
            .send({ status: "ERR", data: "El token ha expirado" });
        } else {
          console.log("Token no es válido.");
          return res
            .status(401)
            .send({ status: "ERR", data: "El token no es válido" });
        }
      }

      req.loggedInUser = {
        ...decoded,
        rol: decoded.rol,
      };
      next();
    });
  } catch (err) {
    console.error("Error en verifyToken:", err);
    return res.status(500).send({ status: "ERR", data: err.message });
  }
};

// Verifica si el email enviado en el body ya se encuentra registrado
export const checkRegistered = async (req, res, next) => {
  const existingUser = await userModel.findOne({ email: req.body.email });

  if (!existingUser) {
    next();
  } else {
    res.status(400).json({
      status: "ERR",
      data: "El correo electrónico ya está registrado",
    });
  }
};

// Valida los elementos del body utilizando express-validator
export const validateCreateFields = [
  body("name")
    .isLength({ min: 2, max: 32 })
    .withMessage("El nombre debe tener entre 2 y 32 caracteres"),
  body("email").isEmail().withMessage("El formato de mail no es válido"),
  body("password")
    .isLength({ min: 6, max: 12 })
    .withMessage("La clave debe tener entre 6 y 12 caracteres"),
];

// Valida campos al crear un producto
export const validateProductCreateFields = [
  body("name")
    .isLength({ min: 2, max: 32 })
    .withMessage("El nombre debe tener entre 2 y 32 caracteres"),
  body("description")
    .isLength({ min: 2, max: 255 })
    .withMessage("La descripción debe tener entre 2 y 255 caracteres"),
  body("price")
    .isNumeric()
    .withMessage("El precio debe ser un valor numérico válido"),
  body("available").isBoolean().withMessage("El campo 'available' debe ser booleano"),
  body("image")
    .isURL()
    .withMessage("El campo 'image' debe ser una URL válida"),
];

// Valida los elementos del body utilizando express-validator
export const validateLoginFields = [
  body("email").isEmail().withMessage("El formato de mail no es válido"),
  body("password")
    .isLength({ min: 6, max: 12 })
    .withMessage("La clave debe tener entre 6 y 12 caracteres"),
];

// Verifica que el mail enviado en el body exista en la colección de usuarios
export const checkReadyLogin = async (req, res, next) => {
  res.locals.foundUser = await userModel.findOne({ email: req.body.email });
  if (res.locals.foundUser !== null) {
    next();
  } else {
    res
      .status(400)
      .send({ status: "ERR", data: "El email no se encuentra registrado" });
  }
};

// Verifica si el usuario es administrador
export const checkAdmin = (req, res, next) => {
  try {
    console.log("Valor de req.loggedInUser.rol:", req.loggedInUser.rol);

    if (req.loggedInUser && req.loggedInUser.rol === "admin") {
      // Si es administrador, permitir el acceso
      next();
    } else {
      // Si no es administrador, denegar el acceso
      res
        .status(403)
        .json({
          status: "ERR",
          data: "Acceso denegado: no eres administrador",
        });
    }
  } catch (err) {
    res.status(500).json({ status: "ERR", data: err.message });
  }
};

// Quita campos del req.body respetando un array de permitidos
export const filterAllowed = (allowedFields) => {
  return (req, res, next) => {
      req.filteredBody = {};
      
      for (const key in req.body) {
          if (allowedFields.includes(key)) req.filteredBody[key] = req.body[key]
      }
      
      next()
  }
}

// Obtener los platos disponibles
export const getAvailableProducts = async (req, res) => {
  try {
    const availableProducts = await productModel.find({ available: true });

    console.log('Available Products:', availableProducts);

    // Envía los platos disponibles como respuesta
    res.status(200).json({ status: 'OK', data: availableProducts });
  } catch (error) {
    // Maneja los errores si ocurren
    res.status(500).json({ status: 'ERR', error: error.message });
  }
};

