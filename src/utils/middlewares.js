import { body } from "express-validator";
import jwt from 'jsonwebtoken';
import userModel from "../models/users.model.js";


// Verifica token
export const verifyToken = (req, res, next) => {
  try {
      const headerToken = req.headers.authorization

      if (!headerToken) return res.status(401).send({ status: 'ERR', data: 'Se requiere header con token válido' })
      const token = headerToken.replace('Bearer ', '')

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
          if (err) {
              if (err.name === 'TokenExpiredError') {
                  return res.status(401).send({ status: 'ERR', data: 'El token ha expirado' })
              } else {
                  return res.status(401).send({ status: 'ERR', data: 'El token no es válido' })
              }
          }

          req.loggedInUser = decoded
          next()
      })
  } catch(err) {
      return res.status(500).send({ status: 'ERR', data: err.message })
  }
}

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

// Valida los elementos del body utilizando express-validator
export const validateLoginFields = [
    body('email').isEmail().withMessage('El formato de mail no es válido'),
    body('password').isLength({ min: 6, max: 12 }).withMessage('La clave debe tener entre 6 y 12 caracteres')
]

//Verifica que el mail enviado en el body exista en la colección de usuarios
export const checkReadyLogin = async (req, res, next) => {
   res.locals.foundUser = await userModel.findOne({ email: req.body.email })
   if (res.locals.foundUser !== null) {
       next()
   } else {
       res.status(400).send({ status: 'ERR', data: 'El email no se encuentra registrado' })
   }
}