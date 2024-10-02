import { Context, Hono } from "hono";
import postController from "../controllers/post";
import { zValidator } from "@hono/zod-validator";
import { CreatePostRequestDtoSchema } from "../model/dto/post/createPostRequest";
import { CommentRequestDtoSchema } from "../model/dto/post/commentRequest";

export const postApp = new Hono();

postApp.get("/", async (c: Context) => {
  const user = c.get("email");
  return c.json({ message: `hello ${user}` });
});

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
