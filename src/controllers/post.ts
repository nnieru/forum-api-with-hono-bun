import { PrismaClient } from "@prisma/client";
import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { BaseResponse } from "../model/dto/BaseResponse.model";
import { RetrieveAllPostResponseDto } from "../model/dto/post/retrieveAllPostResponseDto";

const prisma = new PrismaClient();
export default {
  createNewPost: async (c: Context) => {
    const body = await c.req.json();
    const userId = c.get("id");
    console.log(c.get("email"));

    if (userId == null) {
      throw new HTTPException(400, {
        message: "Bad Request",
        cause: "User Id not found",
      });
    }

    await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        userId: userId,
      },
    });

    const response: BaseResponse<any> = {
      code: 201,
      message: "Post created successfully",
    };

    return c.json(response, 201);
  },
  getAllPosts: async (c: Context) => {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
      },
    });

    const mappedPost: RetrieveAllPostResponseDto[] = posts.map((post) => {
      return {
        id: post.id,
        title: post.title,
        content: post.content ?? "",
        createdAt: post.createdAt,
        user: {
          id: post.user.id,
          firstName: post.user.firstName,
          lastName: post.user.lastName ?? "",
          username: post.user.username,
        },
      };
    });

    const response: BaseResponse<RetrieveAllPostResponseDto[]> = {
      code: 200,
      data: mappedPost,
    };

    return c.json(response, 200);
  },
};
