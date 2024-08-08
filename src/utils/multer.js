import multer, { memoryStorage } from "multer";
import path from "path";
import fs from "fs";

// export const upload = (fieldsConfig) => {
//   // Ensure fieldsConfig is an array
//   if (!Array.isArray(fieldsConfig)) {
//     throw new Error("fieldsConfig must be an array");
//   }

//   // Create Multer storage configuration
//   const storage = multer.memoryStorage(); // Use memory storage
//   const fields = fieldsConfig.map(({ name, maxCount }) => ({ name, maxCount }));

//   // Define Multer upload middleware with dynamic fields
//   const upload = multer({ storage }).fields(fieldsConfig);

//   // Return a middleware function that uses Multer to handle file uploads
//   return (req, res, next) => {
//     // Apply the multer upload middleware
//     upload(req, res, (err) => {
//       if (err) {
//         console.error("Upload error:", err);
//         return res.status(400).json({ error: `Upload error: ${err.message}` });
//       }
//       next();
//     });
//   };
// };

const storage = memoryStorage();

export const upload = multer({ storage: storage });
