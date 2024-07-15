import { Router } from "express";
import {
  addProduct,
  deleteProduct,
  getAllProduct,
  getProductById,
  updateProduct,
} from "../controllers/productController.js";

export const productRoutes = Router();

productRoutes.get("/get-all", getAllProduct);
productRoutes.get("/get-by-id/:id", getProductById);
productRoutes.post("/add-product", addProduct);
productRoutes.put("/update/:id", updateProduct);
productRoutes.delete("/delete/:id", deleteProduct);
