import { upload } from "./multer.js";
import uploadToCloudinary from "./uploadToCloudinary.js";

export const uploadMiddleware = (fieldsConfig) => {
  return (req, res, next) => {
    const uploadFile = uplo.fields(fieldsConfig);

    uploadFile(req, res, (err) => {
      if (err) {
        console.error("Upload error:", err);
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }

      // Debugging
      console.log("Single file:", req.files["cover"]);
      console.log("Multiple files:", req.files["images"]);
      next();
    });
    uploadToCloudinary(req, res, next);
  };
};
