import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import orderModel from "../models/order.model.js";
import userModel from "../models/users.model.js";

// Función para crear un hash de una contraseña
export const hashPassword = async (password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
};

// Función para generar un token JWT
export const generateToken = (userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
  return token;
};

// Función para verificar si una contraseña es válida
export const isValidPassword = (userInDb, pass) => {
  return bcrypt.compareSync(pass, userInDb.password);
};

// Función para filtrar datos y eliminar campos no deseados
export const filterData = (data, unwantedFields) => {
  const { ...filteredData } = data;
  unwantedFields.forEach((field) => delete filteredData[field]);
  return filteredData;
};

// Filtrar campos permitidos en la solicitud
export const filterAllowed = (allowedFields) => {
  return (req, res, next) => {
    req.filteredBody = {};

    for (const key in req.body) {
      if (allowedFields.includes(key)) req.filteredBody[key] = req.body[key];
    }

    next();
  };
};

// Función para crear pedidos
export const createOrder = async (orderData) => {
  try {
    if (typeof orderData !== "object" || orderData === null) {
      throw new Error("orderData is not a valid object");
    }

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

// Función para obtener pedidos por estado
export const getOrdersByStatus = async (status) => {
  try {
    const orders = await orderModel
      .find({ estado: status })
      .populate("cliente");

    return orders;
  } catch (error) {
    throw error;
  }
};

// Función para actualizar el estado del pedido por su ID
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { estado: newStatus },
      { new: true }
    );

    return updatedOrder;
  } catch (error) {
    throw error;
  }
};

// Función para obtener estadísticas de pedidos
export const getOrdersStats = async () => {
  try {
    const totalOrders = await orderModel.countDocuments();
    const totalSales = await orderModel.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$total" },
        },
      },
    ]);

    const topProducts = await orderModel.aggregate([
      {
        $unwind: "$productos",
      },
      {
        $group: {
          _id: {
            productId: "$productos._id", 
            productName: "$productos.nombre",
          },
          totalQuantity: { $sum: "$productos.cantidad" },
        },
      },
      {
        $sort: { totalQuantity: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    const topProductsModified = topProducts.map((product) => ({
      name: product._id,
      totalQuantity: product.totalQuantity,
    }));

    const topClients = await orderModel.aggregate([
      {
        $group: {
          _id: "$cliente",
          totalOrders: { $sum: 1 },
        },
      },
      {
        $sort: { totalOrders: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    const clientIds = topClients.map((client) => client._id);
    const clientNames = await userModel.find(
      { _id: { $in: clientIds } },
      { _id: 1, name: 1 }
    );

    const topClientsWithNames = topClients.map((client) => {
      const matchingClient = clientNames.find(
        (c) => c._id.toString() === client._id.toString()
      );
      return {
        _id: matchingClient._id,
        name: matchingClient.name,
        totalOrders: client.totalOrders,
      };
    });

    const statistics = {
      totalOrders,
      totalSales: totalSales[0].totalAmount || 0,
      topProducts: topProductsModified,
      topClients: topClientsWithNames,
    };

    return statistics;
  } catch (error) {
    throw error;
  }
};
