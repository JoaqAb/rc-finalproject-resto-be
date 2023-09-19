import { Router } from "express";
import productModel from "../models/product.model.js";
import { checkAdmin, verifyToken } from "../utils/middlewares.js";

const productsRoutes = (req, res) => {
  const router = Router();

  router.use(verifyToken, checkAdmin);

// Ruta para listar productos
router.get("/", async (req, res) => {
    try {
      const products = await productModel.find();
      res.status(200).json({ status: "OK", data: products });
    } catch (error) {
      console.error("Error al obtener la lista de productos:", error);
      res.status(500).json({
        status: "ERR",
        data: "Error al obtener la lista de productos",
      });
    }
  });

  return router;
};
export default productsRoutes;
