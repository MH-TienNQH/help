import { Readable } from "stream";
import cloudinaryV2 from "../../cloudinaryConfig.js";

const uploadToCloudinary = async (req, res, next) => {
  // Check if files are present
  if (!req.files || !req.files.length) {
    return next(); // No files to upload, proceed to next middleware
  }

  try {
    // Handle multiple file uploads
    const imageUploads = req.files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const stream = cloudinaryV2.uploader.upload_stream(
            { folder: "images" },
            (error, result) => {
              if (error) {
                return reject(error);
              }
              resolve(result.secure_url);
            }
          );

          const readableStream = Readable.from(file.buffer);
          readableStream.pipe(stream);
        })
    );

    // Wait for all uploads to complete
    const imageUrls = await Promise.all(imageUploads);

    // Attach the URLs to the request object
    req.imageUrls = imageUrls;

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    next(error);
  }
};

export default uploadToCloudinary;
