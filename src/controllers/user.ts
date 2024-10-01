import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { RegisterRequestDto } from "../model/dto/user/resgiter";
import { PrismaClient, User } from "@prisma/client";

const prismaClient = new PrismaClient();

export default {
  register: async (c: Context) => {
    try {
      const body: RegisterRequestDto = await c.req.json();

      if (body.password !== body.confirmPassword) {
        throw new HTTPException(400, {
          message: "Bad Request",
          cause: "Password and Confirm Password must be the same",
        });
      }

      const encryptedPassword = await Bun.password.hash(body.password);

      const user = await prismaClient.user.create({
        data: {
          firstName: body.firstName,
          lastName: body.lastName ?? "",
          email: body.email,
          username: body.username,
          dateOfBirth: new Date(body.dateOfBirth),
          password: encryptedPassword,
        },
      });

      if (user) {
        return c.json({
          code: 201,
          data: user,
          message: "User created successfully",
        });
      }

      throw new HTTPException(500, {
        message: "Internal Server Error",
        cause: "Failed to create user",
      });
    } catch (error: any) {
      throw new HTTPException(error.stausCode, {
        message: error.message,
        cause: error,
      });
    }
  },
};
