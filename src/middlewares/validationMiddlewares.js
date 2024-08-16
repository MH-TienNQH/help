import { ZodError } from "zod";
import { responseFormatForErrors } from "../utils/responseFormat.js";
import { addProductSchema } from "../schema/productSchema.js";
import { signUpSchema } from "../schema/userSchema.js";

export function validationMiddlware(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMap = {};

        error.errors.forEach((err) => {
          const field = err.path[0]; // Use the first element of the path array for the field name
          if (!errorMap[field]) {
            errorMap[field] = err.message; // Store only the first message
          }
        });

        // Create a formatted error response with a single message per field
        const formattedErrors = Object.keys(errorMap).map((field) => ({
          field,
          message: errorMap[field],
        }));
        return res.send(
          new responseFormatForErrors(422, false, formattedErrors)
        );
      } else {
        next(error);
      }
    }
    next();
  };
}

export function validateSignUpSchema() {
  return [
    (req, res, next) => {
      try {
        // Check if a file was uploaded
        if (!req.files.avatar) {
          return res.json(
            new responseFormatForErrors(401, false, {
              message: "Avatar cannot be empty",
            })
          );
        }

        // Check if more than one file is uploaded
        if (req.files.avatar && req.files.avatar.length > 1) {
          return res.json(
            new responseFormatForErrors(401, false, {
              message: "You can only add one avatar",
            })
          );
        }

        // Validate schema with the file included
        const formData = {
          ...req.body,
          avatar: req.file,
        };

        signUpSchema.parse(formData);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const errorMap = {};

          error.errors.forEach((err) => {
            const field = err.path[0]; // Use the first element of the path array for the field name
            if (!errorMap[field]) {
              errorMap[field] = err.message; // Store only the first message
            }
          });

          // Create a formatted error response with a single message per field
          const formattedErrors = Object.keys(errorMap).map((field) => ({
            field,
            message: errorMap[field],
          }));
          return res.send(
            new responseFormatForErrors(422, false, formattedErrors)
          );
        } else {
          return next(error);
        }
      }
    },
  ];
}
export function validateProductSchema() {
  return [
    (req, res, next) => {
      try {
        // Check if no files are uploaded
        if (!req.files.images || req.files.images.length === 0) {
          return res.send(
            new responseFormatForErrors(401, false, {
              message: "Images cannot be empty",
            })
          );
        }

        // Check if the number of uploaded files is between 1 and 6
        const numberOfFiles = req.files.images.length;
        if (numberOfFiles < 1 || numberOfFiles > 6) {
          return res.send(
            new responseFormatForErrors(401, false, {
              message: "You can only add one to six images",
            })
          );
        }

        // Validate the rest of the form data with Zod schema
        const formData = {
          ...req.body,
          images: req.files.images, // Include the files in the validation object
        };

        addProductSchema.parse(formData);
        next(); // If validation passes, proceed to the next middleware
      } catch (error) {
        if (error instanceof ZodError) {
          const errorMap = {};

          error.errors.forEach((err) => {
            const field = err.path[0]; // Use the first element of the path array for the field name
            if (!errorMap[field]) {
              errorMap[field] = err.message; // Store only the first message
            }
          });

          // Create a formatted error response with a single message per field
          const formattedErrors = Object.keys(errorMap).map((field) => ({
            field,
            message: errorMap[field],
          }));
          return res.send(
            new responseFormatForErrors(422, false, formattedErrors)
          );
        } else {
          return next(error);
        }
      }
    },
  ];
}
