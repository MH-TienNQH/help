export const addProductSchema = {
  name: {
    notEmpty: {
      errorMessage: "Product name can not be empty",
    },
  },
  description: {
    notEmpty: {
      errorMessage: "Product description can not be empty",
    },
  },
  price: {
    notEmpty: {
      errorMessage: "Product price can not be empty",
    },
  },
  cover: {
    notEmpty: {
      errorMessage: "Product cover image can not be empty",
    },
  },
};
