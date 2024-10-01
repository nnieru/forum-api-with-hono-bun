import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { RegisterRequestDto } from "../model/dto/user/register";
import { PrismaClient, User } from "@prisma/client";
import { sign } from "hono/jwt";
import { BaseResponse } from "../model/dto/BaseResponse.model";
import { SignInRequestDto, SignInResponseDto } from "../model/dto/user/signin";

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

      if (user == null) {
        throw new HTTPException(500, {
          message: "Internal Server Error",
          cause: "Failed to create user",
        });
      }
      return c.json({
        code: 201,
        data: user,
        message: "User created successfully",
      });
    } catch (error: any) {
      throw new HTTPException(error.stausCode, {
        message: error.message,
        cause: error,
      });
    }
  },
  signIn: async (c: Context) => {
    const body: SignInRequestDto = await c.req.json();

    const user = await prismaClient.user.findFirst({
      where: {
        email: {
          equals: body.email,
        },
      },
    });

    if (user == null) {
      throw new HTTPException(404, {
        message: "Not Found",
        cause: "User not found",
      });
    }

    const passwordMatch = await Bun.password.verify(
      body.password,
      user.password
    );

    console.log(body.password ?? "");
    console.log(user.password);

    if (!passwordMatch) {
      throw new HTTPException(401, {
        message: "Unauthorized",
        cause: "Invalid password",
      });
    }
    const exp = Date.now() + 1000 * 60 * 60; // 1 h
    const payload = {
      email: user.email,
      username: user.username,
      exp: exp, // 1 hour
    };

    const token = await sign(payload, process.env.SECRET_KEY ?? "");

    const response: BaseResponse<SignInResponseDto> = {
      code: 200,
      data: {
        email: user.email,
        username: user.username,
        token: token,
        exp: exp,
      },
    };
    return c.json(response);
  },
};
