import multer, { memoryStorage } from "multer";
import { responseFormatForErrors } from "./responseFormat.js";
const storage = memoryStorage();

export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size (5MB)
  fileFilter: (req, file, cb) => {
    if (["image/jpeg", "image/png", "image/gif"].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new responseFormatForErrors(402, false, "Invalid file type "), false);
    }
  },
});
