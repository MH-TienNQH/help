import fs from "fs";
import path from "path";

// Helper function to check if a file exists locally
export const checkIfFileExists = async (filePath) => {
  try {
    const resolvedPath = path.resolve(filePath);
    await fs.promises.access(resolvedPath, fs.constants.F_OK);
    return true; // File exists
  } catch (error) {
    return false; // File does not exist
  }
};
