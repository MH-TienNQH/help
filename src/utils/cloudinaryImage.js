import cloudinaryV2 from "../../cloudinaryConfig.js";
import { OperationalException } from "../exceptions/operationalExceptions.js";

export const deleteImage = async (imageUrls) => {
  const publicIds = imageUrls
    .map((url) => {
      // Extract public ID from the URL
      const match = url.match(/\/v\d+\/(.*)\./);
      return match ? match[1] : null;
    })
    .filter((id) => id);

  try {
    for (const publicId of publicIds) {
      await cloudinaryV2.uploader.destroy(publicId);
    }
  } catch (error) {
    throw new OperationalException({ "Delete failed": error }, 500);
  }
};
