export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code: string = "INTERNAL_SERVER_ERROR", details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation failed", details?: any) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class SlotFullyBookedError extends AppError {
  constructor(message: string = "This tour slot is fully booked") {
    super(message, 409, "SLOT_FULLY_BOOKED");
  }
}

export class InsufficientCapacityError extends AppError {
  constructor(message: string = "Requested seats exceed available capacity") {
    super(message, 409, "INSUFFICIENT_CAPACITY");
  }
}

export class UnauthorizedUserError extends AppError {
  constructor(message: string = "Invalid or missing user identification") {
    super(message, 401, "UNAUTHORIZED_USER");
  }
}
