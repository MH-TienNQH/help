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

//Need user auth
userRoutes.use(verifyTokenMiddlewares);

userRoutes.get("/get-all", getAllUser);
userRoutes.get("/get-by-id/:id", getUserById);
userRoutes.get("/count-user", countUsers);
userRoutes.get("/personal-product", personalProduct);
userRoutes.post("/save-product/:id", saveProduct);

userRoutes.post("/like-product/:id", likeProduct);
userRoutes.post(
  "/request-to-buy/:id",
  validationMiddlware(requestSchema),
  requestToBuy
);

userRoutes.put(
  "/update/:id",
  upload.fields([{ name: "avatar" }]),
  validationMiddlware(signUpSchema),
  uploadToCloudinary,
  updateUser
);
userRoutes.put("/approve-request/:productId/:userId", approveRequest);
userRoutes.put("/reject-request/:productId/:userId", rejectRequest);

userRoutes.delete("/delete/:id", deleteUser);

//Need admin auth
userRoutes.use(adminMiddlewares);
userRoutes.get("/add-chart-for-trending", createChart);

userRoutes.post(
  "/add-user",
  upload.fields([{ name: "avatar" }]),
  validationMiddlware(signUpSchema),
  uploadToCloudinary,
  addUser
);
