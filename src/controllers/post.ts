import { PrismaClient } from "@prisma/client";
import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { BaseResponse } from "../model/dto/BaseResponse.model";
import { RetrieveAllPostResponseDto } from "../model/dto/post/retrieveAllPostResponseDto";
import {
  CommentDto,
  getAllCommentResponseDto,
} from "../model/dto/post/getAllCommentResponse";
import prisma from "../db/db";

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
    const { page, limit } = c.req.query();
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const offset = (pageNumber - 1) * limitNumber;
    const posts = await prisma.post.findMany({
      skip: pageNumber == 1 ? 0 : offset,
      take: limitNumber,

      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    const mappedPost: RetrieveAllPostResponseDto[] = posts.map((post) => {
      return {
        id: post.id,
        title: post.title,
        content: post.content ?? "",
        createdAt: post.createdAt,
        commentsCount: post._count.comments,
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
  addNewComment: async (c: Context) => {
    const body = await c.req.json();
    const userId = c.get("id");

    if (userId == null) {
      throw new HTTPException(400, {
        message: "Bad Request",
        cause: "User Id not found",
      });
    }

    const post = await prisma.post.findUnique({
      where: {
        id: body.postId,
      },
    });

    if (post == null) {
      throw new HTTPException(404, {
        message: "Not Found",
        cause: "Post not found",
      });
    }

    await prisma.comment.create({
      data: {
        content: body.content,
        postId: body.postId,
        userId: userId,
      },
    });

    const response: BaseResponse<any> = {
      code: 201,
      message: "Comment added successfully",
    };
    return c.json(response, 201);
  },
  getAllComment: async (c: Context) => {
    const post_id = c.req.param("id");

    const post = await prisma.post.findUnique({
      where: {
        id: post_id,
      },
      include: {
        user: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    if (post == null) {
      throw new HTTPException(404, {
        message: "Not Found",
        cause: "Post not found",
      });
    }

    const comments = await prisma.comment.findMany({
      where: {
        postId: post_id,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const mappedComment: CommentDto[] = comments.map((comment) => {
      return {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        user: {
          id: comment.user.id,
          username: comment.user.username,
        },
      };
    });

    const response: BaseResponse<getAllCommentResponseDto> = {
      code: 200,
      data: {
        post: {
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
          commentsCount: post._count.comments,
        },
        comments: mappedComment,
      },
    };

    return c.json(response, 200);
  },
};
