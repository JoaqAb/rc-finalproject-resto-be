// Importa los módulos y modelos necesarios
import { Router } from "express";
import { checkAdmin, verifyToken } from "../utils/middlewares.js";
import {
  createOrder,
  getOrdersByStatus,
  updateOrderStatus,
} from "../utils/utils.js";

const ordersRoutes = (req, res) => {
  const router = Router();

  //  Crear pedidos por el cliente
  router.post("/create", async (req, res) => {
    try {
      const clientId = req.loggedInUser._id;
      const orderData = req.body;

      orderData.cliente = clientId;

      const newOrder = await createOrder(orderData);

      res.status(201).json({ status: "OK", data: newOrder });
    } catch (error) {
      res.status(500).json({ status: "ERR", error: error.message });
    }
  });
  // router.post("/create", verifyToken, async (req, res) => {
  //   try {
  //     const clientId = req.loggedInUser._id;
  //     const orderData = req.body;

  //     orderData.cliente = clientId;

  //     const newOrder = await createOrder(orderData);

  //     res.status(201).json({ status: "OK", data: newOrder });
  //   } catch (error) {
  //     res.status(500).json({ status: "ERR", error: error.message });
  //   }
  // });

  // Visualizar pedidos en espera
  // /api/orders/en%20espera
  router.get("/:status", async (req, res) => {
    try {
      const status = req.params.status;

      const orders = await getOrdersByStatus(status);

      res.status(200).json({ status: "OK", data: orders });
    } catch (error) {
      res.status(500).json({ status: "ERR", error: error.message });
    }
  });

  // router.get("/:status", verifyToken, checkAdmin, async (req, res) => {
  //   try {
  //     const status = req.params.status;

  //     const orders = await getOrdersByStatus(status);

  //     res.status(200).json({ status: "OK", data: orders });
  //   } catch (error) {
  //     res.status(500).json({ status: "ERR", error: error.message });
  //   }
  // });

  // Ruta para actualizar el estado de un pedido por su ID
  router.put("/status/:id", async (req, res) => {
    try {
      const orderId = req.params.id;
      const newStatus = req.body.estado;
      const updatedOrder = await updateOrderStatus(orderId, newStatus);

      res.status(200).json({ status: "OK", data: updatedOrder });
    } catch (error) {
      res.status(500).json({ status: "ERR", error: error.message });
    }
  });
  // router.put("/status/:id", verifyToken, checkAdmin, async (req, res) => {
  //   try {
  //     const orderId = req.params.id;
  //     const newStatus = req.body.estado;
  //     const updatedOrder = await updateOrderStatus(orderId, newStatus);

  //     res.status(200).json({ status: "OK", data: updatedOrder });
  //   } catch (error) {
  //     res.status(500).json({ status: "ERR", error: error.message });
  //   }
  // });

  return router;
};

export default ordersRoutes;
