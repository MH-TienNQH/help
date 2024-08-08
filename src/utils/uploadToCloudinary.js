import { Readable } from "stream";
import cloudinaryV2 from "../../cloudinaryConfig.js";

const uploadToCloudinary = async (req, res, next) => {
  try {
    // Function to upload a file to Cloudinary
    const uploadFile = (file) => {
      return new Promise((resolve, reject) => {
        cloudinaryV2.uploader
          .upload_stream(
            {
              resource_type: "image",
              folder: "images",
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                return reject(error);
              }
              resolve(result);
            }
          )
          .end(file.buffer);
      });
    };

    const cloudinaryUrls = {};

    for (const [fieldName, files] of Object.entries(req.files || {})) {
      cloudinaryUrls[fieldName] = await Promise.all(
        files.map(async (file) => {
          const result = await uploadFile(file);
          return result.secure_url; // Collect Cloudinary URLs
        })
      );
    }

    req.cloudinaryUrls = Object.values(cloudinaryUrls).flat();
    next();
  } catch (error) {
    console.error("Cloudinary upload middleware error:", error);
    res
      .status(500)
      .json({ error: `Cloudinary upload failed: ${error.message}` });
  }
};

export default uploadToCloudinary;
