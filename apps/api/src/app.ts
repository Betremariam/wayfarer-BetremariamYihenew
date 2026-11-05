import express from "express";
import cors from "cors";
import { PlaceController } from "./controllers/place.controller.js";
import { ReviewController } from "./controllers/review.controller.js";
import { BookingController } from "./controllers/booking.controller.js";
import { UserController } from "./controllers/user.controller.js";
import { errorHandler } from "./middlewares/error.middleware.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const router = express.Router();

  router.get("/users", UserController.getUsers);
  router.get("/places", PlaceController.getPlaces);
  router.get("/places/:id", PlaceController.getPlaceById);
  router.get("/places/:id/tour-slots", BookingController.getTourSlots);
  router.get("/places/:id/reviews", ReviewController.getReviews);
  router.post("/places/:id/reviews", ReviewController.upsertReview);
  router.put("/places/:id/reviews", ReviewController.upsertReview);
  router.post("/tour-slots/:id/bookings", BookingController.createBooking);

  app.use("/api", router);

  app.use((req, res) => {
    res.status(404).json({
      error: `Cannot ${req.method} ${req.path}`,
      code: "NOT_FOUND",
    });
  });

  app.use(errorHandler);

  return app;
}
