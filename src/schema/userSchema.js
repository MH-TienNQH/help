import { optional } from "valibot";

export const signUpSchema = {
  username: {
    notEmpty: {
      errorMessage: "username can not be empty",
    },
    isString: {
      errorMessage: "username must be a string",
    },
    isLength: {
      options: {
        min: 2,
        max: 20,
      },
      errorMessage: "username must be between 2 to 20 characters",
    },
  },
  email: {
    notEmpty: {
      errorMessage: "email can not be empty",
    },
    isString: {
      errorMessage: "email must be a string",
    },
    isEmail: {
      errorMessage: "please enter a validate email",
    },
  },
  name: {
    notEmpty: {
      errorMessage: "name can not be empty",
    },
    isString: {
      errorMessage: "name must be a string",
    },
    isLength: {
      options: {
        min: 2,
        max: 30,
      },
      errorMessage: "name must be between 2 to 30 characters",
    },
  },
  password: {
    notEmpty: {
      errorMessage: "name can not be empty",
    },
    isString: {
      errorMessage: "name must be a string",
    },
    isLength: {
      options: {
        min: 6,
        max: 30,
      },
      errorMessage: "name must be between 6 to 30 characters",
    },
  },
};

export const loginSchema = {
  email: {
    notEmpty: {
      errorMessage: "email can not be empty",
    },
    isString: {
      errorMessage: "email must be a string",
    },
    isEmail: {
      errorMessage: "please enter a validate email",
    },
  },
  password: {
    notEmpty: {
      errorMessage: "name can not be empty",
    },
    isString: {
      errorMessage: "name must be a string",
    },
  },
};
