import { Router } from "express";
import productModel from "../models/product.model.js";
import {
  checkAdmin,
  filterAllowed,
  verifyToken,
} from "../utils/middlewares.js";
import mongoose from "mongoose";

const productsRoutes = (req, res) => {
  const router = Router();

  //   router.use(verifyToken, checkAdmin);

  // Ruta para listar productos
  router.get("/", async (req, res) => {
    try {
      const products = await productModel.find();
      res.status(200).json({ status: "OK", data: products });
    } catch (error) {
      res.status(500).json({
        status: "ERR",
        data: "Error al obtener la lista de productos",
      });
    }
  });

  // Ruta para obtener producto único
  router.get("/one/:id", async (req, res) => {
    try {
      const productId = req.params.id;

      // Buscar el producto en la base de datos por su ID
      const product = await productModel.findOne({ id: productId });

      if (!product) {
        return res.status(404).json({
          status: "ERR",
          data: "El producto no fue encontrado",
        });
      }

      res.status(200).json({
        status: "OK",
        data: product,
      });
    } catch (error) {
      console.error("Error al obtener el producto por ID:", error);
      res.status(500).json({
        status: "ERR",
        data: "Error al obtener el producto por ID",
      });
    }
  });

  // Ruta para modificar producto
router.put("/update/:id", filterAllowed(["name", "description", "price", "image"]), async (req, res) => {
    try {
        const id = req.params.id;
        if (mongoose.Types.ObjectId.isValid(id)) {
            const updatedProduct = await productModel.findOneAndUpdate(
                { _id: id },
                { $set: req.body },
                { new: true }
            );

            if (!updatedProduct) {
                res.status(404).send({ status: "ERR", data: "No existe producto con ese ID" });
            } else {
                res.status(200).send({ status: "OK", data: updatedProduct });
            }
        } else {
            res.status(400).send({ status: "ERR", data: "Formato de ID no válido" });
        }
    } catch (err) {
        console.error("Error al actualizar el producto:", err);
        res.status(500).send({ status: "ERR", data: err.message });
    }
});


  return router;
};
export default productsRoutes;
