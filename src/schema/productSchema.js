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
};
