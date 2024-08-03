import multer from "multer";
import path from "path";

// Configure storage for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Specify the directory to save files
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    // Specify the filename with a unique identifier
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Function to dynamically create Multer upload middleware
export const uploadMiddleware = multer({
  storage: storage,
});
