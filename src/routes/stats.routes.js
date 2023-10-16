import { Router } from "express";
import { verifyToken, checkAdmin } from "../utils/middlewares.js";
import { getOrdersStats } from "../utils/utils.js";

const statsRoutes = (req, res) => {
  const router = Router();

  // Ruta para obtener estadísticas
  router.get("/", async (req, res) => {
    try {
      const statistics = await getOrdersStats();
      res.status(200).json({ status: "OK", data: statistics });
    } catch (error) {
      res.status(500).json({ status: "ERR", error: error.message });
    }
  });
  // router.get("/", verifyToken, checkAdmin, async (req, res) => {
  //   try {
  //     const statistics = await getOrdersStats();
  //     res.status(200).json({ status: "OK", data: statistics });
  //   } catch (error) {
  //     res.status(500).json({ status: "ERR", error: error.message });
  //   }
  // });

  return router;
};

export default statsRoutes;
