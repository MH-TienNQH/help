import { Router } from "express";

//controllers
import {
  addUser,
  approveRequest,
  countUsers,
  createChart,
  deleteUser,
  getAllUser,
  getUserById,
  likeProduct,
  personalProduct,
  rejectRequest,
  requestToBuy,
  saveProduct,
  updateUser,
} from "../controllers/userControllers.js";

//authentication middlewares
import verifyTokenMiddlewares from "../middlewares/verifyTokenMiddlewares.js";
import adminMiddlewares from "../middlewares/adminMiddlewares.js";

//validation
import { upload } from "../utils/multer.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import { validationMiddlware } from "../middlewares/validationMiddlewares.js";
import { requestSchema } from "../schema/requestSchema.js";
import { signUpSchema } from "../schema/userSchema.js";

export const userRoutes = Router();

userRoutes.get("/get-all", verifyTokenMiddlewares, getAllUser);
userRoutes.get("/get-by-id/:id", verifyTokenMiddlewares, getUserById);
userRoutes.get("/count-user", verifyTokenMiddlewares, countUsers);
userRoutes.get("/personal-product", verifyTokenMiddlewares, personalProduct);
userRoutes.get(
  "/add-chart-for-trending",
  verifyTokenMiddlewares,
  adminMiddlewares,
  createChart
);

userRoutes.post(
  "/add-user",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  validationMiddlware(signUpSchema),
  verifyTokenMiddlewares,
  adminMiddlewares,
  uploadToCloudinary,
  addUser
);
userRoutes.post("/save-product/:id", verifyTokenMiddlewares, saveProduct);

userRoutes.post("/like-product/:id", verifyTokenMiddlewares, likeProduct);
userRoutes.post(
  "/request-to-buy/:id",
  validationMiddlware(requestSchema),
  verifyTokenMiddlewares,
  requestToBuy
);

userRoutes.put(
  "/update/:id",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  verifyTokenMiddlewares,
  validationMiddlware(signUpSchema),
  uploadToCloudinary,
  updateUser
);
userRoutes.put(
  "/approve-request/:productId/:userId",
  verifyTokenMiddlewares,
  approveRequest
);
userRoutes.put(
  "/reject-request/:productId/:userId",
  verifyTokenMiddlewares,
  rejectRequest
);

userRoutes.delete("/delete/:id", verifyTokenMiddlewares, deleteUser);
