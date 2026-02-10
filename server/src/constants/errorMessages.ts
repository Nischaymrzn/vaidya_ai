const errorMessages = {
  USER: {
    NOT_FOUND: "User does not exist.",
    CREATION_FAILED: "Failed to create user. Try again.",
    UPDATE_FAILED: "Failed to update user. Check input and retry.",
    DELETION_FAILED: "Failed to delete user. Try again later.",
    INVALID_CREDENTIALS: "Invalid credentials. Check and retry.",
    PASSWORD_NOT_SET:
      "Password not set for this account. Use Google sign-in or reset your password.",
    EXIST: "User with this email already exists.",
    UNAUTHORIZED: "Access denied.",
  },
  NAME: {
    REQUIRED: "Name is required.",
    INVALID: "Name contains invalid characters.",
  },
  TOKEN: {
    NOT_FOUND: "Authentication token missing.",
    INVALID_TOKEN: "Invalid authentication token.",
    TOKEN_USER_NOT_FOUND: "No user found for this token.",
  },
  NUMBER: {
    CONFLICT: "Number already in use.",
    REQUIRED: "Number is required.",
    INVALID: "Invalid Number format.",
  },
  EMAIL: {
    CONFLICT: "Email already registered.",
    REQUIRED: "Email is required.",
    INVALID: "Invalid email format.",
  },
  PASSWORD: {
    REQUIRED: "Password is required.",
    LENGTH: "Password must be 8-16 characters.",
    INVALID: "Password format is invalid.",
  },
  VALIDATION: {
    FAILED: "Validation failed. Check input fields.",
  },
  OTHER: {
    SERVER_ERROR: "Server error. Try again later.",
    INVALID_REQUEST: "Invalid request. Check input.",
  },
};

export default errorMessages;
