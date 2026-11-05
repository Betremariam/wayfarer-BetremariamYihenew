import { Request, Response, NextFunction } from "express";
import { PlaceService } from "../services/place.service.js";
import { prisma } from "../db.js";
import { PlacesQuerySchema } from "@wayfarer/shared";

const placeService = new PlaceService(prisma);

export class PlaceController {
  static async getPlaces(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedQuery = PlacesQuerySchema.parse(req.query);
      const places = await placeService.getPlaces(validatedQuery);
      return res.status(200).json(places);
    } catch (error) {
      next(error);
    }
  }

  static async getPlaceById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const place = await placeService.getPlaceById(id);
      return res.status(200).json(place);
    } catch (error) {
      next(error);
    }
  }
}

