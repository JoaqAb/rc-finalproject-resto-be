// Importa los módulos y modelos necesarios
import { Router } from "express";
import { checkAdmin, verifyToken } from "../utils/middlewares.js";
import { createOrder } from "../utils/utils.js";

// Crea un router para las rutas de pedidos
const ordersRoutes = (req, res) => {
  const router = Router();

//   router.use(verifyToken);

  router.post("/create", async (req, res) => {
    try {
      const orderData = req.body;

      const newOrder = await createOrder(orderData);

      res.status(201).json({ status: "OK", data: newOrder });
    } catch (error) {
      res.status(500).json({ status: "ERR", error: error.message });
    }
  });
  return router;
};

// Exporta el router para su uso en otros archivos
export default ordersRoutes;
