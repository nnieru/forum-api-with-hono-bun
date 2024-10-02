import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { RegisterRequestDto } from "../model/dto/user/register";
import { sign } from "hono/jwt";
import { BaseResponse } from "../model/dto/BaseResponse.model";
import { SignInRequestDto, SignInResponseDto } from "../model/dto/user/signin";
import prisma from "../db/db";
import { UpdateUserResponseDto } from "../model/dto/user/updateUserResponse";
import { GetProfileResponseDto } from "../model/dto/user/getProfileResponse";

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

      const user = await prisma.user.create({
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

      const profile = await prisma.userProfile.create({
        data: {
          userId: user.id,
        },
      });

      if (profile == null) {
        throw new HTTPException(500, {
          message: "Internal Server Error",
          cause: "Failed to create profile",
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

    const user = await prisma.user.findFirst({
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

    if (!passwordMatch) {
      throw new HTTPException(401, {
        message: "Unauthorized",
        cause: "Invalid password",
      });
    }
    const exp = Date.now() + 1000 * 60 * 60; // 1 h
    const payload = {
      id: user.id,
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
  updateProfile: async (c: Context) => {
    const userId = await c.get("id");
    console.log(userId);

    if (userId == null) {
      throw new HTTPException(400, {
        message: "Bad Request",
        cause: "User Id not found",
      });
    }

    const body = await c.req.json();

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (user == null) {
      throw new HTTPException(404, {
        message: "Failed to find user",
        cause: "User not found",
      });
    }

    const updatedUser = await prisma.userProfile.update({
      data: {
        avatar: body.avatar,
        bio: body.bio,
        link: body.link,
      },
      where: {
        userId: userId,
      },
    });

    if (updatedUser == null) {
      throw new HTTPException(500, {
        message: "Internal Server Error",
        cause: "Failed to update user",
      });
    }

    const response: BaseResponse<UpdateUserResponseDto> = {
      code: 200,
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName ?? "",
        username: user.username,
        bio: updatedUser.bio,
        link: updatedUser.link,
        avatar: updatedUser.avatar,
      },
    };
    return c.json(response, 200);
  },
  getProfile: async (c: Context) => {
    const userId = c.get("id");
    if (userId == null) {
      throw new HTTPException(400, {
        message: "Bad Request",
        cause: "User Id not found",
      });
    }

    const userProfile = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        profile: true,
      },
    });

    if (userProfile == null) {
      throw new HTTPException(404, {
        message: "Not Found",
        cause: "User not found",
      });
    }
    const response: BaseResponse<GetProfileResponseDto> = {
      code: 200,
      data: {
        id: userProfile.id,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName ?? "",
        username: userProfile.username,
        bio: userProfile.profile?.bio,
        link: userProfile.profile?.link,
        avatar: userProfile.profile?.avatar,
      },
    };

    return c.json(response, 200);
  },
};
