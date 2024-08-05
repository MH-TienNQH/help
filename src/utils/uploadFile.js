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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/"); // Directory to save files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

// Function to dynamically create Multer upload middleware
export const uploadMiddleware = multer({
  storage: storage,
});
