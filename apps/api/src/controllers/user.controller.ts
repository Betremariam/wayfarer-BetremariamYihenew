import { Request, Response, NextFunction } from "express";
import { prisma } from "../db.js";

export class UserController {
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({
        where: { isActor: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      });

      return res.status(200).json(
        users.map((u) => ({
          ...u,
          createdAt: u.createdAt.toISOString(),
        }))
      );
    } catch (error) {
      next(error);
    }
  }
}
