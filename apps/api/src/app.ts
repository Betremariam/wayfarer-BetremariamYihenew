import express from "express";
import cors from "cors";
import { PlaceController } from "./controllers/place.controller.js";
import { ReviewController } from "./controllers/review.controller.js";
import { BookingController } from "./controllers/booking.controller.js";
import { UserController } from "./controllers/user.controller.js";
import { errorHandler } from "./middlewares/error.middleware.js";

export function createApp() {
  const app = express();

  // Middleware
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  // Health check
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API Routes
  const router = express.Router();

  // Users endpoint (for Acting-as user switcher)
  router.get("/users", UserController.getUsers);

  // Places endpoints
  router.get("/places", PlaceController.getPlaces);
  router.get("/places/:id", PlaceController.getPlaceById);

  // Tour slots under places
  router.get("/places/:id/tour-slots", BookingController.getTourSlots);

  // Reviews endpoints (POST and PUT /api/places/:id/reviews)
  router.get("/places/:id/reviews", ReviewController.getReviews);
  router.post("/places/:id/reviews", ReviewController.upsertReview);
  router.put("/places/:id/reviews", ReviewController.upsertReview);

  // Bookings endpoint (POST /api/tour-slots/:id/bookings)
  router.post("/tour-slots/:id/bookings", BookingController.createBooking);

  // Mount API router
  app.use("/api", router);

  // 404 handler for unknown routes
  app.use((req, res) => {
    res.status(404).json({
      error: `Cannot ${req.method} ${req.path}`,
      code: "NOT_FOUND",
    });
  });

  // Centralized error handler
  app.use(errorHandler);

  return app;
}
