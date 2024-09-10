export const statusConstants = Object.freeze({
  1: "PENDING",
  2: "APPROVED",
  3: "REJECTED",
});

export const roleConstants = Object.freeze({
  1: "ADMIN",
  2: "USER",
});

export const paginationConstants = Object.freeze({
  PAGE_NUMBER: 1,
  LIMIT_NUMBER: 5,
});

export const AccountOperationalErrorsConstants = Object.freeze({
  NO_ACCOUNT_ERROR: "No account with this email exists",
  ACCOUNT_NOT_FOUND_ERROR: "No account with this id found",
  INCORRECT_PASSWORD_ERROR: "Incorrect password",
  USERNAME_EXIST_ERROR: "An account with this username already exist",
  EMAIL_EXIST_ERROR: "An account with this email already exist",
  AVATAR_NULL_ERROR: "Please add a avatar",
  MULTIPLE_AVATAR_ERROR: "You can only add one avatar",
});

export const ProductOperationalErrorConstants = Object.freeze({
  PRODUCT_EXIST_ERROR: "A product with this name already exist",
  OUT_OF_BOUND_IMAGES_ERROR: "Please enter from one to six images",
  PRODUCT_NOT_FOUND_ERROR: "No product with this id found",
  PRICE_PRICE_POSITIVE_INTEGER_REQUIRE_ERROR:
    "Price must be a positive whole number",
});

export const OTPOperationalErrorConstants = Object.freeze({
  OTP_PROMPT_4_DIGIT: "Please enter a 4-digit OTP",
  INCORRECT_OTP_ERROR: "Incorrect OTP",
  OTP_EXPIRED_ERROR: "OTP expired",
});

export const FieldOperationalErrorConstants = Object.freeze({
  EMPTY_FIELD_ERROR: "Please enter the information in this field",
  USERNAME_LENGTH_REQUIREMENT_ERROR:
    "Username must be between 2 and 20 characters long",
  EMAIL_REQUIREMENT_ERROR: "Please enter a valid email",
  NAME_LENGTH_REQUIREMENT_ERROR:
    "Name must be between 2 and 30 characters long",
  PASSWORD_MIN_LENGTH_MESSAGE: "Password must be at least 8 characters long.",
  PASSWORD_UPPERCASE_MESSAGE:
    "Password must contain at least one uppercase letter.",
  PASSWORD_LOWERCASE_MESSAGE:
    "Password must contain at least one lowercase letter.",
  PASSWORD_DIGIT_MESSAGE: "Password must contain at least one number.",
  PASSWORD_SPECIAL_CHAR_MESSAGE:
    "Password must contain at least one special character.",
});

export const AuthOperationalErrorConstants = Object.freeze({
  TOKEN_EXPIRED_ERROR:
    "Token has expired. Please log in again to obtain a new token.",
  NOT_AUTHORIZED_ERROR: "You are not authorized to complete this action",
  NOT_VERIFIED_ERROR: "Verify your account first",
  NOT_LOGGED_IN_ERROR: "Log in first",
});

export const CategoryOperationalErrorConstant = Object.freeze({
  CATEGORY_NOT_FOUND_ERROR: "No category with this id was found",
  CATEGORY_EXIST_ERROR: "A category with this name already exist",
});

export const CommentOperationalErrorConstant = Object.freeze({
  COMMENT_NOT_FOUND: "No comment with this id is found",
});

export const NotificationOperationalErrorConstants = Object.freeze({
  NOTIFICATION_NOT_FOUND_ERROR: "No notification with this id is found",
});

export const RequestOperationalErrorConstants = Object.freeze({
  REQUEST_NOT_FOUND: "Buy request with this id is not found",
});
