// Importa los módulos y modelos necesarios
import { Router } from "express";
import { checkAdmin, verifyToken } from "../utils/middlewares.js";
import { createOrder, getOrdersByStatus } from "../utils/utils.js";

const ordersRoutes = (req, res) => {
  const router = Router();

  //  Crear pedidos por el cliente
  router.post("/create", verifyToken, async (req, res) => {
    try {
      const clientId = req.loggedInUser._id;
      const orderData = req.body;

      orderData.cliente = clientId;

      const newOrder = await createOrder(orderData); // Crear la orden con el ID del cliente

      res.status(201).json({ status: "OK", data: newOrder });
    } catch (error) {
      res.status(500).json({ status: "ERR", error: error.message });
    }
  });

  // Visualizar pedidos en espera
  // /api/orders/en%20espera
  router.get(
    "/:status",
    verifyToken,
    checkAdmin,
    async (req, res) => {
      try {
        const status = req.params.status;

        const orders = await getOrdersByStatus(status);

        res.status(200).json({ status: "OK", data: orders });
      } catch (error) {
        res.status(500).json({ status: "ERR", error: error.message });
      }
    }
  );

  return router;
};

// Exporta el router para su uso en otros archivos
export default ordersRoutes;
