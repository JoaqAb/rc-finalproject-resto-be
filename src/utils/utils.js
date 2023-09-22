import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import orderModel from "../models/order.model.js";

export const hashPassword = async (password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
};

export const generateToken = (userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
  return token;
};

export const checkRequired = (requiredFields) => {
  return (req, res, next) => {
    try {
      for (const field of requiredFields) {
        if (!req.body[field]) {
          throw new Error(`El campo "${field}" es requerido`);
        }
      }
      next();
    } catch (error) {
      res.status(400).json({ status: 'ERR', data: error.message });
    }
  };
};

export const isValidPassword = (userInDb, pass) => {
  return bcrypt.compareSync(pass, userInDb.password);
}

export const filterData = (data, unwantedFields) => {
  const { ...filteredData } = data
  unwantedFields.forEach(field => delete filteredData[field] )
  return filteredData
}

export const filterAllowed = (allowedFields) => {
  return (req, res, next) => {
      req.filteredBody = {};
      
      for (const key in req.body) {
          if (allowedFields.includes(key)) req.filteredBody[key] = req.body[key]
      }
      
      next()
  }
}

export const createOrder = async (orderData) => {
  try {
    if (typeof orderData !== 'object' || orderData === null) {
      throw new Error("orderData is not a valid object");
    }

    // Calcular el total de la orden si es necesario
    let total = 0;
    if (orderData.productos && Array.isArray(orderData.productos)) {
      orderData.productos.forEach((producto) => {
        total += producto.precio * producto.cantidad;
      });
      orderData.total = total;
    }

    const newOrder = new orderModel(orderData);

    await newOrder.save();

    return newOrder;
  } catch (error) {
    throw error;
  }
};
