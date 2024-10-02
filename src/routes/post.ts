import { Context, Hono } from "hono";
import postController from "../controllers/post";
import { zValidator } from "@hono/zod-validator";
import { CreatePostRequestDtoSchema } from "../model/dto/post/createPostRequest";
import { CommentRequestDtoSchema } from "../model/dto/post/commentRequest";
import post from "../controllers/post";

export const postApp = new Hono();

postApp.post(
  "/create",
  zValidator("json", CreatePostRequestDtoSchema),
  postController.createNewPost
);

postApp.get("/all", postController.getAllPosts);

postApp.post(
  "/comment/add",
  zValidator("json", CommentRequestDtoSchema),
  postController.addNewComment
);

postApp.get("/comment/:id", postController.getAllComment);
