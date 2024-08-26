import { ZodError } from "zod";
import { responseFormatForErrors } from "../utils/responseFormat.js";

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
        return res
          .status(422)
          .send(new responseFormatForErrors(422, false, formattedErrors));
      } else {
        next(error);
      }
    }
    next();
  };
}
