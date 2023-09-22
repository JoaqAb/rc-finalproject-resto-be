// Importa los módulos y modelos necesarios
import { Router } from "express";
import { checkAdmin, verifyToken } from "../utils/middlewares.js";
import { createOrder, getOrdersByStatus, updateOrderStatus } from "../utils/utils.js";

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

  // Ruta para actualizar el estado de un pedido por su ID
  router.put("/status/:id", verifyToken, checkAdmin, async (req, res) => {
    try {
      const orderId = req.params.id;
      const newStatus = req.body.estado; // Supongo que enviarás el nuevo estado en el cuerpo de la solicitud

      // Llama a la función del controlador para actualizar el estado del pedido
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
  
      res.status(200).json({ status: "OK", data: updatedOrder });
    } catch (error) {
      res.status(500).json({ status: "ERR", error: error.message });
    }
  });

  return router;
};

// Exporta el router para su uso en otros archivos
export default ordersRoutes;
