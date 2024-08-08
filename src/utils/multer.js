import multer from "multer";
import path from "path";
import fs from "fs";

// Configure storage for Multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const dir = "public/images";
//     fs.access(dir, fs.constants.F_OK, (err) => {
//       if (err) {
//         // Directory does not exist, so create it
//         fs.mkdir(dir, { recursive: true }, (mkdirErr) => {
//           if (mkdirErr) {
//             return cb(mkdirErr); // Pass error to callback
//           }
//           cb(null, dir); // Directory created successfully
//         });
//       } else {
//         // Directory exists
//         cb(null, dir);
//       }
//     });
//   },
//   filename: (req, file, cb) => {
//     // Specify the filename with a unique identifier
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(
//       null,
//       file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
//     );
//   },
// });
export const upload = (fieldsConfig) => {
  // Ensure fieldsConfig is an array
  if (!Array.isArray(fieldsConfig)) {
    throw new Error("fieldsConfig must be an array");
  }

  // Create Multer storage configuration
  const storage = multer.memoryStorage(); // Use memory storage

  // Define Multer upload middleware with dynamic fields
  const upload = multer({ storage }).fields(fieldsConfig);

  // Return a middleware function that uses Multer to handle file uploads
  return (req, res, next) => {
    // Apply the multer upload middleware
    upload(req, res, (err) => {
      if (err) {
        console.error("Upload error:", err);
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }
      next();
    });
  };
};
